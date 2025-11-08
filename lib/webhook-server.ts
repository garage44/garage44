#!/usr/bin/env bun
import {$} from 'bun'
import {homedir} from 'node:os'
import {existsSync, unlinkSync} from 'fs'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''
const WEBHOOK_PORT = parseInt(process.env.WEBHOOK_PORT || '3001', 10)
const REPO_PATH = process.env.REPO_PATH || '/home/garage44/garage44'
const DEPLOY_USER = process.env.DEPLOY_USER || 'garage44'

const PACKAGES = ['expressio', 'pyrite', 'styleguide']

/**
 * Validate GitHub webhook signature
 */
async function validateSignature(payload: string, signature: string, secret: string): Promise<boolean> {
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
async function deploy(): Promise<{message: string; success: boolean}> {
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

        // Restart systemd services for all packages
        console.log('[deploy] Restarting systemd services...')
        for (const packageName of PACKAGES) {
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
async function handleWebhook(req: Request): Promise<Response> {
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
    if (isValid) {
        // Continue processing
    } else {
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

    // Check event type first
    const eventType = req.headers.get('x-github-event')
    if (eventType === 'push') {
        // Continue processing
    } else {
        return new Response(JSON.stringify({message: `Ignored: event type ${eventType}`}), {
            headers: {'Content-Type': 'application/json'},
            status: 200,
        })
    }

    // Only process push events to main branch
    if (event.ref === 'refs/heads/main' || !event.ref) {
        // Continue processing
    } else {
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
 * Start webhook server
 */
function startServer(): void {
    if (!WEBHOOK_SECRET) {
        console.error('[webhook] ERROR: WEBHOOK_SECRET environment variable is not set')
        console.error('[webhook] Please set WEBHOOK_SECRET before starting the server')
        process.exit(1)
    }

    Bun.serve({
        fetch: handleWebhook,
        hostname: '127.0.0.1', // Only listen on localhost (nginx will proxy)
        port: WEBHOOK_PORT,
    })

    console.log(`[webhook] Server started on http://127.0.0.1:${WEBHOOK_PORT}`)
    console.log(`[webhook] Repository path: ${REPO_PATH}`)
    console.log(`[webhook] Deploy user: ${DEPLOY_USER}`)
    console.log(`[webhook] Packages: ${PACKAGES.join(', ')}`)
}

// Start server if called directly
if (import.meta.main) {
    startServer()
}
