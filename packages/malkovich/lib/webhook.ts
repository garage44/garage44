import {$} from 'bun'
import {homedir} from 'node:os'
import {existsSync, unlinkSync} from 'fs'
import {join} from 'path'
import {findWorkspaceRoot, extractWorkspacePackages, isApplicationPackage} from './workspace'
import {generatePRService} from './deploy/pr-services'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''
const REPO_PATH = process.env.REPO_PATH || findWorkspaceRoot() || process.cwd()
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const ALLOWED_BRANCH_PATTERNS = (process.env.PR_ALLOWED_BRANCH_PATTERNS || 'cursor/*').split(',').map(p => p.trim())
const PR_BASE_PORT = parseInt(process.env.PR_BASE_PORT || '4000', 10)

/**
 * Validate GitHub webhook signature
 */
export async function validateSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    if (!secret) {
        console.error('[webhook] WEBHOOK_SECRET not configured')
        return false
    }

    if (!signature) {
        return false
    }

    // GitHub sends signature as "sha256=<hash>"
    const sigHash = signature.replace('sha256=', '')

    // Calculate HMAC SHA-256 using Bun's built-in crypto
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const payloadData = encoder.encode(payload)

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        {hash: 'SHA-256', name: 'HMAC'},
        false,
        ['sign'],
    )

    const hmacSignature = await crypto.subtle.sign('HMAC', key, payloadData)
    const calculatedHash = Array.from(new Uint8Array(hmacSignature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    // Use constant-time comparison to prevent timing attacks
    if (calculatedHash.length !== sigHash.length) {
        return false
    }

    let result = 0
    for (let i = 0; i < calculatedHash.length; i++) {
        const calculatedCode = calculatedHash.codePointAt(i) ?? 0
        const sigCode = sigHash.codePointAt(i) ?? 0
        result |= calculatedCode ^ sigCode
    }

    return result === 0
}

/**
 * Remove database files to ensure clean state
 */
function removeDatabases(): void {
    console.log('[deploy] Removing database files...')

    const dbFiles = [
        `${homedir()}/.pyrite.db`,
        `${homedir()}/.expressio.db`,
    ]

    // Also remove WAL and SHM files if they exist
    const walShmFiles = [
        `${homedir()}/.pyrite.db-wal`,
        `${homedir()}/.pyrite.db-shm`,
        `${homedir()}/.expressio.db-wal`,
        `${homedir()}/.expressio.db-shm`,
    ]

    for (const file of [...dbFiles, ...walShmFiles]) {
        if (existsSync(file)) {
            try {
                unlinkSync(file)
                console.log(`[deploy] Removed ${file}`)
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)
                console.warn(`[deploy] Failed to remove ${file}: ${message}`)
            }
        }
    }
}

/**
 * Check if branch name matches allowed patterns
 */
