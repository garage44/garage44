import {$} from 'bun'
import {homedir} from 'node:os'
import {existsSync, unlinkSync} from 'fs'
import {join as pathJoin} from 'path'
import {findWorkspaceRoot, extractWorkspacePackages, isApplicationPackage} from './workspace'
import {cleanupPRDeployment} from './pr-cleanup'
import {deployPR, type PRMetadata} from './pr-deploy'
import {updatePRDeployment} from './pr-registry'

interface PullRequestWebhookEvent {
    action?: string
    pull_request?: {
        head?: {
            ref?: string
            repo?: {
                fork: boolean
                full_name: string
            }
            sha?: string
        }
        number?: number
        user?: {
            login: string
        }
    }
}

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''
const REPO_PATH = process.env.REPO_PATH || findWorkspaceRoot() || process.cwd()

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
 * Deploy packages: pull code, remove databases, build, restart services
 */
export async function deploy(): Promise<{message: string; success: boolean}> {
    try {
        console.log('[deploy] Starting deployment...')
        console.log(`[deploy] Repository path: ${REPO_PATH}`)
        console.log(`[deploy] Current working directory: ${process.cwd()}`)

        // Verify repository path exists
        if (!existsSync(REPO_PATH)) {
            throw new Error(`Repository path does not exist: ${REPO_PATH}`)
        }
        console.log(`[deploy] Repository path verified: ${REPO_PATH}`)

        // Change to repository directory
        try {
            process.chdir(REPO_PATH)
            console.log(`[deploy] Changed to repository directory: ${process.cwd()}`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            throw new Error(`Failed to change to repository directory: ${message}`)
        }

        // Verify git repository
        if (!existsSync(pathJoin(REPO_PATH, '.git'))) {
            throw new Error(`Not a git repository: ${REPO_PATH}`)
        }
        console.log('[deploy] Git repository verified')

        // Pull latest code from main branch
        console.log('[deploy] Pulling latest code from main branch...')
        const pullResult = await $`git fetch origin main && git reset --hard origin/main`.nothrow()
        if (pullResult.exitCode !== 0) {
            const stderr = pullResult.stderr?.toString() || ''
            const stdout = pullResult.stdout?.toString() || ''
            console.error(`[deploy] Git pull failed with exit code ${pullResult.exitCode}`)
            console.error(`[deploy] Git pull stderr: ${stderr}`)
            console.error(`[deploy] Git pull stdout: ${stdout}`)
            throw new Error(`Failed to pull latest code: ${stderr || stdout || 'Unknown error'}`)
        }
        console.log('[deploy] Code pulled successfully')

        // Verify bun is available
        try {
            const bunVersionResult = await $`bun --version`.nothrow()
            if (bunVersionResult.exitCode !== 0) {
                throw new Error('Bun is not available or not in PATH')
            }
            const bunVersion = bunVersionResult.stdout?.toString().trim() || 'unknown'
            console.log(`[deploy] Bun version: ${bunVersion}`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error)
            throw new Error(`Failed to verify bun installation: ${message}`)
        }

        // Remove database files
        console.log('[deploy] Removing database files...')
        removeDatabases()
        console.log('[deploy] Database files removed')

        // Verify package.json exists
        const packageJsonPath = pathJoin(REPO_PATH, 'package.json')
        if (!existsSync(packageJsonPath)) {
            throw new Error(`package.json not found at ${packageJsonPath}`)
        }
        console.log('[deploy] package.json verified')

        // Build all packages
        console.log('[deploy] Building all packages...')
        console.log('[deploy] Build command: bun run build')
        console.log(`[deploy] Working directory: ${process.cwd()}`)
        const buildResult = await $`bun run build`.nothrow()
        if (buildResult.exitCode !== 0) {
            const stderr = buildResult.stderr?.toString() || ''
            const stdout = buildResult.stdout?.toString() || ''
            const errorOutput = stderr || stdout || 'Unknown build error'
            console.error(`[deploy] Build failed with exit code ${buildResult.exitCode}`)
            console.error(`[deploy] Build stderr (first 2000 chars): ${stderr.slice(0, 2000)}`)
            console.error(`[deploy] Build stdout (first 2000 chars): ${stdout.slice(0, 2000)}`)
            if (stderr.length > 2000) {
                console.error(`[deploy] Build stderr (truncated, total length: ${stderr.length})`)
            }
            if (stdout.length > 2000) {
                console.error(`[deploy] Build stdout (truncated, total length: ${stdout.length})`)
            }
            throw new Error(`Build failed: ${errorOutput.slice(0, 1000)}`)
        }
        console.log('[deploy] Build completed successfully')

        // Auto-discover packages from workspace
        console.log('[deploy] Discovering packages to deploy...')
        const workspaceRoot = findWorkspaceRoot() || REPO_PATH
        console.log(`[deploy] Workspace root: ${workspaceRoot}`)
        const allPackages = extractWorkspacePackages(workspaceRoot)
        console.log(`[deploy] All packages found: ${allPackages.join(', ')}`)
        const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))
        console.log(`[deploy] Application packages: ${appPackages.join(', ')}`)

        // Always include malkovich in deployment
        const packagesToDeploy = [...appPackages, 'malkovich']
        console.log(`[deploy] Packages to deploy: ${packagesToDeploy.join(', ')}`)

        // Restart systemd services for all packages
        console.log('[deploy] Restarting systemd services...')
        for (const packageName of packagesToDeploy) {
            try {
                console.log(`[deploy] Restarting ${packageName} service...`)
                const restartResult = await $`sudo systemctl restart ${packageName}.service`.nothrow()
                if (restartResult.exitCode === 0) {
                    console.log(`[deploy] ${packageName} service restarted successfully`)
                } else {
                    const stderr = restartResult.stderr?.toString() || ''
                    const stdout = restartResult.stdout?.toString() || ''
                    console.warn(`[deploy] Failed to restart ${packageName} service (exit code ${restartResult.exitCode})`)
                    console.warn(`[deploy] ${packageName} restart stderr: ${stderr}`)
                    console.warn(`[deploy] ${packageName} restart stdout: ${stdout}`)
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
        const stack = error instanceof Error ? error.stack : undefined
        console.error(`[deploy] Deployment failed: ${message}`)
        if (stack) {
            console.error(`[deploy] Stack trace: ${stack}`)
        }
        return {message: `Deployment failed: ${message}`, success: false}
    }
}

/**
 * Handle pull request events
 */
async function handlePullRequestEvent(event: PullRequestWebhookEvent): Promise<Response> {
    const action = event.action
    const pullRequest = event.pull_request
    const prNumber = pullRequest?.number

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
        if (!pullRequest?.head?.ref || !pullRequest.head.sha || !pullRequest.head.repo?.full_name || typeof pullRequest.head.repo.fork !== 'boolean' || !pullRequest.user?.login) {
            return new Response(JSON.stringify({error: 'Incomplete pull request payload'}), {
                headers: {'Content-Type': 'application/json'},
                status: 422,
            })
        }

        const pr: PRMetadata = {
            author: pullRequest.user.login,
            head_ref: pullRequest.head.ref,
            head_sha: pullRequest.head.sha,
            is_fork: pullRequest.head.repo.fork,
            number: prNumber,
            repo_full_name: pullRequest.head.repo.full_name,
        }

        // Deploy asynchronously (but log errors properly)
        deployPR(pr).then((result) => {
            if (result.success) {
                console.log(`[webhook] PR #${prNumber} deployment successful: ${result.message}`)
            } else {
                console.error(`[webhook] PR #${prNumber} deployment failed: ${result.message}`)
                // Update deployment status to failed if it exists
                if (result.deployment) {
                    updatePRDeployment(prNumber, {status: 'failed'}).catch((err) => {
                        console.error('[webhook] Failed to update deployment status:', err)
                    })
                }
            }
        }).catch((error) => {
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error(`[webhook] PR #${prNumber} deployment error:`, errorMessage)
            // Update deployment status to failed
            updatePRDeployment(prNumber, {status: 'failed'}).catch((err) => {
                console.error('[webhook] Failed to update deployment status:', err)
            })
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

    // Handle pull request events
    if (eventType === 'pull_request') {
        return await handlePullRequestEvent(event)
    }

    // Handle push events (main branch deployment)
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
