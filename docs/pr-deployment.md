# Secure PR Deployment Design

## Overview

This document describes a secure approach to deploy PR branches on the VPS for testing while maintaining security boundaries similar to the current main-branch-only deployment.

## Current Architecture (Main Branch Only)

```
GitHub Actions (main) 
  → Webhook w/ HMAC signature
    → VPS Webhook Handler
      → Git pull origin/main
        → Build packages
          → Restart systemd services (ports 3030-3032)
            → Nginx reverse proxy (subdomains)
```

**Security Model:**
- HMAC SHA-256 signature validation
- Branch restriction (main only)
- Single deployment environment
- Controlled branch (protected)

## Proposed Architecture (PR Branches)

### Design Principles

1. **Isolation**: Each PR gets its own isolated deployment environment
2. **Ephemeral**: PR deployments are temporary and cleaned up automatically
3. **Non-Interference**: PR deployments don't affect main deployment
4. **Access Control**: PR deployments use authentication/tokens for access
5. **Resource Limits**: PR deployments have resource constraints
6. **Audit Trail**: All PR deployments are logged and tracked

### Architecture Overview

```
GitHub Actions (PR)
  → Webhook w/ HMAC signature + PR metadata
    → VPS Webhook Handler
      → Validate PR source (trusted branches/authors)
        → Clone to isolated directory (/home/garage44/pr-<number>)
          → Build in isolation
            → Start on dynamic ports (40000+)
              → Nginx subdomain (pr-<number>.garage44.org)
                → Cleanup after PR close/merge
```

## Security Model

### 1. PR Validation

**Simplified Trust Model:**
- ✅ **Trusted**: PRs from main repository (contributors only) - **PUBLIC ACCESS**
- ❌ **Blocked**: PRs from forks (rejected automatically)

**Implementation:**
```typescript
interface PRMetadata {
    number: number
    head_ref: string  // Branch name
    head_sha: string  // Commit SHA
    is_fork: boolean  // From external fork?
    author: string    // GitHub username
    repo_full_name: string  // owner/repo
}

function validatePRSource(pr: PRMetadata): 'trusted' | 'untrusted' {
    // Block forks completely - only contributors allowed
    if (pr.is_fork) {
        console.log(`[pr-deploy] PR #${pr.number} is from a fork, deployment blocked`)
        return 'untrusted'
    }
    
    // Main repo PRs are trusted and get public access
    return 'trusted'
}
```

### 2. Deployment Isolation

**Directory Structure:**
```
/home/garage44/
├── garage44/              # Main deployment (production)
├── pr-123/                # PR #123 deployment
│   ├── repo/              # Git checkout
│   ├── logs/              # Build and runtime logs
│   └── metadata.json      # PR info, created timestamp
├── pr-456/                # PR #456 deployment
└── pr-deployments.json    # Active deployments registry
```

**Resource Isolation:**
- Separate working directories
- Dedicated port ranges (40000-49999)
- Process isolation (systemd dynamic units)
- Database isolation (separate SQLite files per PR)

### 3. Port Allocation

**Port Strategy:**
```typescript
// Main deployments (static)
const MAIN_PORTS = {
    expressio: 3030,
    pyrite: 3031,
    malkovich: 3032,
}

// PR deployments (dynamic)
const PR_PORT_BASE = 40000
const PR_PORT_RANGE = 10000  // 40000-49999

function allocatePRPorts(prNumber: number) {
    const base = PR_PORT_BASE + (prNumber % PR_PORT_RANGE) * 3
    return {
        expressio: base,
        pyrite: base + 1,
        malkovich: base + 2,
    }
}

