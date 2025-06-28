#!/usr/bin/env bun

import { $ } from 'bun'
import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const packages = [
  { name: '@garage44/common', path: 'packages/common' },
  { name: '@garage44/bunchy', path: 'packages/bunchy' },
  { name: '@garage44/enola', path: 'packages/enola' },
  { name: '@garage44/expressio', path: 'packages/expressio' }
]

// Dependency graph - packages that depend on each other
const dependencies = {
  '@garage44/common': [],
  '@garage44/bunchy': ['@garage44/common'],
  '@garage44/enola': ['@garage44/common'],
  '@garage44/expressio': ['@garage44/common', '@garage44/bunchy', '@garage44/enola']
}

// Topological sort to determine publish order
function topologicalSort(graph) {
  const visited = new Set()
  const temp = new Set()
  const order = []

  function visit(node) {
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
async function getCurrentVersion(packagePath) {
  const packageJson = JSON.parse(await readFile(join(packagePath, 'package.json'), 'utf8'))
  return packageJson.version
}

// Bump version (patch increment)
function bumpVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number)
  return `${major}.${minor}.${patch + 1}`
}

// Update package.json version
async function updateVersion(packagePath, newVersion) {
  const packageJsonPath = join(packagePath, 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
  packageJson.version = newVersion
  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  return newVersion
}

// Main publish function
async function publish() {
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
    const packageVersions = {}
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

      // Update version
      await updateVersion(packageInfo.path, packageVersions[packageName])

      // Publish
      try {
        await $`cd ${packageInfo.path} && npm publish`
        console.log(`✅ ${packageName} published successfully`)
      } catch (error) {
        console.error(`❌ Failed to publish ${packageName}:`, error.message)
        throw error
      }

      console.log()
    }

    console.log('🎉 All packages published successfully!')

  } catch (error) {
    console.error('❌ Publish failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.main) {
  publish()
}