function isBranchAllowed(branchName: string): boolean {
    if (!branchName) return false
    
    // Remove refs/heads/ prefix if present
    const cleanBranch = branchName.replace(/^refs\/heads\//, '')
    
    return ALLOWED_BRANCH_PATTERNS.some(pattern => {
        // Convert glob pattern to regex
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')
        const regex = new RegExp(`^${regexPattern}$`)
        return regex.test(cleanBranch)
    })
}

/**
 * Validate PR is from the same repository (not a fork)
 */
async function validatePRSource(prNumber: number, repoOwner: string, repoName: string): Promise<boolean> {
    if (!GITHUB_TOKEN) {
        console.warn('[webhook/pr] GITHUB_TOKEN not set, skipping PR source validation')
        return true // Allow if token not configured (for testing)
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        })

        if (!response.ok) {
            console.error(`[webhook/pr] Failed to fetch PR ${prNumber}: ${response.status}`)
            return false
        }

        const pr = await response.json()
        
        // Check if PR is from a fork
        if (pr.head.repo.full_name !== `${repoOwner}/${repoName}`) {
            console.error(`[webhook/pr] PR ${prNumber} is from fork: ${pr.head.repo.full_name}`)
            return false
        }

        // Check if PR is open
        if (pr.state !== 'open') {
            console.error(`[webhook/pr] PR ${prNumber} is not open (state: ${pr.state})`)
            return false
        }

        return true
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[webhook/pr] Error validating PR source: ${message}`)
        return false
    }
}

/**
 * Deploy packages for PR: pull code, build, start isolated services
 */
export async function deployPR(prNumber: number, branchName: string): Promise<{message: string; success: boolean; ports?: Record<string, number>}> {
    try {
        console.log(`[deploy/pr] Starting PR deployment for PR #${prNumber} (branch: ${branchName})`)
        console.log(`[deploy/pr] Repository path: ${REPO_PATH}`)

        // Change to repository directory
        process.chdir(REPO_PATH)

        // Clean branch name (remove refs/heads/)
        const cleanBranch = branchName.replace(/^refs\/heads\//, '')

        // Fetch and checkout PR branch
        console.log(`[deploy/pr] Fetching branch ${cleanBranch}...`)
        const fetchResult = await $`git fetch origin ${cleanBranch}`.quiet()
        if (fetchResult.exitCode !== 0) {
            throw new Error(`Failed to fetch branch ${cleanBranch}`)
        }

        // Checkout the branch
        console.log(`[deploy/pr] Checking out branch ${cleanBranch}...`)
        const checkoutResult = await $`git checkout ${cleanBranch}`.quiet()
        if (checkoutResult.exitCode !== 0) {
            throw new Error(`Failed to checkout branch ${cleanBranch}`)
        }

        // Reset to origin to ensure clean state
        const resetResult = await $`git reset --hard origin/${cleanBranch}`.quiet()
        if (resetResult.exitCode !== 0) {
            throw new Error(`Failed to reset branch ${cleanBranch}`)
        }
        console.log(`[deploy/pr] Branch ${cleanBranch} checked out successfully`)

        // Remove database files (use PR-specific paths to avoid conflicts)
        console.log(`[deploy/pr] Removing PR-specific database files...`)
        const prDbFiles = [
            `${homedir()}/.pyrite-pr-${prNumber}.db`,
            `${homedir()}/.expressio-pr-${prNumber}.db`,
        ]
        const prWalShmFiles = [
            `${homedir()}/.pyrite-pr-${prNumber}.db-wal`,
            `${homedir()}/.pyrite-pr-${prNumber}.db-shm`,
            `${homedir()}/.expressio-pr-${prNumber}.db-wal`,
            `${homedir()}/.expressio-pr-${prNumber}.db-shm`,
        ]
        for (const file of [...prDbFiles, ...prWalShmFiles]) {
            if (existsSync(file)) {
                try {
                    unlinkSync(file)
                    console.log(`[deploy/pr] Removed ${file}`)
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : String(error)
                    console.warn(`[deploy/pr] Failed to remove ${file}: ${message}`)
                }
            }
        }

        // Build all packages
        console.log(`[deploy/pr] Building all packages...`)
        const buildResult = await $`bun run build`.quiet()
        if (buildResult.exitCode !== 0) {
            throw new Error('Build failed')
        }
        console.log(`[deploy/pr] Build completed successfully`)

        // Auto-discover packages from workspace
        const workspaceRoot = findWorkspaceRoot() || REPO_PATH
        const allPackages = extractWorkspacePackages(workspaceRoot)
        const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))

        // Calculate ports for each service (base port + PR number offset)
        const portOffset = prNumber % 1000 // Keep ports in reasonable range
        const ports: Record<string, number> = {}
        
        // Start/restart PR-specific systemd services
        console.log(`[deploy/pr] Starting PR-specific systemd services...`)
        for (const packageName of appPackages) {
            const port = PR_BASE_PORT + portOffset + (appPackages.indexOf(packageName) * 10)
            ports[packageName] = port
            
            const serviceName = `${packageName}-pr-${prNumber}.service`
            const serviceFilePath = `/etc/systemd/system/${serviceName}`
            
            try {
                // Check if service exists
                const serviceExists = await $`test -f ${serviceFilePath}`.quiet()
                
                if (serviceExists.exitCode !== 0) {
                    // Create service file
                    console.log(`[deploy/pr] Creating service ${serviceName}...`)
                    const packageDir = join(workspaceRoot, 'packages', packageName)
                    const serviceContent = generatePRService(serviceName, prNumber, port, packageDir)
                    
                    // Write service file (requires sudo)
                    await $`sudo tee ${serviceFilePath}`.stdin(serviceContent).quiet()
                    
                    // Reload systemd
                    await $`sudo systemctl daemon-reload`.quiet()
                    
                    // Enable service
                    await $`sudo systemctl enable ${serviceName}`.quiet()
                    
                    console.log(`[deploy/pr] Service ${serviceName} created and enabled`)
                }
                
                // Start/restart service
                console.log(`[deploy/pr] Starting ${serviceName}...`)
                const startResult = await $`sudo systemctl restart ${serviceName}`.quiet()
                if (startResult.exitCode === 0) {
                    console.log(`[deploy/pr] ${serviceName} started successfully on port ${port}`)
                } else {
                    console.warn(`[deploy/pr] Failed to start ${serviceName}`)
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)
                console.warn(`[deploy/pr] Error managing ${serviceName}: ${message}`)
            }
        }

        console.log(`[deploy/pr] PR deployment completed successfully`)
        return {
            message: `PR deployment completed successfully`,
            success: true,
            ports,
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[deploy/pr] PR deployment failed: ${message}`)
        return {message: `PR deployment failed: ${message}`, success: false}
    }
}

/**
 * Deploy packages: pull code, remove databases, build, restart services
 */
export async function deploy(): Promise<{message: string; success: boolean}> {
    try {
        console.log('[deploy] Starting deployment...')
        console.log(`[deploy] Repository path: ${REPO_PATH}`)

        // Change to repository directory
        process.chdir(REPO_PATH)

        // Pull latest code from main branch
        console.log('[deploy] Pulling latest code from main branch...')
        const pullResult = await $`git fetch origin main && git reset --hard origin/main`.quiet()
        if (pullResult.exitCode !== 0) {
            throw new Error('Failed to pull latest code')
        }
        console.log('[deploy] Code pulled successfully')

        // Remove database files
        removeDatabases()

        // Build all packages
        console.log('[deploy] Building all packages...')
        const buildResult = await $`bun run build`.quiet()
        if (buildResult.exitCode !== 0) {
            throw new Error('Build failed')
        }
        console.log('[deploy] Build completed successfully')

        // Auto-discover packages from workspace
        const workspaceRoot = findWorkspaceRoot() || REPO_PATH
        const allPackages = extractWorkspacePackages(workspaceRoot)
        const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))

        // Always include malkovich in deployment
        const packagesToDeploy = [...appPackages, 'malkovich']

        // Restart systemd services for all packages
        console.log('[deploy] Restarting systemd services...')
        for (const packageName of packagesToDeploy) {
            try {
                console.log(`[deploy] Restarting ${packageName} service...`)
                const restartResult = await $`sudo systemctl restart ${packageName}.service`.quiet()
                if (restartResult.exitCode === 0) {
                    console.log(`[deploy] ${packageName} service restarted successfully`)
                } else {
                    console.warn(`[deploy] Failed to restart ${packageName} service`)
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)
                console.warn(`[deploy] Error restarting ${packageName}: ${message}`)
            }
        }

        console.log('[deploy] Deployment completed successfully')
        return {message: 'Deployment completed successfully', success: true}
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[deploy] Deployment failed: ${message}`)
        return {message: `Deployment failed: ${message}`, success: false}
    }
}

