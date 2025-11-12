# PR Deployment System - Quick Summary

## What Problem Does This Solve?

Cursor agents (and developers) need to test changes on a live VPS environment without manually deploying each time. This system provides **automatic and manual PR deployments** with **public access** for trusted contributors.

## How It Works

### Package Discovery (Key Feature!)

The system **automatically discovers** which packages exist in your workspace and deploys only those:

```typescript
// Discovers packages from workspace package.json
const allPackages = extractWorkspacePackages(repoDir)
// Filters application packages (those with service.ts)
const appPackages = allPackages.filter(pkg => isApplicationPackage(pkg))
// Always includes malkovich
const packagesToDeploy = [...appPackages, 'malkovich']
```

**Example:**
- If your workspace has `expressio`, `pyrite`, and `malkovich` → deploys all 3
- If you only have `malkovich` → deploys only malkovich
- Same logic as the main branch deployment!

### Deployment Flow

```
1. PR opened/updated → GitHub Actions webhook
   ↓
2. VPS validates (contributors only, no forks)
   ↓
3. Clone repo to /home/garage44/pr-{number}/
   ↓
4. Auto-discover packages from workspace
   ↓
5. Build discovered packages
   ↓
6. Generate systemd services for each package
   ↓
7. Start services on allocated ports
   ↓
8. Configure nginx: https://pr-{number}.garage44.org
   ↓
9. Public access (no token needed!)
```

### Port Allocation

Each PR gets 3 consecutive ports:
```
PR #123:
  - expressio: 40369 (base + 123*3 + 0)
  - pyrite: 40370 (base + 123*3 + 1)
  - malkovich: 40371 (base + 123*3 + 2)
```

## Security Model

| Feature | Protection |
|---------|-----------|
| **Fork PRs** | ❌ Blocked completely |
| **Contributor PRs** | ✅ Public access (no token) |
| **Rate Limiting** | ✅ 10 req/s per IP, burst 20 |
| **Search Indexing** | ❌ Blocked (X-Robots-Tag) |
| **Resource Limits** | ✅ 512MB RAM, 50% CPU per service |
| **Isolation** | ✅ Separate dirs, ports, databases |
| **Cleanup** | ✅ Auto after 7 days or PR close |

## CLI Commands (For Cursor Agents)

### Deploy Current Branch
```bash
bun run malkovich deploy-pr --number 999 --branch $(git branch --show-current)
```

### List Active Deployments
```bash
bun run malkovich list-pr-deployments
```

### Cleanup PR
```bash
bun run malkovich cleanup-pr --number 999
```

## Key Decisions

### Why Public Access?

**Problem:** Token management is complex for agents and reviewers.

**Solution:** Public access is safe because:
1. Only contributors can deploy (forks blocked)
2. Rate limited to prevent abuse
3. Not indexed by search engines
4. Resource limited per deployment
5. Auto-cleanup prevents accumulation

### Why Auto-Discovery?

**Problem:** Hardcoding packages breaks when workspace changes.

**Solution:** Use same discovery logic as main deployment:
- Scans `package.json` workspaces
- Filters application packages
- Checks for `service.ts` file
- Always includes malkovich

### Why Separate Directories?

**Problem:** Multiple PRs sharing same directory would conflict.

**Solution:** Each PR gets isolated environment:
- `/home/garage44/pr-{number}/repo`
- Separate databases
- Separate ports
- Separate systemd services
- Easy cleanup

## Implementation Checklist

✅ **Core System (in malkovich/lib/)**
- `pr-registry.ts` - Tracks deployments
- `pr-deploy.ts` - Deployment manager with auto-discovery
- `pr-cleanup.ts` - Cleanup utilities
- `webhook.ts` - PR event handling

✅ **CLI Commands (in service.ts)**
- `deploy-pr` - Manual deployment
- `list-pr-deployments` - List active
- `cleanup-pr` - Remove deployment
- `cleanup-stale-prs` - Remove old deployments

✅ **Templates (in deploy/)**
- `pr-cleanup.timer` - Daily cleanup timer
- `pr-cleanup.service` - Cleanup service

✅ **GitHub Actions**
- `.github/workflows/pr-deploy.yml` - Auto-deployment

✅ **Documentation**
- `packages/malkovich/PR_DEPLOYMENT.md` - Quick reference
- `docs/pr-deployment.md` - Architecture
- `docs/pr-deployment-implementation.md` - Full guide
- `docs/cursor-agent-pr-deploy.md` - Agent guide

