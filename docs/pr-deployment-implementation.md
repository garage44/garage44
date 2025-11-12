# PR Deployment Implementation Guide

This document provides concrete implementation code for the secure PR deployment system described in `pr-deployment.md`.

## File Structure

```
packages/malkovich/lib/
├── pr-deploy.ts          # PR deployment manager
├── pr-cleanup.ts         # Cleanup utilities
├── pr-registry.ts        # Deployment registry
└── webhook.ts            # Enhanced webhook handler (modified)

deploy/
├── pr-systemd-template.service    # Systemd template
├── pr-nginx-template.conf         # Nginx template
└── pr-cleanup.timer              # Systemd timer for cleanup

.github/workflows/
└── pr-deploy.yml         # GitHub Actions workflow
```

## Implementation Code

### 1. PR Registry (`packages/malkovich/lib/pr-registry.ts`)

```typescript
import {existsSync, readFileSync, writeFileSync} from 'fs'
import {homedir} from 'os'
import path from 'path'

const REGISTRY_PATH = path.join(homedir(), '.pr-deployments.json')

export interface PRDeployment {
    number: number
    head_ref: string
    head_sha: string
    author: string
    created: number
    updated: number
    directory: string
    ports: {
        expressio: number
        pyrite: number
        malkovich: number
    }
    token: string
    status: 'deploying' | 'running' | 'failed' | 'cleaning'
}

export interface PRRegistry {
    [prNumber: string]: PRDeployment
}

export async function loadPRRegistry(): Promise<PRRegistry> {
    if (!existsSync(REGISTRY_PATH)) {
        return {}
    }
    
    try {
        const content = readFileSync(REGISTRY_PATH, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.error('[pr-registry] Failed to load registry:', error)
        return {}
    }
}

export async function savePRRegistry(registry: PRRegistry): Promise<void> {
    try {
        writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8')
    } catch (error) {
        console.error('[pr-registry] Failed to save registry:', error)
        throw error
    }
}

export async function addPRDeployment(deployment: PRDeployment): Promise<void> {
    const registry = await loadPRRegistry()
    registry[deployment.number] = deployment
    await savePRRegistry(registry)
}

export async function updatePRDeployment(
    prNumber: number,
    updates: Partial<PRDeployment>
): Promise<void> {
    const registry = await loadPRRegistry()
    if (registry[prNumber]) {
        registry[prNumber] = {
            ...registry[prNumber],
            ...updates,
            updated: Date.now(),
        }
        await savePRRegistry(registry)
    }
}

export async function removePRDeployment(prNumber: number): Promise<void> {
    const registry = await loadPRRegistry()
    delete registry[prNumber]
    await savePRRegistry(registry)
}

export async function getPRDeployment(prNumber: number): Promise<PRDeployment | null> {
    const registry = await loadPRRegistry()
    return registry[prNumber] || null
}

export async function listActivePRDeployments(): Promise<PRDeployment[]> {
    const registry = await loadPRRegistry()
    return Object.values(registry).filter(d => d.status === 'running')
}
```

### 2. PR Deployment Manager (`packages/malkovich/lib/pr-deploy.ts`)

```typescript
import {$} from 'bun'
import {existsSync, mkdirSync, writeFileSync} from 'fs'
import {homedir} from 'os'
import path from 'path'
import {
    addPRDeployment,
    getPRDeployment,
    updatePRDeployment,
    type PRDeployment,
} from './pr-registry'

const PR_DEPLOYMENTS_DIR = path.join(homedir(), 'garage44')
const PR_PORT_BASE = 40000
const PR_PORT_RANGE = 10000
const MAIN_REPO_PATH = process.env.REPO_PATH || path.join(homedir(), 'garage44')

export interface PRMetadata {
    number: number
    head_ref: string
    head_sha: string
    is_fork: boolean
    author: string
    repo_full_name: string
}

/**
 * Validate PR source for deployment
 */
export function validatePRSource(pr: PRMetadata): 'trusted' | 'review-required' | 'untrusted' {
    // Reject forks (for now - can be made configurable)
    if (pr.is_fork) {
        console.log(`[pr-deploy] PR #${pr.number} is from a fork, requires review`)
        return 'review-required'
    }
    
    // Additional validations can be added here:
    // - Check if author is a collaborator
    // - Check branch naming conventions
    // - Check PR labels
    
    return 'trusted'
}

