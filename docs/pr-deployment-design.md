# PR Deployment Design

This document describes the secure PR-triggered deployment system for testing changes on the VPS.

## Overview

The PR deployment system allows you to deploy and test pull requests on the VPS before merging to main. It maintains security through multiple validation layers while keeping the deployment process similar to the main branch deployment.

## Security Architecture

### Multi-Layer Security

1. **Webhook Signature Validation**
   - Uses the same `WEBHOOK_SECRET` as main deployments
   - HMAC SHA-256 signature verification prevents unauthorized requests
   - Constant-time comparison prevents timing attacks

2. **Branch Pattern Filtering**
   - Only branches matching allowed patterns can be deployed
   - Default pattern: `cursor/*` (configurable via `PR_ALLOWED_BRANCH_PATTERNS`)
   - Prevents deployment of arbitrary branches

3. **Repository Validation**
   - Only PRs from the same repository are allowed (not forks)
   - Validates via GitHub API using `GITHUB_TOKEN`
   - Prevents malicious code from external repositories

4. **PR Status Check**
   - Only open PRs can be deployed
   - Closed/merged PRs are rejected
   - Prevents deployment of stale PRs

5. **Isolated Environment**
   - PR deployments use separate ports (base: 4000 + PR number offset)
   - PR-specific database files (e.g., `~/.expressio-pr-123.db`)
   - PR-specific systemd services (e.g., `expressio-pr-123.service`)
   - No interference with production services

## Deployment Flow

```
GitHub PR Event
    ↓
GitHub Actions Workflow (.github/workflows/deploy-pr.yml)
    ↓
Webhook Request → /webhook/pr endpoint
    ↓
Security Validations:
  - Webhook signature ✓
  - Branch pattern match ✓
  - Same repository ✓
  - PR is open ✓
    ↓
Deployment Process:
  1. Checkout PR branch
  2. Build packages
  3. Create/update PR-specific systemd services
  4. Start services on isolated ports
  5. Use PR-specific database files
```

## Components

### 1. Webhook Handler (`packages/malkovich/lib/webhook.ts`)

- `handlePRWebhook()`: Main handler for PR webhook requests
- `validatePRSource()`: Validates PR is from same repository
- `isBranchAllowed()`: Checks branch name against allowed patterns
- `deployPR()`: Performs the PR deployment

### 2. GitHub Actions Workflow (`.github/workflows/deploy-pr.yml`)

- Triggers on PR events: `opened`, `synchronize`, `reopened`
- Only runs for PRs from the same repository (not forks)
- Calls `/webhook/pr` endpoint with PR information

### 3. Systemd Service Generation (`packages/malkovich/lib/deploy/pr-services.ts`)

- `generatePRService()`: Creates systemd service file for a PR
- `generatePRServices()`: Generates all services for a PR
- `generatePRNginxConfig()`: Generates nginx config for PR preview

### 4. Service Endpoint (`packages/malkovich/service.ts`)

- `/webhook`: Main branch deployments (existing)
- `/webhook/pr`: PR deployments (new)

## Configuration

### Environment Variables

```bash
# Required for PR validation
export GITHUB_TOKEN="ghp_..."  # GitHub personal access token

# Optional: Branch patterns (default: cursor/*)
export PR_ALLOWED_BRANCH_PATTERNS="cursor/*,feature/*"

# Optional: Base port for PR deployments (default: 4000)
export PR_BASE_PORT=4000
```

### Sudo Configuration

Add to `/etc/sudoers` (via `visudo`):

```
garage44 ALL=(ALL) NOPASSWD: \
  /bin/systemctl restart expressio-pr-*.service, \
  /bin/systemctl restart pyrite-pr-*.service, \
  /bin/systemctl restart malkovich-pr-*.service, \
  /bin/systemctl enable expressio-pr-*.service, \
  /bin/systemctl enable pyrite-pr-*.service, \
  /bin/systemctl enable malkovich-pr-*.service, \
  /bin/systemctl daemon-reload, \
  /usr/bin/tee /etc/systemd/system/expressio-pr-*.service, \
  /usr/bin/tee /etc/systemd/system/pyrite-pr-*.service, \
  /usr/bin/tee /etc/systemd/system/malkovich-pr-*.service
```

## Port Allocation

PR deployments use isolated ports to avoid conflicts:

- Base port: `PR_BASE_PORT` (default: 4000)
- Port offset: `PR_NUMBER % 1000`
- Service ports: `BASE_PORT + OFFSET + (SERVICE_INDEX * 10)`

Example for PR #123:
- Expressio: 4000 + 123 + 0 = 4123
- Pyrite: 4000 + 123 + 10 = 4133

## Database Isolation

PR deployments use separate database files:
- `~/.expressio-pr-{PR_NUMBER}.db`
- `~/.pyrite-pr-{PR_NUMBER}.db`

This ensures PR deployments don't interfere with production data.

## Service Naming

PR-specific services follow the pattern:
- `{package}-pr-{PR_NUMBER}.service`

Examples:
- `expressio-pr-123.service`
- `pyrite-pr-123.service`

## Accessing PR Deployments

### Direct Port Access

Connect directly to the allocated port:
```bash
curl http://your-vps:4123  # Expressio for PR #123
```

### Nginx Configuration (Optional)

Configure nginx to proxy PR preview subdomains:

```nginx
server {
    listen 443 ssl;
    server_name pr-123.your-domain.com;
    
    location / {
        proxy_pass http://localhost:4123;
        # ... proxy settings
    }
}
```

## Cleanup

When a PR is closed or merged, clean up resources:

```bash
# Stop and disable services
sudo systemctl stop expressio-pr-123.service
sudo systemctl disable expressio-pr-123.service
sudo rm /etc/systemd/system/expressio-pr-123.service
sudo systemctl daemon-reload

# Remove database files
rm ~/.expressio-pr-123.db*
rm ~/.pyrite-pr-123.db*
```

## Comparison with Main Deployment

| Aspect | Main Deployment | PR Deployment |
|--------|----------------|---------------|
| Endpoint | `/webhook` | `/webhook/pr` |
| Branch | `main` only | Configurable patterns |
| Ports | Fixed (3030, 3031, 3032) | Dynamic (4000+) |
| Services | `expressio.service` | `expressio-pr-{N}.service` |
| Databases | `~/.expressio.db` | `~/.expressio-pr-{N}.db` |
| Validation | Signature only | Signature + Branch + Repo + PR Status |

## Security Considerations

1. **GitHub Token**: Use a token with minimal permissions (read-only for public repos)
2. **Branch Patterns**: Restrict to trusted patterns (e.g., `cursor/*`)
3. **Repository Validation**: Always validates PR source (prevents fork attacks)
4. **Isolation**: PR deployments cannot affect production services
5. **Webhook Secret**: Same secret as main deployments (proven security)

## Future Enhancements

Potential improvements:
- Automatic cleanup when PRs are closed
- Nginx configuration generation for PR previews
- PR deployment status reporting back to GitHub
- Resource limits per PR deployment
- Time-based expiration of PR deployments