// Example: PR #123
// - expressio: 40369 (40000 + 123*3)
// - pyrite: 40370
// - malkovich: 40371
```

### 4. Access Control

**Public Access for Contributors:**

Contributor PRs (from main repo) are **publicly accessible** with no authentication required. This simplifies workflow for agents and reviewers while maintaining security through:

1. **Fork blocking** - Only contributors can deploy
2. **Rate limiting** - Prevents abuse
3. **Not indexed** - Search engines blocked
4. **Resource limits** - Prevents resource exhaustion

**Previous token-based approach (no longer needed):**

~~**Option A: Token-based**~~
```typescript
// Generate unique token for each PR deployment
function generatePRToken(prNumber: number): string {
    const secret = process.env.PR_DEPLOYMENT_SECRET
    const data = `pr-${prNumber}-${Date.now()}`
    return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

// Nginx configuration
server {
    listen 443 ssl;
    server_name pr-123.garage44.org;
    
    # Require token in query param or header
    set $valid_token "";
    if ($arg_token = "abc123...") {
        set $valid_token "1";
    }
    if ($http_x_pr_token = "abc123...") {
        set $valid_token "1";
    }
    if ($valid_token != "1") {
        return 403;
    }
    
    location / {
        proxy_pass http://localhost:40369;
    }
}
```

**Option B: Basic Auth (Simple)**
```nginx
server {
    listen 443 ssl;
    server_name pr-123.garage44.org;
    
    auth_basic "PR Deployment";
    auth_basic_user_file /etc/nginx/.htpasswd-pr-123;
    
    location / {
        proxy_pass http://localhost:40369;
    }
}
```

**Option C: IP Allowlist (Most Restrictive)**
```nginx
server {
    listen 443 ssl;
    server_name pr-123.garage44.org;
    
    # Only allow specific IPs (your office, VPN, etc.)
    allow 203.0.113.0/24;
    deny all;
    
    location / {
        proxy_pass http://localhost:40369;
    }
}
```

### 5. Resource Limits

**Systemd Service Constraints:**
```ini
[Service]
# Memory limit: 512MB per service
MemoryMax=512M
MemoryHigh=400M

# CPU limit: 50% of one core
CPUQuota=50%

# Process limit
TasksMax=100

# Restart limits
StartLimitBurst=3
StartLimitIntervalSec=300
```

**Disk Quotas:**
```bash
# Limit PR deployment directory size
du -sh /home/garage44/pr-*
# Implement cleanup if total exceeds threshold (e.g., 10GB)
```

### 6. Automatic Cleanup

**Cleanup Triggers:**
- PR closed/merged (GitHub webhook)
- Deployment older than N days (cron job)
- Deployment failed to start (immediate)
- Manual cleanup command

**Implementation:**
```typescript
async function cleanupPRDeployment(prNumber: number): Promise<void> {
    const prDir = `/home/garage44/pr-${prNumber}`
    
    // 1. Stop systemd services
    await $`sudo systemctl stop pr-${prNumber}-expressio.service`
    await $`sudo systemctl stop pr-${prNumber}-pyrite.service`
    await $`sudo systemctl stop pr-${prNumber}-malkovich.service`
    
    // 2. Remove systemd units
    await $`sudo rm -f /etc/systemd/system/pr-${prNumber}-*.service`
    await $`sudo systemctl daemon-reload`
    
    // 3. Remove nginx configuration
    await $`sudo rm -f /etc/nginx/sites-enabled/pr-${prNumber}.garage44.org`
    await $`sudo nginx -s reload`
    
    // 4. Remove deployment directory
    await $`rm -rf ${prDir}`
    
    // 5. Remove from registry
    const registry = await loadPRRegistry()
    delete registry[prNumber]
    await savePRRegistry(registry)
    
    console.log(`[cleanup] PR #${prNumber} deployment cleaned up`)
}

// Cron job: cleanup stale deployments
async function cleanupStaleDeployments(): Promise<void> {
    const registry = await loadPRRegistry()
    const maxAge = 7 * 24 * 60 * 60 * 1000  // 7 days
    const now = Date.now()
    
    for (const [prNumber, deployment] of Object.entries(registry)) {
        if (now - deployment.created > maxAge) {
            console.log(`[cleanup] PR #${prNumber} is stale, cleaning up...`)
            await cleanupPRDeployment(Number(prNumber))
        }
    }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure

1. **PR Deployment Manager** (`packages/malkovich/lib/pr-deploy.ts`)
   - PR validation logic
   - Port allocation
   - Directory management
   - Registry tracking

2. **Enhanced Webhook Handler** (`packages/malkovich/lib/webhook.ts`)
   - Detect PR events (opened, synchronized, closed)
   - Route to PR deployment manager
   - Keep main branch deployment logic unchanged

3. **Systemd Template Generator**
   - Generate dynamic systemd units for PR deployments
   - Apply resource limits
   - Auto-start on boot (optional)

4. **Nginx Configuration Generator**
   - Generate subdomain configs dynamically
   - Apply authentication (token/basic auth)
   - SSL certificate management (wildcard cert)

### Phase 2: Automation

1. **GitHub Actions Workflow** (`.github/workflows/pr-deploy.yml`)
   - Trigger on PR open, update, close
   - Send PR metadata to webhook
   - Post deployment URL as PR comment

2. **Cleanup Automation**
   - Systemd timer for stale deployment cleanup
   - Webhook handler for PR close events
   - Manual cleanup command

### Phase 3: Monitoring & UI

1. **Deployment Dashboard** (in Malkovich)
   - List active PR deployments
   - Show resource usage
   - Manual cleanup controls
   - View logs

2. **Logging & Alerts**
   - Track deployment success/failure
   - Alert on resource limits exceeded
   - Audit log for all PR deployments

## Nginx Configuration

### Wildcard SSL Certificate

```bash
# Obtain wildcard certificate for *.garage44.org
sudo certbot certonly --standalone -d "*.garage44.org" -d garage44.org

# This allows pr-123.garage44.org, pr-456.garage44.org, etc.
```

### Dynamic PR Subdomain Config

```nginx
# Template: /etc/nginx/sites-available/pr-template.conf
server {
    listen 80;
    server_name pr-{PR_NUMBER}.garage44.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name pr-{PR_NUMBER}.garage44.org;
    
    # Wildcard SSL certificate
    ssl_certificate /etc/letsencrypt/live/garage44.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/garage44.org/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Token-based authentication
    set $valid_token "";
    if ($arg_token = "{PR_TOKEN}") {
        set $valid_token "1";
    }
    if ($http_x_pr_token = "{PR_TOKEN}") {
        set $valid_token "1";
    }
    if ($valid_token != "1") {
        return 403 "Access denied. Token required.";
    }
    
    # Malkovich
    location / {
        proxy_pass http://localhost:{MALKOVICH_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:{MALKOVICH_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}

# Separate configs for expressio and pyrite if needed
# Or use path-based routing: pr-123.garage44.org/expressio, etc.
```

## GitHub Actions Workflow

```yaml
name: PR Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

jobs:
  deploy:
    name: Deploy or Cleanup PR
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy PR
        if: github.event.action != 'closed'
        env:
          WEBHOOK_URL: ${{ secrets.WEBHOOK_URL }}
          WEBHOOK_SECRET: ${{ secrets.WEBHOOK_SECRET }}
        run: |
          # Create PR deployment payload
          PAYLOAD=$(jq -n \
            --arg ref "${{ github.head_ref }}" \
            --arg sha "${{ github.event.pull_request.head.sha }}" \
            --argjson number ${{ github.event.pull_request.number }} \
            --arg author "${{ github.event.pull_request.user.login }}" \
            --argjson is_fork ${{ github.event.pull_request.head.repo.fork }} \
            --arg repo "${{ github.repository }}" \
            '{
              event_type: "pull_request",
              action: "${{ github.event.action }}",
              pull_request: {
                number: $number,
                head_ref: $ref,
                head_sha: $sha,
                is_fork: $is_fork,
                author: $author,
                repo_full_name: $repo
              }
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
          BODY=$(echo "$RESPONSE" | head -n-1)
          
          if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
            echo "✅ PR deployment triggered (HTTP $HTTP_CODE)"
            echo "Response: $BODY"
            
            # Extract deployment URL from response
            DEPLOY_URL=$(echo "$BODY" | jq -r '.deployment_url // empty')
            if [ -n "$DEPLOY_URL" ]; then
              echo "deployment_url=$DEPLOY_URL" >> $GITHUB_OUTPUT
            fi
          else
            echo "❌ PR deployment failed (HTTP $HTTP_CODE)"
            echo "Response: $BODY"
            exit 1
          fi
      
      - name: Comment PR with deployment URL
        if: github.event.action != 'closed' && steps.deploy.outputs.deployment_url
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **PR Deployment Available**\n\n` +
                    `Malkovich: ${{ steps.deploy.outputs.deployment_url }}\n` +
                    `Expressio: ${{ steps.deploy.outputs.expressio_url }}\n` +
                    `Pyrite: ${{ steps.deploy.outputs.pyrite_url }}\n\n` +
                    `_This deployment will be automatically cleaned up when the PR is closed._`
            })
      
      - name: Cleanup PR Deployment
        if: github.event.action == 'closed'
        env:
          WEBHOOK_URL: ${{ secrets.WEBHOOK_URL }}
          WEBHOOK_SECRET: ${{ secrets.WEBHOOK_SECRET }}
        run: |
          # Cleanup payload
          PAYLOAD=$(jq -n \
            --argjson number ${{ github.event.pull_request.number }} \
            '{
              event_type: "pull_request",
              action: "closed",
              pull_request: {
                number: $number
              }
            }')
          
          # Calculate signature
          SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p -c 256)
          
          # Send webhook
          curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -H "X-GitHub-Event: pull_request" \
            -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
            -d "$PAYLOAD"