/**
 * Allocate ports for PR deployment
 */
export function allocatePRPorts(prNumber: number): {
    expressio: number
    pyrite: number
    malkovich: number
} {
    const base = PR_PORT_BASE + ((prNumber % PR_PORT_RANGE) * 3)
    return {
        expressio: base,
        malkovich: base + 1,
        pyrite: base + 2,
    }
}

/**
 * Generate access token for PR deployment
 */
export function generatePRToken(prNumber: number): string {
    const secret = process.env.PR_DEPLOYMENT_SECRET || process.env.WEBHOOK_SECRET || ''
    const data = `pr-${prNumber}-${Date.now()}`
    
    // Use Bun's built-in crypto
    const encoder = new TextEncoder()
    const key = encoder.encode(secret)
    const message = encoder.encode(data)
    
    return crypto.subtle
        .importKey('raw', key, {hash: 'SHA-256', name: 'HMAC'}, false, ['sign'])
        .then((cryptoKey) => crypto.subtle.sign('HMAC', cryptoKey, message))
        .then((signature) =>
            Array.from(new Uint8Array(signature))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('')
                .slice(0, 32)
        )
        .then((hash) => hash)
        .catch(() => {
            // Fallback to simple hash
            return `pr-${prNumber}-token`
        })
}

/**
 * Deploy a PR branch
 */
