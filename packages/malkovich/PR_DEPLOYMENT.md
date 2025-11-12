# PR Deployment System

Malkovich includes a built-in PR deployment system that allows automatic and manual deployment of pull request branches for testing.

## Overview

This system enables:
- **Automatic PR deployments** via GitHub Actions webhooks
- **Manual PR deployments** via CLI (for Cursor agents)
- **Public access** for contributor PRs (no token required)
- **Isolated environments** per PR
- **Automatic cleanup** when PRs close or after 7 days

## Security Model

- ✅ **Only contributor PRs** (forks are blocked)
- ✅ **Public access** (no authentication required)
- ✅ **Rate limited** (10 req/s per IP)
- ✅ **Not indexed** by search engines
- ✅ **Resource limits** (512MB RAM, 50% CPU per service)
- ✅ **Isolated** (separate directories, ports, databases)

## Architecture

Each PR deployment:
- Gets its own directory: `/home/garage44/pr-{number}/`
- Runs on dedicated ports: `40000 + (PR# * 3)` range
- Has its own nginx subdomain: `pr-{number}.garage44.org`
- Runs as separate systemd services: `pr-{number}-malkovich.service`, etc.
- **Auto-discovers packages**: Scans workspace to determine which packages to deploy (same logic as main deployment)

## CLI Commands

### Deploy a PR

```bash
# Deploy current branch as PR #999
bun run malkovich deploy-pr \
  --number 999 \
  --branch $(git branch --show-current)

# Deploy specific branch
bun run malkovich deploy-pr \
  --number 123 \
  --branch feature/new-ui

# Deploy specific commit
bun run malkovich deploy-pr \
  --number 123 \
  --branch feature/new-ui \
  --sha abc123def456
```

**Output:**
```
✅ PR Deployment Successful!

URL: https://pr-999.garage44.org
Malkovich: https://pr-999.garage44.org

Ports:
  Malkovich: 40000
  Expressio: 40001
  Pyrite: 40002

Note: Deployment is publicly accessible (no token required)
```

### List Active Deployments

```bash
bun run malkovich list-pr-deployments
```

**Output:**
```
Active PR Deployments (2):

PR #123:
  Branch: feature/new-ui
  Author: local
  Age: 2 hours
  URL: https://pr-123.garage44.org
  Ports: 40369 (malkovich), 40367 (expressio), 40368 (pyrite)
  Status: running

PR #456:
  Branch: fix/translation-bug
  Author: local
  Age: 5 hours
  URL: https://pr-456.garage44.org
  Ports: 41368 (malkovich), 41366 (expressio), 41367 (pyrite)
  Status: running
```

### Cleanup a PR

```bash
# Remove a specific PR deployment
bun run malkovich cleanup-pr --number 123
```

### Cleanup Stale Deployments

```bash
# Remove deployments older than 7 days (default)
bun run malkovich cleanup-stale-prs

# Custom age threshold
bun run malkovich cleanup-stale-prs --max-age-days 3
```

## Implementation Files

### Core System
- `lib/pr-registry.ts` - Registry for tracking deployments
- `lib/pr-deploy.ts` - Deployment manager
- `lib/pr-cleanup.ts` - Cleanup utilities
- `lib/webhook.ts` - Enhanced to handle PR events
- `service.ts` - CLI commands added

### Deployment Templates
- `../../deploy/pr-cleanup.timer` - Systemd timer for daily cleanup
- `../../deploy/pr-cleanup.service` - Systemd service for cleanup
- `../../.github/workflows/pr-deploy.yml` - GitHub Actions workflow

## GitHub Actions Integration

When you open a PR, GitHub Actions automatically:
1. Validates it's from main repo (not a fork)
2. Sends webhook to VPS
3. VPS deploys the PR
4. Bot comments on PR with deployment URL

## Cursor Agent Usage

Cursor agents can trigger deployments directly:

```typescript
// Agent deploys current work
await $`bun run malkovich deploy-pr --number 999 --branch $(git branch --show-current)`

// Agent reports back
console.log("Deployment available at: https://pr-999.garage44.org")

// Agent cleans up after testing
await $`bun run malkovich cleanup-pr --number 999`
```

## Installation

See `/workspace/docs/pr-deployment-implementation.md` for full installation guide.

**Quick setup:**

1. Get wildcard SSL cert: `sudo certbot certonly --standalone -d "*.garage44.org"`
2. Configure nginx rate limiting (add to `/etc/nginx/nginx.conf`)
3. Install cleanup timer: `sudo systemctl enable pr-cleanup.timer`
4. Update sudo permissions for service management

## Port Allocation

Ports are automatically calculated:
```
PR #123:
  - Malkovich: 40369 (40000 + 123*3 + 0)
  - Expressio: 40370 (40000 + 123*3 + 1)
  - Pyrite: 40371 (40000 + 123*3 + 2)
```

Range: 40000-49999 (supports ~3,333 concurrent PRs)

## Monitoring

### View Logs
```bash
# Service logs
sudo journalctl -u pr-123-malkovich.service -f

# All PR services
sudo journalctl -u pr-123-* -f
```

### Check Status
```bash
# Service status
systemctl status pr-123-malkovich.service

# Resource usage
systemctl show pr-123-malkovich.service -p MemoryCurrent
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log | grep pr-123

# Error logs
sudo tail -f /var/log/nginx/error.log | grep pr-123
```

## Troubleshooting

### Deployment Fails
- Check build logs: `sudo journalctl -u pr-123-malkovich.service -n 100`
- Verify branch exists: `git ls-remote origin feature/branch-name`
- Check disk space: `df -h`

### Can't Access Deployment
- Test nginx: `sudo nginx -t`
- Check DNS: `dig pr-123.garage44.org`
- Verify SSL cert: `sudo certbot certificates`
- Check service status: `systemctl status pr-123-malkovich.service`

### Manual Cleanup
```bash
# Stop services
sudo systemctl stop pr-123-*.service

# Remove units
sudo rm -f /etc/systemd/system/pr-123-*.service
sudo systemctl daemon-reload

# Remove nginx config
sudo rm -f /etc/nginx/sites-*/pr-123.garage44.org
sudo nginx -s reload

# Remove directory
rm -rf /home/garage44/pr-123
```

## Best Practices

### For Agents
1. Use high PR numbers for testing (900+)
2. Clean up test deployments promptly
3. Check active deployments before deploying
4. Use descriptive branch names

### For Developers
1. Close PRs when done (triggers cleanup)
2. Don't commit sensitive data
3. Use dummy data for testing
4. Monitor resource usage

## Documentation

- **Architecture Design**: `/workspace/docs/pr-deployment.md`
- **Implementation Guide**: `/workspace/docs/pr-deployment-implementation.md`
- **Agent Guide**: `/workspace/docs/cursor-agent-pr-deploy.md`
- **GitHub Workflow**: `/workspace/.github/workflows/pr-deploy.yml`

## Summary

The PR deployment system integrated into Malkovich provides:
- ✅ Automatic deployments from GitHub
- ✅ Manual deployments via CLI
- ✅ Public access for contributors
- ✅ Complete isolation
- ✅ Automatic cleanup
- ✅ Perfect for agent testing

**Quick start for Cursor agents:**
```bash
bun run malkovich deploy-pr --number 999 --branch $(git branch --show-current)
```
