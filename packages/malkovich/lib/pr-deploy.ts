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
import {extractWorkspacePackages, isApplicationPackage} from './workspace'

const PR_DEPLOYMENTS_DIR = path.join(homedir(), 'garage44')
const PR_PORT_BASE = 40000
const PR_PORT_RANGE = 10000
const MAIN_REPO_PATH = process.env.REPO_PATH || path.join(homedir(), 'garage44/garage44')

export interface PRMetadata {
    author: string
    head_ref: string
    head_sha: string
    is_fork: boolean
    number: number
    repo_full_name: string
}

/**
 * Validate PR source for deployment
 */
export function validatePRSource(pr: PRMetadata): 'trusted' | 'untrusted' {
    // Block forks completely - only contributors allowed
    if (pr.is_fork) {
        console.log(`[pr-deploy] PR #${pr.number} is from a fork, deployment blocked`)
        return 'untrusted'
    }

    // Main repo PRs are trusted and get public access
    return 'trusted'
}

/**
 * Allocate ports for PR deployment
 */
export function allocatePRPorts(prNumber: number): {
    expressio: number
    malkovich: number
    pyrite: number
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
export async function generatePRToken(prNumber: number): Promise<string> {
    const secret = process.env.PR_DEPLOYMENT_SECRET || process.env.WEBHOOK_SECRET || ''
    const data = `pr-${prNumber}-${Date.now()}`

    // Use Bun's built-in crypto
    const encoder = new TextEncoder()
    const key = encoder.encode(secret)
    const message = encoder.encode(data)

    try {
        const cryptoKey = await crypto.subtle.importKey('raw', key, {hash: 'SHA-256', name: 'HMAC'}, false, ['sign'])
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, message)
        return Array.from(new Uint8Array(signature))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
            .slice(0, 32)
    } catch {
        // Fallback to simple hash
        return `pr-${prNumber}-token`
    }
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

        // Validate PR source - block forks completely
        const trustLevel = validatePRSource(pr)
        if (trustLevel !== 'trusted') {
            return {
                deployment: null,
                message: `PR #${pr.number} blocked - only contributor PRs allowed (no forks)`,
                success: false,
            }
        }

        // Check if already deployed
        const existing = await getPRDeployment(pr.number)
        if (existing && existing.status === 'running') {
            console.log(`[pr-deploy] PR #${pr.number} already deployed, updating...`)
            return await updateExistingPRDeployment(pr)
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
            console.log('[pr-deploy] Cloning repository...')
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
        console.log('[pr-deploy] Installing dependencies...')
        const installResult = await $`bun install`.quiet()
        if (installResult.exitCode !== 0) {
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error('Failed to install dependencies')
        }

        // Build packages
        console.log('[pr-deploy] Building packages...')
        const buildResult = await $`bun run build`.quiet()
        if (buildResult.exitCode !== 0) {
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error('Build failed')
        }

        // Discover which packages to deploy
        const allPackages = extractWorkspacePackages(repoDir)
        const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))
        const packagesToDeploy = [...appPackages, 'malkovich'] // Always include malkovich

        console.log(`[pr-deploy] Discovered packages to deploy: ${packagesToDeploy.join(', ')}`)

        // Generate systemd service files
        await generateSystemdServices(deployment, packagesToDeploy)

        // Generate nginx configuration
        await generateNginxConfig(deployment, packagesToDeploy)

        // Start services
        console.log('[pr-deploy] Starting services...')
        for (const packageName of packagesToDeploy) {
            const startResult = await $`sudo systemctl start pr-${pr.number}-${packageName}.service`.quiet()
            if (startResult.exitCode !== 0) {
                console.warn(`[pr-deploy] Failed to start ${packageName} service`)
            } else {
                console.log(`[pr-deploy] Started ${packageName} service`)
            }
        }

        // Update deployment status
        await updatePRDeployment(pr.number, {status: 'running'})

        const deploymentUrl = `https://pr-${pr.number}.garage44.org`

        console.log(`[pr-deploy] PR #${pr.number} deployed successfully`)
        console.log(`[pr-deploy] URL: ${deploymentUrl} (public access, no token required)`)

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
async function updateExistingPRDeployment(pr: PRMetadata): Promise<{
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

        // Discover which packages to deploy
        const allPackages = extractWorkspacePackages(repoDir)
        const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))
        const packagesToDeploy = [...appPackages, 'malkovich'] // Always include malkovich

        console.log(`[pr-deploy] Discovered packages to restart: ${packagesToDeploy.join(', ')}`)

        // Restart services
        for (const packageName of packagesToDeploy) {
            await $`sudo systemctl restart pr-${pr.number}-${packageName}.service`.quiet()
            console.log(`[pr-deploy] Restarted ${packageName} service`)
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
async function generateSystemdServices(deployment: PRDeployment, packagesToDeploy: string[]): Promise<void> {
    // Map package names to port allocations
    const portMap: Record<string, number> = {
        expressio: deployment.ports.expressio,
        malkovich: deployment.ports.malkovich,
        pyrite: deployment.ports.pyrite,
    }

    for (const packageName of packagesToDeploy) {
        const port = portMap[packageName] || deployment.ports.malkovich
        const workdir = path.join(deployment.directory, `repo/packages/${packageName}`)

        // Check if package directory exists
        if (!existsSync(workdir)) {
            console.warn(`[pr-deploy] Package directory not found: ${workdir}, skipping ${packageName}`)
            continue
        }

        const serviceFile = `/etc/systemd/system/pr-${deployment.number}-${packageName}.service`
        const content = `[Unit]
Description=PR #${deployment.number} ${packageName} service
After=network.target

[Service]
Type=simple
User=garage44
Group=garage44
WorkingDirectory=${workdir}
Environment="NODE_ENV=production"
Environment="BUN_ENV=production"
Environment="PATH=/home/garage44/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/garage44/.bun/bin/bun run server -- --port ${port}
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
        console.log(`[pr-deploy] Generated systemd service for ${packageName}`)
    }

    // Reload systemd
    await $`sudo systemctl daemon-reload`.quiet()
}

/**
 * Generate nginx configuration for PR deployment
 * Public access for contributor PRs (no token required)
 * Creates separate subdomains for each package: pr-{number}.{package}.garage44.org
 */
async function generateNginxConfig(deployment: PRDeployment, packagesToDeploy: string[]): Promise<void> {
    const prNumber = deployment.number
    const baseDomain = 'garage44.org'

    // Port mapping for packages
    const portMap: Record<string, number> = {
        expressio: deployment.ports.expressio,
        malkovich: deployment.ports.malkovich,
        pyrite: deployment.ports.pyrite,
    }

    // Packages that need WebSocket support
    const websocketPackages = ['expressio', 'pyrite', 'malkovich']

    // Generate nginx config for each package
    for (const packageName of packagesToDeploy) {
        const port = portMap[packageName] || deployment.ports.malkovich
        const subdomain = `pr-${prNumber}.${packageName}.${baseDomain}`
        const configFile = `/etc/nginx/sites-available/${subdomain}`
        const enabledLink = `/etc/nginx/sites-enabled/${subdomain}`

        let content = `# PR #${prNumber} - ${packageName} service (subdomain: ${subdomain})
# Rate limit zone (defined in main nginx.conf if not already present)
# limit_req_zone $binary_remote_addr zone=pr_public:10m rate=10r/s;

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${subdomain};
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    http2 on;
    server_name ${subdomain};

    # Wildcard SSL certificate
    ssl_certificate /etc/letsencrypt/live/garage44.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/garage44.org/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Prevent search engine indexing
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;

    # PR deployment indicator
    add_header X-PR-Deployment "${prNumber}" always;

    # Rate limiting for public access
    limit_req zone=pr_public burst=20 nodelay;
    limit_req_status 429;
`

        // Add WebSocket support for packages that need it
        if (websocketPackages.includes(packageName)) {
            if (packageName === 'pyrite') {
                // Pyrite has both /ws and /sfu endpoints
                content += `
    # SFU WebSocket endpoint (Galène)
    location /sfu {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
`
            }

            content += `
    # WebSocket endpoint
    location /ws {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
`
        }

        // Main location block
        content += `
    # Main location
    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
`

        // Add WebSocket headers to main location for WebSocket packages
        if (websocketPackages.includes(packageName)) {
            content += `        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
`
        }

        content += `    }
}
`

        writeFileSync(configFile, content, 'utf-8')

        // Create symlink if it doesn't exist
        if (!existsSync(enabledLink)) {
            await $`sudo ln -s ${configFile} ${enabledLink}`.quiet()
        }
    }

    // Reload nginx
    await $`sudo nginx -s reload`.quiet()
}