export async function deployPR(pr: PRMetadata): Promise<{
    deployment: PRDeployment | null
    message: string
    success: boolean
}> {
    try {
        console.log(`[pr-deploy] Starting deployment for PR #${pr.number}`)
        
        // Validate PR source
        const trustLevel = validatePRSource(pr)
        if (trustLevel !== 'trusted') {
            return {
                deployment: null,
                message: `PR #${pr.number} requires manual approval (${trustLevel})`,
                success: false,
            }
        }
        
        // Check if already deployed
        const existing = await getPRDeployment(pr.number)
        if (existing && existing.status === 'running') {
            console.log(`[pr-deploy] PR #${pr.number} already deployed, updating...`)
            return await updatePRDeployment(pr)
        }
        
        // Create deployment directory
        const prDir = path.join(PR_DEPLOYMENTS_DIR, `pr-${pr.number}`)
        const repoDir = path.join(prDir, 'repo')
        const logsDir = path.join(prDir, 'logs')
        
        if (!existsSync(prDir)) {
            mkdirSync(prDir, {recursive: true})
        }
        if (!existsSync(logsDir)) {
            mkdirSync(logsDir, {recursive: true})
        }
        
        // Allocate ports
        const ports = allocatePRPorts(pr.number)
        
        // Generate access token
        const token = await generatePRToken(pr.number)
        
        // Create deployment record
        const deployment: PRDeployment = {
            author: pr.author,
            created: Date.now(),
            directory: prDir,
            head_ref: pr.head_ref,
            head_sha: pr.head_sha,
            number: pr.number,
            ports,
            status: 'deploying',
            token,
            updated: Date.now(),
        }
        
        await addPRDeployment(deployment)
        
        // Clone or pull repository
        if (!existsSync(repoDir)) {
            console.log(`[pr-deploy] Cloning repository...`)
            const cloneResult = await $`git clone ${MAIN_REPO_PATH} ${repoDir}`.quiet()
            if (cloneResult.exitCode !== 0) {
                await updatePRDeployment(pr.number, {status: 'failed'})
                throw new Error('Failed to clone repository')
            }
        }
        
        // Fetch and checkout PR branch
        console.log(`[pr-deploy] Checking out PR branch ${pr.head_ref}...`)
        process.chdir(repoDir)
        
        const fetchResult = await $`git fetch origin ${pr.head_ref}`.quiet()
        if (fetchResult.exitCode !== 0) {
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error('Failed to fetch PR branch')
        }
        
        const checkoutResult = await $`git checkout ${pr.head_sha}`.quiet()
        if (checkoutResult.exitCode !== 0) {
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error('Failed to checkout PR commit')
        }
        
        // Install dependencies
        console.log(`[pr-deploy] Installing dependencies...`)
        const installResult = await $`bun install`.quiet()
        if (installResult.exitCode !== 0) {
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error('Failed to install dependencies')
        }
        
        // Build packages
        console.log(`[pr-deploy] Building packages...`)
        const buildResult = await $`bun run build`.quiet()
        if (buildResult.exitCode !== 0) {
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error('Build failed')
        }
        
        // Generate systemd service files
        await generateSystemdServices(deployment)
        
        // Generate nginx configuration
        await generateNginxConfig(deployment)
        
        // Start services
        console.log(`[pr-deploy] Starting services...`)
        const services = ['expressio', 'pyrite', 'malkovich']
        for (const service of services) {
            const startResult = await $`sudo systemctl start pr-${pr.number}-${service}.service`.quiet()
            if (startResult.exitCode !== 0) {
                console.warn(`[pr-deploy] Failed to start ${service} service`)
            }
        }
        
        // Update deployment status
        await updatePRDeployment(pr.number, {status: 'running'})
        
        const deploymentUrl = `https://pr-${pr.number}.garage44.org?token=${token}`
        
        console.log(`[pr-deploy] PR #${pr.number} deployed successfully`)
        console.log(`[pr-deploy] URL: ${deploymentUrl}`)
        
        return {
            deployment: {
                ...deployment,
                status: 'running',
            },
            message: `PR #${pr.number} deployed successfully`,
            success: true,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[pr-deploy] Deployment failed: ${message}`)
        return {
            deployment: null,
            message: `Deployment failed: ${message}`,
            success: false,
        }
    }
}

/**
 * Update an existing PR deployment
 */
async function updatePRDeployment(pr: PRMetadata): Promise<{
    deployment: PRDeployment | null
    message: string
    success: boolean
}> {
    const existing = await getPRDeployment(pr.number)
    if (!existing) {
        return {
            deployment: null,
            message: `PR #${pr.number} not found`,
            success: false,
        }
    }
    
    try {
        console.log(`[pr-deploy] Updating PR #${pr.number}...`)
        
        const repoDir = path.join(existing.directory, 'repo')
        process.chdir(repoDir)
        
        // Fetch and checkout new commit
        await $`git fetch origin ${pr.head_ref}`.quiet()
        await $`git checkout ${pr.head_sha}`.quiet()
        
        // Rebuild
        await $`bun install`.quiet()
        await $`bun run build`.quiet()
        
        // Restart services
        const services = ['expressio', 'pyrite', 'malkovich']
        for (const service of services) {
            await $`sudo systemctl restart pr-${pr.number}-${service}.service`.quiet()
        }
        
        // Update deployment record
        await updatePRDeployment(pr.number, {
            head_sha: pr.head_sha,
            status: 'running',
        })
        
        console.log(`[pr-deploy] PR #${pr.number} updated successfully`)
        
        return {
            deployment: existing,
            message: `PR #${pr.number} updated successfully`,
            success: true,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[pr-deploy] Update failed: ${message}`)
        return {
            deployment: null,
            message: `Update failed: ${message}`,
            success: false,
        }
    }
}

/**
 * Generate systemd service files for PR deployment
 */
async function generateSystemdServices(deployment: PRDeployment): Promise<void> {
    const services = [
        {
            name: 'expressio',
            port: deployment.ports.expressio,
            workdir: path.join(deployment.directory, 'repo/packages/expressio'),
        },
        {
            name: 'pyrite',
            port: deployment.ports.pyrite,
            workdir: path.join(deployment.directory, 'repo/packages/pyrite'),
        },
        {
            name: 'malkovich',
            port: deployment.ports.malkovich,
            workdir: path.join(deployment.directory, 'repo/packages/malkovich'),
        },
    ]
    
    for (const service of services) {
        const serviceFile = `/etc/systemd/system/pr-${deployment.number}-${service.name}.service`
        const content = `[Unit]
Description=PR #${deployment.number} ${service.name} service
After=network.target

[Service]
Type=simple
User=garage44
Group=garage44
WorkingDirectory=${service.workdir}
Environment="NODE_ENV=production"
Environment="BUN_ENV=production"
Environment="PATH=/home/garage44/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/garage44/.bun/bin/bun run server -- --port ${service.port}
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Resource limits for PR deployments
MemoryMax=512M
MemoryHigh=400M
CPUQuota=50%
TasksMax=100

[Install]
WantedBy=multi-user.target
`
        
        writeFileSync(serviceFile, content, 'utf-8')
    }
    
    // Reload systemd
    await $`sudo systemctl daemon-reload`.quiet()
}

/**
 * Generate nginx configuration for PR deployment
 */
async function generateNginxConfig(deployment: PRDeployment): Promise<void> {
    const domain = `pr-${deployment.number}.garage44.org`
    const configFile = `/etc/nginx/sites-available/${domain}`
    const enabledLink = `/etc/nginx/sites-enabled/${domain}`
    
    const content = `# PR #${deployment.number} deployment
server {
    listen 80;
    server_name ${domain};
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name ${domain};
    
    # Wildcard SSL certificate
    ssl_certificate /etc/letsencrypt/live/garage44.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/garage44.org/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Token-based authentication
    set $valid_token "";
    if ($arg_token = "${deployment.token}") {
        set $valid_token "1";
    }
    if ($http_x_pr_token = "${deployment.token}") {
        set $valid_token "1";
    }
    if ($valid_token != "1") {
        return 403 "Access denied. Token required.";
    }
    
    # Malkovich (main)
    location / {
        proxy_pass http://localhost:${deployment.ports.malkovich};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:${deployment.ports.malkovich};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
`
    
    writeFileSync(configFile, content, 'utf-8')
    
    // Create symlink if it doesn't exist
    if (!existsSync(enabledLink)) {
        await $`sudo ln -s ${configFile} ${enabledLink}`.quiet()
    }
    
    // Reload nginx
    await $`sudo nginx -s reload`.quiet()
}
```

### 3. PR Cleanup (`packages/malkovich/lib/pr-cleanup.ts`)

```typescript
import {$} from 'bun'
import {existsSync} from 'fs'
import {
    getPRDeployment,
    listActivePRDeployments,
    loadPRRegistry,
    removePRDeployment,
    updatePRDeployment,
} from './pr-registry'

/**
 * Cleanup a specific PR deployment
 */
export async function cleanupPRDeployment(prNumber: number): Promise<{
    message: string
    success: boolean
}> {
    try {
        console.log(`[pr-cleanup] Cleaning up PR #${prNumber}...`)
        
        const deployment = await getPRDeployment(prNumber)
        if (!deployment) {
            return {
                message: `PR #${prNumber} not found`,
                success: false,
            }
        }
        
        // Update status
        await updatePRDeployment(prNumber, {status: 'cleaning'})
        
        // Stop systemd services
        const services = ['expressio', 'pyrite', 'malkovich']
        for (const service of services) {
            try {
                await $`sudo systemctl stop pr-${prNumber}-${service}.service`.quiet()
                console.log(`[pr-cleanup] Stopped ${service} service`)
            } catch (error) {
                console.warn(`[pr-cleanup] Failed to stop ${service} service:`, error)
            }
        }
        
        // Remove systemd units
        for (const service of services) {
            try {
                const serviceFile = `/etc/systemd/system/pr-${prNumber}-${service}.service`
                if (existsSync(serviceFile)) {
                    await $`sudo rm -f ${serviceFile}`.quiet()
                }
            } catch (error) {
                console.warn(`[pr-cleanup] Failed to remove ${service} unit:`, error)
            }
        }
        
        await $`sudo systemctl daemon-reload`.quiet()
        
        // Remove nginx configuration
        try {
            const domain = `pr-${prNumber}.garage44.org`
            await $`sudo rm -f /etc/nginx/sites-enabled/${domain}`.quiet()
            await $`sudo rm -f /etc/nginx/sites-available/${domain}`.quiet()
            await $`sudo nginx -s reload`.quiet()
            console.log(`[pr-cleanup] Removed nginx configuration`)
        } catch (error) {
            console.warn(`[pr-cleanup] Failed to remove nginx config:`, error)
        }
        
        // Remove deployment directory
        try {
            await $`rm -rf ${deployment.directory}`.quiet()
            console.log(`[pr-cleanup] Removed deployment directory`)
        } catch (error) {
            console.warn(`[pr-cleanup] Failed to remove directory:`, error)
        }
        
        // Remove from registry
        await removePRDeployment(prNumber)
        
        console.log(`[pr-cleanup] PR #${prNumber} cleaned up successfully`)
        
        return {
            message: `PR #${prNumber} cleaned up successfully`,
            success: true,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[pr-cleanup] Cleanup failed: ${message}`)
        return {
            message: `Cleanup failed: ${message}`,
            success: false,
        }
    }
}

/**
 * Cleanup stale PR deployments (older than maxAge)
 */
export async function cleanupStaleDeployments(
    maxAgeDays: number = 7
): Promise<{cleaned: number; message: string}> {
    try {
        console.log(`[pr-cleanup] Checking for stale deployments (max age: ${maxAgeDays} days)...`)
        
        const registry = await loadPRRegistry()
        const maxAge = maxAgeDays * 24 * 60 * 60 * 1000
        const now = Date.now()
        
        let cleaned = 0
        for (const [prNumber, deployment] of Object.entries(registry)) {
            const age = now - deployment.created
            if (age > maxAge) {
                console.log(`[pr-cleanup] PR #${prNumber} is stale (${Math.round(age / (24 * 60 * 60 * 1000))} days old)`)
                const result = await cleanupPRDeployment(Number(prNumber))
                if (result.success) {
                    cleaned++
                }
            }
        }
        
        const message = cleaned > 0
            ? `Cleaned up ${cleaned} stale deployment(s)`
            : 'No stale deployments found'
        
        console.log(`[pr-cleanup] ${message}`)
        
        return {cleaned, message}
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[pr-cleanup] Stale cleanup failed: ${message}`)
        return {cleaned: 0, message: `Cleanup failed: ${message}`}
    }
}

/**
 * List all PR deployments
 */
export async function listPRDeployments(): Promise<void> {
    const deployments = await listActivePRDeployments()
    
    if (deployments.length === 0) {
        console.log('No active PR deployments')
        return
    }
    
    console.log(`\nActive PR Deployments (${deployments.length}):\n`)
    
    for (const deployment of deployments) {
        const ageHours = Math.round((Date.now() - deployment.created) / (60 * 60 * 1000))
        console.log(`PR #${deployment.number}:`)
        console.log(`  Branch: ${deployment.head_ref}`)
        console.log(`  Author: ${deployment.author}`)
        console.log(`  Age: ${ageHours} hours`)
        console.log(`  URL: https://pr-${deployment.number}.garage44.org?token=${deployment.token}`)
        console.log(`  Ports: ${deployment.ports.malkovich} (malkovich), ${deployment.ports.expressio} (expressio), ${deployment.ports.pyrite} (pyrite)`)
        console.log(`  Status: ${deployment.status}`)
        console.log('')
    }
}
```

### 4. Enhanced Webhook Handler (modify existing `packages/malkovich/lib/webhook.ts`)

Add this to the existing webhook handler:

```typescript
// Add to imports
import {cleanupPRDeployment, deployPR, type PRMetadata} from './pr-deploy'

// Add new handler function (insert before handleWebhook)
async function handlePullRequestEvent(event: any): Promise<Response> {
    const action = event.action
    const prNumber = event.pull_request?.number
    
    if (!prNumber) {
        return new Response(JSON.stringify({error: 'Missing PR number'}), {
            headers: {'Content-Type': 'application/json'},
            status: 400,
        })
    }
    
    console.log(`[webhook] PR #${prNumber} event: ${action}`)
    
    // Handle PR close/merge - cleanup
    if (action === 'closed') {
        const result = await cleanupPRDeployment(prNumber)
        return new Response(JSON.stringify(result), {
            headers: {'Content-Type': 'application/json'},
            status: result.success ? 200 : 500,
        })
    }
    
    // Handle PR open/sync - deploy
    if (action === 'opened' || action === 'synchronize' || action === 'reopened') {
        const pr: PRMetadata = {
            author: event.pull_request.user.login,
            head_ref: event.pull_request.head.ref,
            head_sha: event.pull_request.head.sha,
            is_fork: event.pull_request.head.repo.fork,
            number: prNumber,
            repo_full_name: event.pull_request.head.repo.full_name,
        }
        
        // Deploy asynchronously
        deployPR(pr).then((result) => {
            if (result.success) {
                console.log(`[webhook] PR #${prNumber} deployment successful`)
            } else {
                console.error(`[webhook] PR #${prNumber} deployment failed: ${result.message}`)
            }
        }).catch((error) => {
            console.error(`[webhook] PR #${prNumber} deployment error:`, error)
        })
        
        return new Response(JSON.stringify({
            message: `PR #${prNumber} deployment triggered`,
            timestamp: new Date().toISOString(),
        }), {
            headers: {'Content-Type': 'application/json'},
            status: 202,
        })
    }
    
    // Ignore other actions
    return new Response(JSON.stringify({
        message: `Ignored PR action: ${action}`,
    }), {
        headers: {'Content-Type': 'application/json'},
        status: 200,
    })
}

// Modify handleWebhook function - add this after eventType check:
export async function handleWebhook(req: Request): Promise<Response> {
    // ... existing validation code ...
    
    // Check event type
    const eventType = req.headers.get('x-github-event')
    
    // Handle pull request events
    if (eventType === 'pull_request') {
        return await handlePullRequestEvent(event)
    }
    
    // Handle push events (existing main branch deployment)
    if (eventType !== 'push') {
        return new Response(JSON.stringify({message: `Ignored: event type ${eventType}`}), {
            headers: {'Content-Type': 'application/json'},
            status: 200,
        })
    }
    
    // ... rest of existing code for main branch deployment ...
}
```

### 5. GitHub Actions Workflow (`.github/workflows/pr-deploy.yml`)

```yaml
name: PR Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

jobs:
  deploy:
    name: Deploy or Cleanup PR
    runs-on: ubuntu-latest
    
    # Skip deployment for forks (security)
    if: github.event.pull_request.head.repo.full_name == github.repository
    
    steps:
      - name: Deploy PR
        if: github.event.action != 'closed'
        id: deploy
        env:
          WEBHOOK_URL: ${{ secrets.WEBHOOK_URL }}
          WEBHOOK_SECRET: ${{ secrets.WEBHOOK_SECRET }}
        run: |
          # Create PR deployment payload
          PAYLOAD=$(jq -nc \
            --arg action "${{ github.event.action }}" \
            --argjson pr '{
              "number": ${{ github.event.pull_request.number }},
              "head": {
                "ref": "${{ github.head_ref }}",
                "sha": "${{ github.event.pull_request.head.sha }}",
                "repo": {
                  "fork": ${{ github.event.pull_request.head.repo.fork }},
                  "full_name": "${{ github.event.pull_request.head.repo.full_name }}"
                }
              },
              "user": {
                "login": "${{ github.event.pull_request.user.login }}"
              }
            }' \
            '{
              "action": $action,
              "pull_request": $pr
            }')
          
          # Calculate HMAC signature
          SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p -c 256)
          
          # Send webhook
          RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -H "X-GitHub-Event: pull_request" \
            -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
            -d "$PAYLOAD")
          
          HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
          BODY=$(echo "$RESPONSE" | head -n-1)
          
          echo "Response body: $BODY"
          echo "HTTP code: $HTTP_CODE"
          
          if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
            echo "✅ PR deployment triggered (HTTP $HTTP_CODE)"
            
            # Store for comment step
            echo "deployment_triggered=true" >> $GITHUB_OUTPUT
          else
            echo "❌ PR deployment failed (HTTP $HTTP_CODE)"
            exit 1
          fi
      
      - name: Wait for deployment
        if: steps.deploy.outputs.deployment_triggered == 'true'
        run: |
          echo "Waiting 30 seconds for deployment to complete..."
          sleep 30
      
      - name: Comment PR with deployment URL
        if: steps.deploy.outputs.deployment_triggered == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            const prNumber = context.payload.pull_request.number;
            const domain = `pr-${prNumber}.garage44.org`;
            
            const body = `🚀 **PR Deployment Available**\n\n` +
              `Your changes have been deployed for testing:\n\n` +
              `- **Malkovich**: https://${domain}?token=<see-logs>\n` +
              `- **Expressio**: https://expressio.${domain}?token=<see-logs>\n` +
              `- **Pyrite**: https://pyrite.${domain}?token=<see-logs>\n\n` +
              `⚠️ Note: Access tokens are available in the deployment logs.\n\n` +
              `_This deployment will be automatically cleaned up when the PR is closed or after 7 days._`;
            
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: prNumber,
              body: body
            });
      
      - name: Cleanup PR Deployment
        if: github.event.action == 'closed'
        env:
          WEBHOOK_URL: ${{ secrets.WEBHOOK_URL }}
          WEBHOOK_SECRET: ${{ secrets.WEBHOOK_SECRET }}
        run: |
          # Cleanup payload
          PAYLOAD=$(jq -nc \
            --argjson pr '{
              "number": ${{ github.event.pull_request.number }}
            }' \
            '{
              "action": "closed",
              "pull_request": $pr
            }')
          
          # Calculate signature
          SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p -c 256)
          
          # Send webhook
          RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -H "X-GitHub-Event: pull_request" \
            -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
            -d "$PAYLOAD")
          
          HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
          
          if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
            echo "✅ PR deployment cleaned up (HTTP $HTTP_CODE)"
          else
            echo "⚠️ Cleanup request sent but may have failed (HTTP $HTTP_CODE)"
          fi
