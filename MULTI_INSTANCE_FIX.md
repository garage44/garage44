# Multi-Instance Database and Config Isolation Fix

## Problem

The deployment system was using hardcoded paths for database files (`~/.pyrite.db`, `~/.expressio.db`) and config files (`~/.pyriterc`, `~/.expressiorc`). This caused multiple instances (main deployment and PR deployments) to share the same database and config files, leading to:

1. **Data conflicts**: PR deployments would read/write to the same database as the main deployment
2. **Default data not initializing**: When a PR deployment started, it would see an existing database (from main deployment) and skip default data initialization
3. **Config conflicts**: All instances shared the same config files

## Solution

Made database and config paths configurable via environment variables, allowing each PR deployment to use isolated storage:

- **Database paths**: Use `DB_PATH` environment variable
- **Config paths**: Use `CONFIG_PATH` environment variable
- **PR deployments**: Each PR gets its own `data/` directory with isolated database and config files

## Changes Made

### 1. Database Initialization (`packages/common/lib/database.ts`)
- Updated `initDatabase()` to check `DB_PATH` environment variable first
- Falls back to default `~/.{appName}.db` if not set

### 2. Pyrite Database (`packages/pyrite/lib/database.ts`)
- Updated `initDatabase()` to check `DB_PATH` environment variable first
- Falls back to default `~/.pyrite.db` if not set

### 3. Config Loading (`packages/pyrite/lib/config.ts`, `packages/expressio/lib/config.ts`)
- Updated `initConfig()` and `saveConfig()` to check `CONFIG_PATH` environment variable first
- Falls back to default `~/.{app}rc` if not set

### 4. Service Initialization (`packages/pyrite/service.ts`, `packages/expressio/service.ts`)
- Updated to use `CONFIG_PATH` environment variable when calling `service.init()`
- Falls back to default config path if not set

### 5. Middleware (`packages/pyrite/lib/middleware.ts`, `packages/expressio/lib/middleware.ts`)
- Updated to use `CONFIG_PATH` environment variable when creating handlers
- Falls back to default config path if not set

### 6. PR Deployment Systemd Services (`packages/malkovich/lib/pr-deploy.ts`)
- **Created isolated data directory**: Each PR deployment gets `~/garage44/pr-{number}/data/` directory
- **Set environment variables**: Systemd services now set:
  - `DB_PATH={prDir}/data/{packageName}.db`
  - `CONFIG_PATH={prDir}/data/.{packageName}rc`
- **Created data directory**: Ensures `data/` directory exists during deployment

## How It Works

### Main Deployment
- Uses default paths: `~/.pyrite.db`, `~/.expressio.db`, `~/.pyriterc`, `~/.expressiorc`
- No environment variables set, so defaults are used

### PR Deployments
- Each PR gets isolated storage in `~/garage44/pr-{number}/data/`
- Database files: `~/garage44/pr-{number}/data/pyrite.db`, `~/garage44/pr-{number}/data/expressio.db`
- Config files: `~/garage44/pr-{number}/data/.pyriterc`, `~/garage44/pr-{number}/data/.expressiorc`
- Environment variables set in systemd service files ensure isolation

### Cleanup
- PR cleanup already removes entire deployment directory (`rm -rf {prDir}`)
- This automatically removes isolated database and config files
- No additional cleanup needed

## Benefits

1. ✅ **Isolated instances**: Each PR deployment has its own database and config
2. ✅ **Default data initialization**: PR deployments initialize fresh databases with default data
3. ✅ **No conflicts**: Main deployment and PR deployments don't interfere with each other
4. ✅ **Backward compatible**: Main deployment continues using default paths
5. ✅ **Automatic cleanup**: PR cleanup removes isolated data automatically

## Testing

To test the fix:

1. **Deploy a PR**:
   ```bash
   bun run malkovich deploy-pr --number 999 --branch main
   ```

2. **Check systemd service**:
   ```bash
   sudo systemctl cat pr-999-pyrite.service | grep -E "DB_PATH|CONFIG_PATH"
   ```
   Should show:
   ```
   Environment="DB_PATH=/home/garage44/garage44/pr-999/data/pyrite.db"
   Environment="CONFIG_PATH=/home/garage44/garage44/pr-999/data/.pyriterc"
   ```

3. **Check database file**:
   ```bash
   ls -la ~/garage44/pr-999/data/
   ```
   Should show isolated database and config files

4. **Check logs**:
   ```bash
   sudo journalctl -u pr-999-pyrite.service -n 50 | grep Database
   ```
   Should show database initialization at the isolated path

5. **Verify default data**: Access the PR deployment and verify default channels/users exist

6. **Cleanup**:
   ```bash
   bun run malkovich cleanup-pr --number 999
   ```
   Should remove entire `~/garage44/pr-999/` directory including data files

## Files Changed

- `packages/common/lib/database.ts` - Added `DB_PATH` env var support
- `packages/pyrite/lib/database.ts` - Added `DB_PATH` env var support
- `packages/pyrite/lib/config.ts` - Added `CONFIG_PATH` env var support
- `packages/expressio/lib/config.ts` - Added `CONFIG_PATH` env var support
- `packages/pyrite/service.ts` - Use `CONFIG_PATH` env var
- `packages/expressio/service.ts` - Use `CONFIG_PATH` env var
- `packages/pyrite/lib/middleware.ts` - Use `CONFIG_PATH` env var
- `packages/expressio/lib/middleware.ts` - Use `CONFIG_PATH` env var
- `packages/malkovich/lib/pr-deploy.ts` - Set env vars in systemd services, create data directory

## Notes

- Main deployment continues to work as before (uses default paths)
- PR deployments automatically get isolated storage
- No manual configuration needed - environment variables are set automatically
- Database and config files are created automatically when services start
- Cleanup is automatic when PRs are closed or after 7 days
