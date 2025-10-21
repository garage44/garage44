#!/usr/bin/env bun

import {$} from 'bun'

async function setup() {
    console.log('🔧 Setting up screenshot dependencies...\n')

    try {
    // Install dependencies
        console.log('📦 Installing dependencies...')
        await $`bun install`
        console.log('✅ Dependencies installed\n')

        // Install playwright browsers
        console.log('🌐 Installing Playwright browsers...')
        await $`bunx playwright install chromium`
        console.log('✅ Playwright browsers installed\n')

        console.log('🎉 Screenshot setup completed!')
        console.log('📸 You can now run "bun run screenshots" to test screenshot generation')
        console.log('🚀 Or run "bun run publish" to publish with fresh screenshots')

    } catch (error: any) {
        console.error('❌ Setup failed:', error.message)
        process.exit(1)
    }
}

if (import.meta.main) {
    setup()
}