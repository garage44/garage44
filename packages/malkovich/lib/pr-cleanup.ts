import {$} from 'bun'
import {existsSync} from 'fs'
import {
	getPRDeployment,
	loadPRRegistry,
	removePRDeployment,
	updatePRDeployment,
} from './pr-registry'

/**
 * Cleanup a specific PR deployment
 */
export async function cleanupPRDeployment(prNumber: number): Promise<{
	message: string
	success: boolean
}> {
	try {
		console.log(`[pr-cleanup] Cleaning up PR #${prNumber}...`)

		const deployment = await getPRDeployment(prNumber)
		if (!deployment) {
			return {
				message: `PR #${prNumber} not found`,
				success: false,
			}
		}

		// Update status
		await updatePRDeployment(prNumber, {status: 'cleaning'})

		// Stop systemd services
		const services = ['expressio', 'pyrite', 'malkovich']
		for (const service of services) {
			try {
				await $`sudo systemctl stop pr-${prNumber}-${service}.service`.quiet()
				console.log(`[pr-cleanup] Stopped ${service} service`)
			} catch (error) {
				console.warn(`[pr-cleanup] Failed to stop ${service} service:`, error)
			}
		}

		// Remove systemd units
		for (const service of services) {
			try {
				const serviceFile = `/etc/systemd/system/pr-${prNumber}-${service}.service`
				if (existsSync(serviceFile)) {
					await $`sudo rm -f ${serviceFile}`.quiet()
				}
			} catch (error) {
				console.warn(`[pr-cleanup] Failed to remove ${service} unit:`, error)
			}
		}

		await $`sudo systemctl daemon-reload`.quiet()

		// Remove nginx configuration
		try {
			const domain = `pr-${prNumber}.garage44.org`
			await $`sudo rm -f /etc/nginx/sites-enabled/${domain}`.quiet()
			await $`sudo rm -f /etc/nginx/sites-available/${domain}`.quiet()
			await $`sudo nginx -s reload`.quiet()
			console.log(`[pr-cleanup] Removed nginx configuration`)
		} catch (error) {
			console.warn(`[pr-cleanup] Failed to remove nginx config:`, error)
		}

		// Remove deployment directory
		try {
			await $`rm -rf ${deployment.directory}`.quiet()
			console.log(`[pr-cleanup] Removed deployment directory`)
		} catch (error) {
			console.warn(`[pr-cleanup] Failed to remove directory:`, error)
		}

		// Remove from registry
		await removePRDeployment(prNumber)

		console.log(`[pr-cleanup] PR #${prNumber} cleaned up successfully`)

		return {
			message: `PR #${prNumber} cleaned up successfully`,
			success: true,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`[pr-cleanup] Cleanup failed: ${message}`)
		return {
			message: `Cleanup failed: ${message}`,
			success: false,
		}
	}
}

/**
 * Cleanup stale PR deployments (older than maxAge)
 */
export async function cleanupStaleDeployments(
	maxAgeDays: number = 7,
): Promise<{cleaned: number; message: string}> {
	try {
		console.log(`[pr-cleanup] Checking for stale deployments (max age: ${maxAgeDays} days)...`)

		const registry = await loadPRRegistry()
		const maxAge = maxAgeDays * 24 * 60 * 60 * 1000
		const now = Date.now()

		let cleaned = 0
		for (const [prNumber, deployment] of Object.entries(registry)) {
			const age = now - deployment.created
			if (age > maxAge) {
				console.log(`[pr-cleanup] PR #${prNumber} is stale (${Math.round(age / (24 * 60 * 60 * 1000))} days old)`)
				const result = await cleanupPRDeployment(Number(prNumber))
				if (result.success) {
					cleaned++
				}
			}
		}

		const message = cleaned > 0
			? `Cleaned up ${cleaned} stale deployment(s)`
			: 'No stale deployments found'

		console.log(`[pr-cleanup] ${message}`)

		return {cleaned, message}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`[pr-cleanup] Stale cleanup failed: ${message}`)
		return {cleaned: 0, message: `Cleanup failed: ${message}`}
	}
}

/**
 * List all PR deployments
 */
export async function listPRDeployments(): Promise<void> {
	const registry = await loadPRRegistry()
	const deployments = Object.values(registry)

	if (deployments.length === 0) {
		console.log('No active PR deployments')
		return
	}

	console.log(`\nActive PR Deployments (${deployments.length}):\n`)

	for (const deployment of deployments) {
		const ageHours = Math.round((Date.now() - deployment.created) / (60 * 60 * 1000))
		console.log(`PR #${deployment.number}:`)
		console.log(`  Branch: ${deployment.head_ref}`)
		console.log(`  Author: ${deployment.author}`)
		console.log(`  Age: ${ageHours} hours`)
		console.log(`  URL: https://pr-${deployment.number}.garage44.org`)
		console.log(`  Ports: ${deployment.ports.malkovich} (malkovich), ${deployment.ports.expressio} (expressio), ${deployment.ports.pyrite} (pyrite)`)
		console.log(`  Status: ${deployment.status}`)
		console.log('')
	}
}