```

### 6. Systemd Cleanup Timer (`deploy/pr-cleanup.timer`)

```ini
[Unit]
Description=Cleanup stale PR deployments
Documentation=https://github.com/your-org/garage44

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

### 7. Systemd Cleanup Service (`deploy/pr-cleanup.service`)

```ini
[Unit]
Description=Cleanup stale PR deployments
After=network.target

[Service]
Type=oneshot
User=garage44
Group=garage44
WorkingDirectory=/home/garage44/garage44/packages/malkovich
Environment="PATH=/home/garage44/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/garage44/.bun/bin/bun run cleanup-stale-prs
StandardOutput=journal
StandardError=journal
```

### 8. Add CLI Commands to Malkovich

Add to `packages/malkovich/service.ts`:

```typescript
// Add new commands
cli.command('list-pr-deployments', 'List all active PR deployments', async () => {
    const {listPRDeployments} = await import('./lib/pr-cleanup')
    await listPRDeployments()
})

cli.command('cleanup-pr', 'Cleanup a specific PR deployment', (yargs) =>
    yargs.option('number', {
        demandOption: true,
        describe: 'PR number to cleanup',
        type: 'number',
    })
, async (argv) => {
    const {cleanupPRDeployment} = await import('./lib/pr-cleanup')
    const result = await cleanupPRDeployment(argv.number)
    console.log(result.message)
    process.exit(result.success ? 0 : 1)
})

cli.command('cleanup-stale-prs', 'Cleanup stale PR deployments', (yargs) =>
    yargs.option('max-age-days', {
        default: 7,
        describe: 'Maximum age in days',
        type: 'number',
    })
, async (argv) => {
    const {cleanupStaleDeployments} = await import('./lib/pr-cleanup')
    const result = await cleanupStaleDeployments(argv.maxAgeDays)
    console.log(result.message)
})
```

