import {writeFile} from 'fs/promises'
import {join} from 'path'
import {findWorkspaceRoot} from './workspace'

/**
 * Initialize AGENTS.md file in project root
 */
export async function init(): Promise<void> {
    const workspaceRoot = findWorkspaceRoot() || process.cwd()
    const agentsPath = join(workspaceRoot, 'AGENTS.md')

    const content = `# Agent Context

Documentation and architectural patterns are available via @garage44/malkovich.

See: node_modules/@garage44/malkovich/docs/

- ADRs: node_modules/@garage44/malkovich/docs/adr/
- Rules: node_modules/@garage44/malkovich/docs/rules/
- Patterns: node_modules/@garage44/malkovich/docs/adr/guide/PATTERNS.md

## Documentation Structure

The malkovich package contains:
- **ADRs**: Architecture Decision Records documenting key decisions
- **Rules**: Cursor rules for frontend and backend development
- **Patterns**: Reusable decision-making patterns

## Usage

When installed in a project, malkovich provides:
- Documentation framework
- Deployment automation
- Webhook integration
- NPM publishing tools

Access the documentation via the malkovich package or visit the deployed instance.
`

    try {
        await writeFile(agentsPath, content, 'utf-8')
        console.log(`✅ Created AGENTS.md at ${agentsPath}`)
    } catch(error) {
        console.error('❌ Failed to create AGENTS.md:', error)
        process.exit(1)
    }
}