/**
 * Handle webhook request
 */
export async function handleWebhook(req: Request): Promise<Response> {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({error: 'Method not allowed'}), {
            headers: {'Content-Type': 'application/json'},
            status: 405,
        })
    }

    // Get signature from headers
    const signature = req.headers.get('x-hub-signature-256')
    if (!signature) {
        return new Response(JSON.stringify({error: 'Missing signature'}), {
            headers: {'Content-Type': 'application/json'},
            status: 401,
        })
    }

    // Read request body
    const payload = await req.text()

    // Validate signature
    const isValid = await validateSignature(payload, signature, WEBHOOK_SECRET)
    if (!isValid) {
        console.error('[webhook] Invalid signature')
        return new Response(JSON.stringify({error: 'Invalid signature'}), {
            headers: {'Content-Type': 'application/json'},
            status: 401,
        })
    }

    // Parse webhook payload
    let event
    try {
        event = JSON.parse(payload)
    } catch {
        return new Response(JSON.stringify({error: 'Invalid JSON payload'}), {
            headers: {'Content-Type': 'application/json'},
            status: 400,
        })
    }

    // Check event type
    const eventType = req.headers.get('x-github-event')
    if (eventType !== 'push') {
        return new Response(JSON.stringify({message: `Ignored: event type ${eventType}`}), {
            headers: {'Content-Type': 'application/json'},
            status: 200,
        })
    }

    // Only process push events to main branch
    if (event.ref !== 'refs/heads/main' && event.ref) {
        return new Response(JSON.stringify({message: 'Ignored: not main branch'}), {
            headers: {'Content-Type': 'application/json'},
            status: 200,
        })
    }

    // Process deployment asynchronously
    console.log('[webhook] Received push event to main branch, starting deployment...')
    deploy().then((result) => {
        if (result.success) {
            console.log('[webhook] Deployment successful')
        } else {
            console.error(`[webhook] Deployment failed: ${result.message}`)
        }
    }).catch((error) => {
        console.error(`[webhook] Deployment error: ${error.message}`)
    })

    // Return immediately (deployment runs in background)
    return new Response(JSON.stringify({
        message: 'Deployment triggered',
        timestamp: new Date().toISOString(),
    }), {
        headers: {'Content-Type': 'application/json'},
        status: 202,
    })
}

/**
 * Handle PR webhook request (for PR-triggered deployments)
 */
