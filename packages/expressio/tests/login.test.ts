import {describe, expect, it} from 'bun:test'
import {chromium} from 'playwright-core'

interface PlaywrightLoginOptions {
    baseUrl?: string
    headless?: boolean
    password?: string
    username?: string
}

async function playwrightLogin(options: PlaywrightLoginOptions = {}) {
    const baseUrl = options.baseUrl || process.env.EXPRESSIO_URL || 'http://localhost:3030'
    const username = options.username || process.env.EXPRESSIO_USER || 'admin'
    const password = options.password || process.env.EXPRESSIO_PASS || 'admin'
    const headless = options.headless ?? true

    const browser = await chromium.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
        headless,
    })
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(baseUrl)

    // If security is disabled, /api/context already returns admin; still hit it to initialize
    await page.goto(`${baseUrl}/`)
    const alreadyAuth = await page.evaluate(async () => {
        try {
            const response = await fetch('/api/context')
            const json = await response.json()
            return !!json?.authenticated
        } catch {
            return false
        }
    })
    if (!alreadyAuth) {
        await page.locator('.id-field input').waitFor({state: 'visible'})
        await page.locator('.id-field input').fill(username)
        await page.locator('.password-field input').fill(password)
        const loginButton = page.getByRole('button', {name: /login/i})
        if (await loginButton.count()) {
            await loginButton.first().click()
        } else {
            await page.locator('.login-container .c-button').first().click()
        }
        await page.waitForFunction(async () => {
            try {
                const response = await fetch('/api/context')
                const json = await response.json()
                return !!json?.authenticated
            } catch {
                return false
            }
        }, null, {timeout: 5000})
    }

    // Navigate to a relevant page to trigger data/WS
    await page.goto(`${baseUrl}/workspaces/expressio/settings`)

    // Give the app a moment to settle and establish WS
    await page.waitForTimeout(500)

    const text = await page.evaluate(async () => {
        const response = await fetch('/dev/snapshot')
        return response.text()
    })

    await browser.close()
    return {authenticated: true, snapshotText: text}
}

describe('expressio login', () => {
    it('logs in successfully and returns authentication result', async () => {
        const result = await playwrightLogin({
            baseUrl: process.env.EXPRESSIO_URL || 'http://localhost:3030',
            headless: true,
            password: process.env.EXPRESSIO_PASS || 'admin',
            username: process.env.EXPRESSIO_USER || 'admin',
        })

        expect(result.authenticated).toBe(true)
        expect(result.snapshotText).toBeDefined()
        expect(typeof result.snapshotText).toBe('string')
    }, 60_000)
})
