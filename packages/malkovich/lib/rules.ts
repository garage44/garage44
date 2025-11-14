import {symlink, mkdir, unlink, stat} from 'fs/promises'
import {join} from 'path'
import {findWorkspaceRoot} from './workspace'

/**
 * Create symlink from .cursor/rules to packages/malkovich/docs/rules
 */
export async function rules(): Promise<void> {
    const workspaceRoot = findWorkspaceRoot() || process.cwd()
    const cursorRulesPath = join(workspaceRoot, '.cursor', 'rules')
    const malkovichRulesPath = join(workspaceRoot, 'packages', 'malkovich', 'docs', 'rules')

    // Check if malkovich rules directory exists
    try {
        const stats = await stat(malkovichRulesPath)
        if (!stats.isDirectory()) {
            console.error(`❌ ${malkovichRulesPath} is not a directory`)
            process.exit(1)
        }
    } catch (_error) {
        console.error(`❌ Malkovich rules directory not found: ${malkovichRulesPath}`)
        process.exit(1)
    }

    // Create .cursor directory if it doesn't exist
    const cursorDir = join(workspaceRoot, '.cursor')
    try {
        await mkdir(cursorDir, {recursive: true})
    } catch (error) {
        console.error('❌ Failed to create .cursor directory:', error)
        process.exit(1)
    }

    // Check if .cursor/rules already exists
    let exists = false
    let isSymlink = false
    try {
        const stats = await stat(cursorRulesPath)
        exists = true
        isSymlink = stats.isSymbolicLink()
    } catch {
        // Doesn't exist, we'll create it
    }

    // Remove existing symlink or directory if needed
    if (exists) {
        if (isSymlink) {
            try {
                await unlink(cursorRulesPath)
                console.log('ℹ️  Removed existing symlink')
            } catch (error) {
                console.error('❌ Failed to remove existing symlink:', error)
                process.exit(1)
            }
        } else {
            console.error(`❌ ${cursorRulesPath} already exists and is not a symlink. Please remove it manually.`)
            process.exit(1)
        }
    }

    // Create symlink using relative path for portability
    const relativePath = join('..', '..', 'packages', 'malkovich', 'docs', 'rules')
    try {
        await symlink(relativePath, cursorRulesPath, 'dir')
        console.log(`✅ Created symlink: ${cursorRulesPath} → ${malkovichRulesPath}`)
    } catch (error) {
        console.error('❌ Failed to create symlink:', error)
        process.exit(1)
    }
}