## Installation Steps

1. **Setup wildcard SSL certificate:**
```bash
sudo certbot certonly --standalone -d "*.garage44.org" -d garage44.org
```

2. **Set PR deployment secret:**
```bash
echo 'export PR_DEPLOYMENT_SECRET="<random-secret>"' >> ~/.bashrc
```

3. **Install cleanup timer:**
```bash
sudo cp deploy/pr-cleanup.timer /etc/systemd/system/
sudo cp deploy/pr-cleanup.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pr-cleanup.timer
sudo systemctl start pr-cleanup.timer
```

4. **Update sudo permissions:**
```bash
sudo visudo
# Add:
# garage44 ALL=(ALL) NOPASSWD: /bin/systemctl start pr-*, /bin/systemctl stop pr-*, /bin/systemctl restart pr-*, /bin/systemctl daemon-reload, /usr/sbin/nginx -s reload, /bin/rm -f /etc/systemd/system/pr-*.service, /bin/rm -f /etc/nginx/sites-*/pr-*.garage44.org, /bin/ln -s /etc/nginx/sites-available/pr-*.garage44.org /etc/nginx/sites-enabled/pr-*.garage44.org
```

5. **Test PR deployment:**
```bash
# List deployments
bun run malkovich list-pr-deployments

# Manual cleanup
bun run malkovich cleanup-pr --number 123

# Cleanup stale
bun run malkovich cleanup-stale-prs --max-age-days 7
```

