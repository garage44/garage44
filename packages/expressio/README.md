# Expressio

AI-powered i18n automation tool. Automates translation workflows using AI providers (DeepL, Claude) while maintaining source-text control and code synchronization.

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

## CLI Commands

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

## License

AGPLv3
