# Expressio

AI-powered i18n automation tool. Automates translation workflows using AI providers (DeepL, Claude) while maintaining source-text control and code synchronization.

**🌐 Live:** [expressio.garage44.org](https://expressio.garage44.org)

Expressio is part of the **garage44/common** infrastructure, sharing the same tech stack as [Pyrite](../pyrite/) - Bun runtime, Preact frontend, DeepSignal state management, and Bunchy for development with HMR.

## What It Does

Expressio manages translation workflows for applications using i18next format. It provides:

- **AI translation**: Automated translation via DeepL, Claude, or other providers
- **Source-text workflow**: Maintain source language in code, translate to targets
- **Code sync**: Lint to detect missing translations in source code
- **Web UI**: Visual interface for managing translations and workspaces
- **CLI tools**: Import, export, bulk translate, statistics
- **Real-time sync**: WebSocket synchronization for collaborative editing

Expressio works with i18next JSON format and integrates with your existing i18n setup. It maintains a workspace (`.expressio.json`) that tracks source text, translations, and metadata, allowing you to keep translations in sync with code changes.

The workspace format enables AI-assisted development workflows. Instead of magic strings like `$t('foo.bar')`, you can use typed references like `$t(i18n.foo.bar)`, making it easy for AI tools to scan for missing translations through TypeScript typing.

## Quick Start

```bash
# Install globally
bunx @garage44/expressio start

# Or from source
cd packages/expressio
bun install
bun run dev
```

Access the web UI at `http://localhost:3030` (default login: `admin/admin`).

## Getting Started

### Frontend Setup

To use Expressio in your frontend project, install the package and set up type-safe translations.

1. **Install the package**:

```bash
bun add @garage44/expressio
```

2. **Initialize a workspace file** using the CLI:

```bash
bunx @garage44/expressio init
```

This creates a template `.expressio.json` file in `./src/.expressio.json` by default. You can customize the output path and options:

```bash
bunx @garage44/expressio init --output ./src/.expressio.json --workspace-id my-app --source-language eng-gbr
```

**Options:**
- `--output, -o`: Output path for the workspace file (default: `./src/.expressio.json`)
- `--workspace-id, -w`: Workspace identifier (default: `my-app`)
- `--source-language, -s`: Source language code (default: `eng-gbr`)

3. **Set up Expressio in your app**:

```typescript
import {createTypedI18n, i18nFormat} from '@garage44/expressio'
import workspace from '@/.expressio.json'

// Create typed i18n object for type-safe translation references
const i18n = createTypedI18n(workspace)

// Format translations in i18next format
const translations = i18nFormat(workspace.i18n, workspace.config.languages.target)

export {i18n}
```

4. **Enable JSON module resolution** in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

**Note:** Expressio currently only supports the deepSignal store from `@garage44/common/app`.
Support for other state management solutions is welcome via pull requests.

### Usage in Components

Import `$t` from `@garage44/expressio` and `i18n` from your app entry point. Use object references instead of magic strings:

```typescript
import {$t} from '@garage44/expressio'
import {i18n} from '@/app'

export const WelcomeComponent = () => {
  return (
    <div>
      <h1>{$t(i18n.welcome)}</h1>
      <button>{$t(i18n.menu.settings)}</button>
    </div>
  )
}
```

**Benefits:**
- ✅ Type-safe: TypeScript will catch typos and missing translations
- ✅ Autocomplete: Your IDE will suggest available translation keys
- ✅ Refactoring: Rename keys safely with IDE support
- ✅ AI-friendly: AI tools can easily scan for missing translations

### Translation with Context

You can pass context for interpolation:

```typescript
// In your workspace JSON:
{
  "i18n": {
    "greeting": {
      "source": "Hello, {{name}}!",
      "target": {
        "fra": "Bonjour, {{name}} !"
      }
    }
  }
}

// In your component:
$t(i18n.greeting, {name: 'John'})  // "Hello, John!"
```

## CLI Commands

### Initialize workspace

```bash
bunx @garage44/expressio init
bunx @garage44/expressio init --output ./src/.expressio.json --workspace-id my-app
```

### Import translations

```bash
expressio import --input en.json
expressio import --input en.json --translate  # Auto-translate on import
expressio import --input en.json --merge      # Update existing tags
```

### Export translations

```bash
expressio export --output ./i18next.json
expressio export --language fr --split        # Export single language to separate file
```

### Bulk operations

```bash
expressio translate-all                       # Translate all untranslated tags
expressio translate-all --force               # Force retranslation (ignore cache)
expressio stats                               # Show translation statistics
```

### Validation

```bash
expressio lint                                # Check for missing translations in source code
```

## Configuration

Configure translation engines (DeepL, Anthropic/Claude) and workspaces via config file or web UI. Define source and target languages per workspace.

## Workflow Integration

Expressio fits into an i18n workflow as follows:

1. **Import**: Import existing i18next JSON files into a workspace
2. **Translate**: Use AI to translate source text to target languages
3. **Sync**: Lint to detect missing translations in your source code
4. **Export**: Export translated files back to i18next format for use in your app
5. **Iterate**: Update source text, retranslate, and keep translations in sync

The web UI provides real-time collaboration and visual management of translations. CLI tools enable automation and integration into build processes.

## Architecture

Expressio is built on the garage44/common infrastructure:

- **Backend**: Bun.serve() with native WebSocket support
- **Frontend**: Preact with DeepSignal for reactive state management
- **Build**: Bunchy for hot-reload development with HMR
- **Shared Components**: UI components and utilities from `@garage44/common`

## Related Projects

- [Pyrite](../pyrite/) - Video conferencing platform (shares the same tech stack)
- [Bunchy](../bunchy/) - Hot-reload development tool with HMR
- [Common](../common/) - Shared UI components and utilities

## License

AGPLv3