## Security Checklist

- [ ] Wildcard SSL certificate obtained
- [ ] PR_DEPLOYMENT_SECRET configured
- [ ] Fork PRs blocked in GitHub Actions
- [ ] Resource limits configured in systemd templates
- [ ] Cleanup timer enabled
- [ ] Sudo permissions restricted to necessary commands
- [ ] Access tokens generated per deployment
- [ ] Deployment directory isolated
- [ ] Port range allocated (40000-49999)
- [ ] Nginx token authentication configured

## Monitoring

Monitor PR deployments:

```bash
# View active deployments
bun run malkovich list-pr-deployments

# View logs
sudo journalctl -u pr-123-malkovich.service -f

# Check resource usage
systemctl status pr-123-malkovich.service

# View cleanup timer
systemctl status pr-cleanup.timer
systemctl list-timers
```

## Troubleshooting

**Deployment fails to start:**
- Check logs: `sudo journalctl -u pr-123-malkovich.service`
- Verify ports are available: `netstat -tulpn | grep 40`
- Check directory permissions

**Can't access PR deployment:**
- Verify nginx config: `sudo nginx -t`
- Check token in URL
- Verify DNS points to VPS
- Check SSL certificate: `sudo certbot certificates`

**Cleanup fails:**
- Check sudo permissions
- Verify systemd units exist: `systemctl list-units pr-*`
- Check directory ownership

## Next Steps

After implementing, consider:
1. Add deployment status dashboard in Malkovich UI
2. Implement deployment notifications (Slack, Discord)
3. Add resource usage metrics
4. Create deployment API for programmatic access
5. Consider containerization for better isolation