## Files Changed

```
packages/malkovich/
├── lib/
│   ├── pr-registry.ts      ✨ NEW
│   ├── pr-deploy.ts        ✨ NEW (with auto-discovery)
│   ├── pr-cleanup.ts       ✨ NEW
│   └── webhook.ts          📝 UPDATED (PR events)
├── service.ts              📝 UPDATED (CLI commands)
└── PR_DEPLOYMENT.md        ✨ NEW

deploy/
├── pr-cleanup.timer        ✨ NEW
└── pr-cleanup.service      ✨ NEW

.github/workflows/
└── pr-deploy.yml           ✨ NEW

docs/
├── pr-deployment.md                   ✨ NEW
├── pr-deployment-implementation.md    ✨ NEW
└── cursor-agent-pr-deploy.md         ✨ NEW
```

## Installation (VPS)

```bash
# 1. Get wildcard SSL cert
sudo certbot certonly --standalone -d "*.garage44.org"

# 2. Configure nginx rate limiting
# Add to /etc/nginx/nginx.conf in http block:
# limit_req_zone $binary_remote_addr zone=pr_public:10m rate=10r/s;

# 3. Install cleanup timer
sudo cp deploy/pr-cleanup.timer /etc/systemd/system/
sudo cp deploy/pr-cleanup.service /etc/systemd/system/
sudo systemctl enable pr-cleanup.timer
sudo systemctl start pr-cleanup.timer

# 4. Update sudo permissions (see docs/pr-deployment-implementation.md)

# 5. Test deployment
bun run malkovich deploy-pr --number 999 --branch main
```

## Usage Example (Cursor Agent)

```typescript
// Agent makes changes
await $`git checkout -b feature/new-ui`
// ... make changes ...
await $`git commit -am "Add new UI"`
await $`git push origin feature/new-ui`

// Agent deploys for testing
await $`bun run malkovich deploy-pr --number 999 --branch feature/new-ui`

// Agent verifies
console.log("✅ Deployed to: https://pr-999.garage44.org")
console.log("   Packages deployed:", discoveredPackages)

// Agent reports to user
"Your changes are live at https://pr-999.garage44.org - try the new UI!"

// Agent cleans up after approval
await $`bun run malkovich cleanup-pr --number 999`
```

## Common Questions

### Q: Which packages get deployed?
**A:** Same packages as main deployment - auto-discovered from workspace. If it has a `service.ts`, it's deployed.

### Q: What if I only have malkovich?
**A:** Only malkovich is deployed. The system adapts to your workspace.

### Q: Do I need to configure ports?
**A:** No, ports are auto-allocated based on PR number.

### Q: Can external users access PR deployments?
**A:** Yes, but only if the PR is from a contributor (not a fork). It's rate-limited and not indexed.

### Q: How do I deploy from the agent?
**A:** `bun run malkovich deploy-pr --number 999 --branch $(git branch --show-current)`

### Q: How do I know what's deployed?
**A:** `bun run malkovich list-pr-deployments` shows all active deployments.

## Monitoring

```bash
# View logs
sudo journalctl -u pr-123-malkovich.service -f

# Check status
systemctl status pr-123-malkovich.service

# List all PR services
systemctl list-units 'pr-*'

# Check nginx config
sudo nginx -t
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Deployment fails | Check logs: `journalctl -u pr-123-malkovich.service` |
| Can't access URL | Verify nginx: `sudo nginx -t` |
| Wrong packages deployed | Check workspace discovery in logs |
| Port conflict | Each PR gets unique ports, shouldn't conflict |
| Service won't start | Check package has `service.ts` file |

## Next Steps

1. **Commit and push** these changes
2. **Pull on VPS** and run installation
3. **Test deployment**: `bun run malkovich deploy-pr --number 999 --branch main`
4. **Open a real PR** to test GitHub Actions integration
5. **Try from Cursor agent** to verify agent workflow

## Summary

✅ **Automatic package discovery** - no hardcoding
✅ **Public access** - simple for agents and reviewers
✅ **Complete isolation** - each PR separate
✅ **Auto-cleanup** - no manual management
✅ **Perfect for agents** - single command deployment

**For agents:** `bun run malkovich deploy-pr --number 999 --branch $(git branch --show-current)` → Done! 🚀
