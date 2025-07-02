#!/usr/bin/env bun

import { $ } from 'bun'
import {readFile, writeFile, copyFile, unlink } from 'fs/promises'
import { join } from 'path'

const packages = [
  { name: '@garage44/common', path: 'packages/common' },
  { name: '@garage44/bunchy', path: 'packages/bunchy' },
  { name: '@garage44/enola', path: 'packages/enola' },
  { name: '@garage44/expressio', path: 'packages/expressio' }
]

// Dependency graph - packages that depend on each other
const dependencies: Record<string, string[]> = {
  '@garage44/common': [],
  '@garage44/bunchy': ['@garage44/common'],
  '@garage44/enola': ['@garage44/common'],
  '@garage44/expressio': ['@garage44/common', '@garage44/bunchy', '@garage44/enola']
}

// Topological sort to determine publish order
function topologicalSort(graph: Record<string, string[]>): string[] {
  const visited = new Set<string>()
  const temp = new Set<string>()
  const order: string[] = []

  function visit(node: string): void {
    if (temp.has(node)) {
      throw new Error(`Circular dependency detected: ${node}`)
    }
    if (visited.has(node)) return

    temp.add(node)
    for (const dep of graph[node] || []) {
      visit(dep)
    }
    temp.delete(node)
    visited.add(node)
    order.push(node)
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      visit(node)
    }
  }

  return order
}

// Get current version from package.json
async function getCurrentVersion(packagePath: string): Promise<string> {
  const packageJson = JSON.parse(await readFile(join(packagePath, 'package.json'), 'utf8'))
  return packageJson.version
}

// Bump version (patch increment)
function bumpVersion(version: string): string {
  const [major, minor, patch] = version.split('.').map(Number)
  return `${major}.${minor}.${patch + 1}`
}

// Update package.json version
async function updateVersion(packagePath: string, newVersion: string): Promise<string> {
  const packageJsonPath = join(packagePath, 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  packageJson.version = newVersion
  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  return newVersion
}

// Main publish function
async function publish(): Promise<void> {
  console.log('🚀 Starting monorepo publish...\n')

  try {
    // 1. Build all packages
    console.log('📦 Building packages...')
    await $`bun run build`
    console.log('✅ Build completed\n')

    // 2. Determine publish order
    const publishOrder = topologicalSort(dependencies)
    console.log('📋 Publish order:', publishOrder.join(' → '), '\n')

    // 3. Collect current versions and bump them
    const packageVersions: Record<string, string> = {}
    for (const packageName of publishOrder) {
      const packageInfo = packages.find(p => p.name === packageName)
      if (!packageInfo) continue

      const currentVersion = await getCurrentVersion(packageInfo.path)
      const newVersion = bumpVersion(currentVersion)
      packageVersions[packageName] = newVersion

      console.log(`📝 ${packageName}: ${currentVersion} → ${newVersion}`)
    }
    console.log()

    // 4. Update versions and publish
    for (const packageName of publishOrder) {
      const packageInfo = packages.find(p => p.name === packageName)
      if (!packageInfo) continue

      console.log(`🚀 Publishing ${packageName}...`)

      // Special handling for expressio package - copy root README
      let readmeCopied = false
      if (packageName === '@garage44/expressio') {
        try {
          await copyFile('README.md', join(packageInfo.path, 'README.md'))
          console.log('📄 Copied root README.md to expressio package')
          readmeCopied = true
        } catch (error: any) {
          console.warn('⚠️ Could not copy README.md:', error.message)
        }
      }

      try {
        // Update version
        await updateVersion(packageInfo.path, packageVersions[packageName])

        // Publish
        await $`cd ${packageInfo.path} && bun publish`
        console.log(`✅ ${packageName} published successfully`)
      } catch (error: any) {
        console.error(`❌ Failed to publish ${packageName}:`, error.message)
        throw error
      } finally {
        // Clean up copied README for expressio package
        if (readmeCopied) {
          try {
            await unlink(join(packageInfo.path, 'README.md'))
            console.log('🧹 Removed copied README.md from expressio package')
          } catch (error: any) {
            console.warn('⚠️ Could not remove copied README.md:', error.message)
          }
        }
      }

      console.log()
    }

    console.log('🎉 All packages published successfully!')

  } catch (error: any) {
    console.error('❌ Publish failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.main) {
  publish()
}