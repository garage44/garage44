#!/usr/bin/env bun

// Test script to validate CSS bundling with Bun
// Run with: bun test-css-bundling.js

import fs from 'fs-extra'
import path from 'path'

async function testCssBundling() {
    console.log('🧪 Testing CSS bundling with Bun...')

    // Test basic CSS bundling
    const testCssContent = `
@import "./packages/expressio/src/css/_variables.css";

.test-component {
    margin: var(--spacer-1);
    color: var(--info-5);
    
    &:hover {
        background: var(--info-2);
    }
    
    .nested {
        padding: calc(var(--spacer-1) * 2);
    }
}
`

    // Create a temporary test file
    const testFile = path.join(process.cwd(), 'test-input.css')
    const outputFile = path.join(process.cwd(), 'test-output.css')

    try {
        // Write test CSS
        await fs.writeFile(testFile, testCssContent)
        console.log('✅ Created test CSS file')

        // Test Bun CSS bundling
        const result = await Bun.build({
            entrypoints: [testFile],
            experimentalCss: true,
            outdir: process.cwd(),
            naming: 'test-output.[ext]',
        })

        if (result.success) {
            console.log('✅ CSS bundling successful!')
            
            // Check if output file exists
            if (await fs.pathExists(outputFile)) {
                const bundledCss = await fs.readFile(outputFile, 'utf8')
                console.log('✅ CSS output file created')
                console.log('📄 Bundled CSS preview:')
                console.log(bundledCss.substring(0, 200) + '...')
            } else {
                console.log('❌ Output file not found')
            }
        } else {
            console.log('❌ CSS bundling failed:')
            console.log(result.logs)
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message)
    } finally {
        // Cleanup
        await fs.remove(testFile).catch(() => {})
        await fs.remove(outputFile).catch(() => {})
        console.log('🧹 Cleaned up test files')
    }
}

testCssBundling()