export async function handlePRWebhook(req: Request): Promise<Response> {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({error: 'Method not allowed'}), {
            headers: {'Content-Type': 'application/json'},
            status: 405,
        })
    }

    // Get signature from headers
    const signature = req.headers.get('x-hub-signature-256')
    if (!signature) {
        return new Response(JSON.stringify({error: 'Missing signature'}), {
            headers: {'Content-Type': 'application/json'},
            status: 401,
        })
    }

    // Read request body
    const payload = await req.text()

    // Validate signature
    const isValid = await validateSignature(payload, signature, WEBHOOK_SECRET)
    if (!isValid) {
        console.error('[webhook/pr] Invalid signature')
        return new Response(JSON.stringify({error: 'Invalid signature'}), {
            headers: {'Content-Type': 'application/json'},
            status: 401,
        })
    }

    // Parse webhook payload
    let event
    try {
        event = JSON.parse(payload)
    } catch {
        return new Response(JSON.stringify({error: 'Invalid JSON payload'}), {
            headers: {'Content-Type': 'application/json'},
            status: 400,
        })
    }

    // Check event type - support both pull_request and push events
    const eventType = req.headers.get('x-github-event')
    
    let prNumber: number | null = null
    let branchName: string | null = null
    let repoOwner: string | null = null
    let repoName: string | null = null

    if (eventType === 'pull_request') {
        // Pull request event
        prNumber = event.pull_request?.number
        branchName = event.pull_request?.head?.ref ? `refs/heads/${event.pull_request.head.ref}` : null
        repoOwner = event.repository?.owner?.login || event.repository?.owner?.name
        repoName = event.repository?.name

        // Only process opened, synchronize, or reopened PRs
        if (!['opened', 'synchronize', 'reopened'].includes(event.action)) {
            return new Response(JSON.stringify({message: `Ignored: PR action ${event.action}`}), {
                headers: {'Content-Type': 'application/json'},
                status: 200,
            })
        }
    } else if (eventType === 'push') {
        // Push event to PR branch (from GitHub Actions)
        branchName = event.ref
        prNumber = event.pull_request?.number || null
        
        // Extract PR number from branch name if not provided (e.g., cursor/pr-123)
        if (!prNumber && branchName) {
            const prMatch = branchName.match(/pr[_-]?(\d+)/i)
            if (prMatch) {
                prNumber = parseInt(prMatch[1], 10)
            }
        }

        repoOwner = event.repository?.owner?.login || event.repository?.owner?.name
        repoName = event.repository?.name
    } else {
        return new Response(JSON.stringify({message: `Ignored: event type ${eventType}`}), {
            headers: {'Content-Type': 'application/json'},
            status: 200,
        })
    }

    // Validate required fields
    if (!prNumber || !branchName) {
        return new Response(JSON.stringify({error: 'Missing PR number or branch name'}), {
            headers: {'Content-Type': 'application/json'},
            status: 400,
        })
    }

    // Validate branch name matches allowed patterns
    if (!isBranchAllowed(branchName)) {
        console.error(`[webhook/pr] Branch ${branchName} does not match allowed patterns: ${ALLOWED_BRANCH_PATTERNS.join(', ')}`)
        return new Response(JSON.stringify({error: 'Branch not allowed for PR deployment'}), {
            headers: {'Content-Type': 'application/json'},
            status: 403,
        })
    }

    // Validate PR is from same repository (not a fork)
    if (repoOwner && repoName) {
        const isValidSource = await validatePRSource(prNumber, repoOwner, repoName)
        if (!isValidSource) {
            return new Response(JSON.stringify({error: 'PR must be from the same repository'}), {
                headers: {'Content-Type': 'application/json'},
                status: 403,
            })
        }
    }

    // Process PR deployment asynchronously
    console.log(`[webhook/pr] Received ${eventType} event for PR #${prNumber} (branch: ${branchName}), starting deployment...`)
    deployPR(prNumber, branchName).then((result) => {
        if (result.success) {
            console.log(`[webhook/pr] PR #${prNumber} deployment successful`)
            if (result.ports) {
                console.log(`[webhook/pr] PR #${prNumber} services running on ports:`, result.ports)
            }
        } else {
            console.error(`[webhook/pr] PR #${prNumber} deployment failed: ${result.message}`)
        }
    }).catch((error) => {
        console.error(`[webhook/pr] PR #${prNumber} deployment error: ${error.message}`)
    })

    // Return immediately (deployment runs in background)
    return new Response(JSON.stringify({
        message: 'PR deployment triggered',
        pr: prNumber,
        branch: branchName,
        timestamp: new Date().toISOString(),
    }), {
        headers: {'Content-Type': 'application/json'},
        status: 202,
    })
}