```

## Security Considerations

### ✅ What This Design Protects Against

1. **Malicious Code Execution**
   - PR source validation (no forks without approval)
   - Process isolation (systemd)
   - Resource limits (memory, CPU)

2. **Denial of Service**
   - Port range isolation (40000-49999)
   - Resource quotas per deployment
   - Automatic cleanup of stale deployments
   - Maximum concurrent PR deployments limit

3. **Data Leakage**
   - Separate databases per PR
   - Token-based access control
   - No production data in PR deployments

4. **Unauthorized Access**
   - HMAC signature validation (same as main)
   - Token/basic auth for PR deployments
   - IP allowlisting (optional)

5. **Resource Exhaustion**
   - Disk quota monitoring
   - Memory limits (systemd)
   - CPU quotas (systemd)
   - Max deployment age (auto-cleanup)

### ⚠️ Additional Safeguards

1. **Manual Approval for Forks**
   - Require GitHub Actions approval for fork PRs
   - Use `pull_request_target` with caution
   - Consider separate workflow for external contributors

2. **Rate Limiting**
   - Limit deployments per PR (e.g., max 5 per day)
   - Cooldown period between deployments
   - Track deployment attempts in registry

3. **Monitoring & Alerts**
   - Track failed deployments
   - Alert on unusual resource usage
   - Log all PR deployment events
   - Monitor disk usage

4. **Network Isolation (Advanced)**
   - Consider firewall rules for PR deployments
   - Restrict outbound connections if needed
   - Use network namespaces (Docker/containers)

## Alternative Architectures

### Option 1: Container-Based (More Isolation)

**Benefits:**
- Better isolation (cgroups, namespaces)
- Easier cleanup (just remove container)
- Consistent environment

**Drawbacks:**
- Requires Docker/Podman setup
- More complex than current deployment
- Additional layer of abstraction

### Option 2: VM-Based (Maximum Isolation)

**Benefits:**
- Complete isolation
- Can use untrusted code safely
- Dedicated resources

**Drawbacks:**
- Much higher resource usage
- Slower deployment
- Complex management
- Very different from current setup

### Option 3: Separate VPS (Simple but Costly)

**Benefits:**
- Complete separation from production
- Simple setup (same as current)
- No security concerns

**Drawbacks:**
- Additional cost
- Duplicate infrastructure
- Manual VPS management

## Recommended Approach

**Start with the proposed architecture above:**
1. Same VPS as main deployment
2. Process isolation (no containers yet)
3. Port-based separation
4. Token authentication
5. Automatic cleanup
6. Resource limits via systemd

**Why this is optimal:**
- Minimal changes from current deployment
- Good security/convenience balance
- Easy to implement and test
- Can upgrade to containers later if needed
- Cost-effective (no additional VPS)

## Migration Path

1. **Phase 1**: Implement basic PR deployment (this design)
2. **Phase 2**: Add monitoring and dashboard
3. **Phase 3**: Consider containers if isolation needs increase
4. **Future**: Evaluate cloud preview environments (Vercel, Netlify, etc.)

## Summary

This design provides secure PR deployments with:
- ✅ Similar security model to main deployment
- ✅ Isolation between deployments
- ✅ Automatic cleanup
- ✅ Resource constraints
- ✅ Access control
- ✅ Minimal infrastructure changes

The approach balances security, convenience, and cost-effectiveness while staying close to your current deployment model.
