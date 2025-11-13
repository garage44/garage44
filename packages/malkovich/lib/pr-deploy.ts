import {$} from 'bun'
import {existsSync, mkdirSync} from 'fs'
import {homedir} from 'os'
import path from 'path'
import {
    addPRDeployment,
    getPRDeployment,
    updatePRDeployment,
    type PRDeployment,
} from './pr-registry'
import {extractWorkspacePackages, isApplicationPackage, findWorkspaceRoot} from './workspace'

const PR_DEPLOYMENTS_DIR = path.join(homedir(), 'garage44')
const PR_PORT_BASE = 40000
const PR_PORT_RANGE = 10000

// Determine the main repository path
// On VPS: use REPO_PATH env var or default to /home/garage44/garage44
// Locally: use the current workspace root
function getMainRepoPath(): string {
    if (process.env.REPO_PATH) {
        return process.env.REPO_PATH
    }

    // Try to find the workspace root (for local development)
    const workspaceRoot = findWorkspaceRoot()
    if (workspaceRoot) {
        return workspaceRoot
    }

    // Fallback to VPS default
    return path.join(homedir(), 'garage44/garage44')
}

const MAIN_REPO_PATH = getMainRepoPath()

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
        if (existsSync(repoDir)) {
            console.log('[pr-deploy] Repository directory already exists, skipping clone')
        } else {
            console.log('[pr-deploy] Cloning repository...')
            console.log(`[pr-deploy] Source: ${MAIN_REPO_PATH}`)
            console.log(`[pr-deploy] Target: ${repoDir}`)
            const cloneResult = await $`git clone ${MAIN_REPO_PATH} ${repoDir}`.nothrow()
            if (cloneResult.exitCode !== 0) {
                const stderr = cloneResult.stderr?.toString() || ''
                const stdout = cloneResult.stdout?.toString() || ''
                const errorDetails = stderr || stdout || 'Unknown clone error'
                console.error(`[pr-deploy] Clone failed with exit code ${cloneResult.exitCode}`)
                console.error(`[pr-deploy] Clone stderr: ${stderr}`)
                console.error(`[pr-deploy] Clone stdout: ${stdout}`)
                await updatePRDeployment(pr.number, {status: 'failed'})
                throw new Error(`Failed to clone repository: ${errorDetails.slice(0, 500)}`)
            }
            console.log('[pr-deploy] Repository cloned successfully')
        }

        // Fetch and checkout PR branch
        console.log(`[pr-deploy] Checking out PR branch ${pr.head_ref}...`)
        process.chdir(repoDir)
        console.log(`[pr-deploy] Working directory: ${process.cwd()}`)

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
        console.log(`[pr-deploy] Checked out commit: ${pr.head_sha}`)

        // Install dependencies (must be run from workspace root)
        console.log('[pr-deploy] Installing dependencies...')
        console.log(`[pr-deploy] Installing from: ${process.cwd()}`)

        // First, install workspace dependencies
        const installResult = await $`bun install`.nothrow()
        if (installResult.exitCode !== 0) {
            const stderr = installResult.stderr?.toString() || ''
            const stdout = installResult.stdout?.toString() || ''
            const errorDetails = stderr || stdout || 'Unknown install error'
            console.error(`[pr-deploy] Install failed with exit code ${installResult.exitCode}`)
            console.error(`[pr-deploy] Install stderr: ${stderr}`)
            console.error(`[pr-deploy] Install stdout: ${stdout}`)
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error(`Failed to install dependencies: ${errorDetails.slice(0, 500)}`)
        }
        console.log('[pr-deploy] Dependencies installed successfully')

        // Bun's catalog dependencies should be auto-resolved, but verify they're available
        // If not, we may need to install them explicitly (Bun should handle this automatically)
        console.log('[pr-deploy] Verifying catalog dependencies are resolved...')
        const testImport = await $`bun -e "import('@preact/signals').then(() => console.log('OK')).catch(e => {console.error('FAIL:', e.message); process.exit(1)})"`.nothrow()
        if (testImport.exitCode === 0) {
            console.log('[pr-deploy] Catalog dependencies verified')
        } else {
            const testError = testImport.stderr?.toString() || testImport.stdout?.toString() || ''
            console.warn(`[pr-deploy] Catalog dependency check failed: ${testError}`)
            console.log('[pr-deploy] Installing catalog dependencies explicitly...')

            // Read catalog from package.json and install dependencies
            const packageJsonPath = path.join(repoDir, 'package.json')
            if (existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(await Bun.file(packageJsonPath).text())
                const catalog = packageJson.workspaces?.catalog || {}
                const catalogDeps = Object.keys(catalog)

                if (catalogDeps.length > 0) {
                    console.log(`[pr-deploy] Installing ${catalogDeps.length} catalog dependencies...`)
                    const catalogInstall = await $`bun install ${catalogDeps.join(' ')}`.nothrow()
                    if (catalogInstall.exitCode === 0) {
                        console.log('[pr-deploy] Catalog dependencies installed')
                    } else {
                        console.warn('[pr-deploy] Failed to install catalog dependencies explicitly')
                    }
                }
            }
        }

        // Build packages
        console.log('[pr-deploy] Building packages...')
        try {
            // Run build without quiet() first to capture any errors
            const buildResult = await $`bun run build`.nothrow()
            if (buildResult.exitCode !== 0) {
                const stderr = buildResult.stderr?.toString() || ''
                const stdout = buildResult.stdout?.toString() || ''
                const errorOutput = stderr || stdout || 'Unknown build error'
                console.error(`[pr-deploy] Build failed with exit code ${buildResult.exitCode}`)
                console.error(`[pr-deploy] Build stderr: ${stderr}`)
                console.error(`[pr-deploy] Build stdout: ${stdout}`)
                await updatePRDeployment(pr.number, {status: 'failed'})
                throw new Error(`Build failed: ${errorOutput.slice(0, 1000)}`)
            }
            console.log('[pr-deploy] Build completed successfully')
        } catch (error) {
            if (error instanceof Error && error.message.includes('Build failed')) {
                throw error
            }
            await updatePRDeployment(pr.number, {status: 'failed'})
            throw new Error(`Build failed: ${error instanceof Error ? error.message : String(error)}`, {cause: error})
        }

        // Discover which packages to deploy
        const allPackages = extractWorkspacePackages(repoDir)
        console.log(`[pr-deploy] All discovered packages: ${allPackages.join(', ')}`)
        const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))
        console.log(`[pr-deploy] Application packages (after filter): ${appPackages.join(', ')}`)
        const packagesToDeploy = [...appPackages, 'malkovich'] // Always include malkovich

        console.log(`[pr-deploy] Discovered packages to deploy: ${packagesToDeploy.join(', ')}`)

        // Generate systemd service files
        await generateSystemdServices(deployment, packagesToDeploy)

        // Generate nginx configuration
        await generateNginxConfig(deployment, packagesToDeploy)

        // Start services
        console.log('[pr-deploy] Starting services...')
        for (const packageName of packagesToDeploy) {
            const startResult = await $`sudo systemctl start pr-${pr.number}-${packageName}.service`.nothrow()
            if (startResult.exitCode === 0) {
                console.log(`[pr-deploy] Started ${packageName} service`)
            } else {
                const stderr = startResult.stderr?.toString() || ''
                const stdout = startResult.stdout?.toString() || ''
                const errorDetails = stderr || stdout || 'Unknown error'
                console.error(`[pr-deploy] Failed to start ${packageName} service`)
                console.error(`[pr-deploy] systemctl stderr: ${stderr}`)
                console.error(`[pr-deploy] systemctl stdout: ${stdout}`)
                // Check service status for more details
                const statusResult = await $`sudo systemctl status pr-${pr.number}-${packageName}.service --no-pager -l`.nothrow()
                if (statusResult.exitCode === 0) {
                    const statusOutput = statusResult.stdout?.toString() || ''
                    console.error(`[pr-deploy] Service status:\n${statusOutput}`)
                }
                throw new Error(`Failed to start ${packageName} service: ${errorDetails}`)
            }
        }

        // Update deployment status
        await updatePRDeployment(pr.number, {status: 'running'})

        // Port mapping for display
        const portMap: Record<string, number> = {
            expressio: deployment.ports.expressio,
            malkovich: deployment.ports.malkovich,
            pyrite: deployment.ports.pyrite,
        }

        console.log(`[pr-deploy] PR #${pr.number} deployed successfully`)
        console.log('[pr-deploy] URLs (public access, no token required):')
        for (const packageName of packagesToDeploy) {
            const port = portMap[packageName] || deployment.ports.malkovich
            const subdomain = `pr-${pr.number}-${packageName}.garage44.org`
            console.log(`[pr-deploy]   ${packageName}: https://${subdomain} (port ${port})`)
        }

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

        // Regenerate nginx configs to ensure correct port mapping
        console.log(`[pr-deploy] Regenerating nginx configurations...`)
        await generateNginxConfig(existing, packagesToDeploy)

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

        // Write service file using sudo (required for /etc/systemd/system/)
        // Use a temporary file and then move it with sudo to avoid shell escaping issues
        const tempFile = `/tmp/pr-${deployment.number}-${packageName}.service`
        await Bun.write(tempFile, content)
        const writeResult = await $`sudo mv ${tempFile} ${serviceFile}`.nothrow()
        if (writeResult.exitCode !== 0) {
            const stderr = writeResult.stderr?.toString() || ''
            const stdout = writeResult.stdout?.toString() || ''
            // Clean up temp file if move failed
            try {
                if (await Bun.file(tempFile).exists()) {
                    await Bun.file(tempFile).unlink()
                }
            } catch {
                // Ignore cleanup errors
            }
            throw new Error(`Failed to write systemd service file: ${stderr || stdout}`)
        }
        console.log(`[pr-deploy] Generated systemd service for ${packageName}`)
    }

    // Reload systemd
    const reloadResult = await $`sudo systemctl daemon-reload`.nothrow()
    if (reloadResult.exitCode !== 0) {
        const stderr = reloadResult.stderr?.toString() || ''
        const stdout = reloadResult.stdout?.toString() || ''
        throw new Error(`Failed to reload systemd daemon: ${stderr || stdout || 'Unknown error'}`)
    }
    console.log('[pr-deploy] Systemd daemon reloaded')
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
        
        // Log port mapping for debugging
        console.log(`[pr-deploy] Generating nginx config for ${packageName}: port ${port} (subdomain: pr-${prNumber}-${packageName}.${baseDomain})`)
        
        // Use single-level subdomain (pr-999-malkovich.garage44.org) to work with *.garage44.org wildcard cert
        const subdomain = `pr-${prNumber}-${packageName}.${baseDomain}`
        const configFile = `/etc/nginx/sites-available/${subdomain}`
        const enabledLink = `/etc/nginx/sites-enabled/${subdomain}`

        let content = `# PR #${prNumber} - ${packageName} service (subdomain: ${subdomain})
# Note: Rate limiting can be added by defining limit_req_zone in main nginx.conf
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

    # Rate limiting for public access (uncomment if zone is defined in main nginx.conf)
    # limit_req zone=pr_public burst=20 nodelay;
    # limit_req_status 429;
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

        // Write nginx config file using sudo (required for /etc/nginx/)
        // Use a temporary file and then move it with sudo to avoid shell escaping issues
        const tempNginxFile = `/tmp/pr-${prNumber}-${packageName}.nginx.conf`
        await Bun.write(tempNginxFile, content)
        const nginxWriteResult = await $`sudo mv ${tempNginxFile} ${configFile}`.nothrow()
        if (nginxWriteResult.exitCode !== 0) {
            const stderr = nginxWriteResult.stderr?.toString() || ''
            const stdout = nginxWriteResult.stdout?.toString() || ''
            // Clean up temp file if move failed
            try {
                if (await Bun.file(tempNginxFile).exists()) {
                    await Bun.file(tempNginxFile).unlink()
                }
            } catch {
                // Ignore cleanup errors
            }
            throw new Error(`Failed to write nginx config file: ${stderr || stdout}`)
        }

        // Create symlink if it doesn't exist
        if (!existsSync(enabledLink)) {
            await $`sudo ln -s ${configFile} ${enabledLink}`.quiet()
        }
    }

    // Reload nginx
    const nginxReloadResult = await $`sudo nginx -s reload`.nothrow()
    if (nginxReloadResult.exitCode !== 0) {
        const stderr = nginxReloadResult.stderr?.toString() || ''
        const stdout = nginxReloadResult.stdout?.toString() || ''
        // Check nginx config for syntax errors
        const testResult = await $`sudo nginx -t`.nothrow()
        const testOutput = testResult.stdout?.toString() || testResult.stderr?.toString() || ''
        throw new Error(`Failed to reload nginx: ${stderr || stdout || 'Unknown error'}\nNginx config test: ${testOutput}`)
    }
    console.log('[pr-deploy] Nginx reloaded successfully')
}

/**
 * Regenerate nginx configs for an existing PR deployment
 * Useful for fixing incorrect port mappings without redeploying
 */
export async function regeneratePRNginx(prNumber: number): Promise<{
    message: string
    success: boolean
}> {
    try {
        const deployment = await getPRDeployment(prNumber)
        if (!deployment) {
            return {
                message: `PR #${prNumber} deployment not found`,
                success: false,
            }
        }

        if (deployment.status !== 'running') {
            return {
                message: `PR #${prNumber} deployment is not running (status: ${deployment.status})`,
                success: false,
            }
        }

        console.log(`[pr-deploy] Regenerating nginx configs for PR #${prNumber}...`)

        const repoDir = path.join(deployment.directory, 'repo')
        
        // Discover which packages are deployed
        const allPackages = extractWorkspacePackages(repoDir)
        const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))
        const packagesToDeploy = [...appPackages, 'malkovich'] // Always include malkovich

        console.log(`[pr-deploy] Discovered packages: ${packagesToDeploy.join(', ')}`)

        // Regenerate nginx configs
        await generateNginxConfig(deployment, packagesToDeploy)

        console.log(`[pr-deploy] Nginx configs regenerated successfully for PR #${prNumber}`)

        return {
            message: `Nginx configs regenerated successfully for PR #${prNumber}`,
            success: true,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[pr-deploy] Failed to regenerate nginx configs: ${message}`)
        return {
            message: `Failed to regenerate nginx configs: ${message}`,
            success: false,
        }
    }
}
