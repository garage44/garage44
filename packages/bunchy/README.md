# Bunchy

Bunchy is a blazingly fast frontend development tool designed specifically for the Bun runtime and server. It provides live reloading, build tasks, and development tooling with minimal setup and maximum performance.

## Features

- **Bun-Native**: Built from the ground up for Bun.serve and the Bun bundler
- **Live Reloading**: Real-time browser updates via WebSocket for TypeScript, CSS, and HTML changes
- **Smart CSS Updates**: Hot-swaps stylesheets without full page reloads
- **Error Overlays**: Beautiful in-browser error displays with detailed stack traces
- **File Watching**: Intelligent file system monitoring with debounced rebuilds
- **Build Tasks**: Complete build pipeline for modern web applications
- **CLI Integration**: Seamless integration with yargs for command-line workflows
- **Zero Configuration**: Works out of the box with sensible defaults

## Installation

```bash
bun add @garage44/bunchy
```

## Usage

### Basic Setup

```typescript
import {bunchyService, bunchyArgs} from '@garage44/bunchy'
import {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import path from 'path'

const bunchyConfig = {
    common: path.resolve('./packages/common'),
    reload_ignore: [], // Optional: ignore specific reload patterns
    workspace: import.meta.dir,
}

const cli = yargs(hideBin(process.argv))

// Add Bunchy CLI commands
bunchyArgs(cli, bunchyConfig)

cli.command('start', 'Start the development server', {}, async (argv) => {
    // Create WebSocket manager for live reloading
    const wsManager = new WebSocketServerManager()

    // Set up Bun server
    const server = Bun.serve({
        fetch: (req, server) => {
            // Your request handler
            return new Response('Hello World')
        },
        hostname: argv.host || 'localhost',
        port: argv.port || 3000,
        websocket: wsManager.createHandler(),
    })

    // Initialize Bunchy in development mode
    if (process.env.BUN_ENV === 'development') {
        await bunchyService(server, bunchyConfig, wsManager)
    }

    console.log(`Server running at http://${server.hostname}:${server.port}`)
})

cli.parse()
```

### Client-Side Integration

Add the Bunchy client to your frontend application:

```typescript
// app.ts
import {BunchyClient} from '@garage44/bunchy/client'

// Initialize live reloading in development
if (process.env.NODE_ENV === 'development') {
    new BunchyClient()
}

// Your app code...
```

## Configuration

The `bunchyConfig` object supports the following options:

```typescript
interface BunchyConfig {
    // Paths to common/shared code directories
    common: string | string[]

    // Patterns to ignore for reload triggers
    reload_ignore?: string[]

    // Main workspace directory
    workspace: string

    // Build version/hash (auto-generated if not provided)
    version?: string
}
```

## Available CLI Commands

Bunchy adds several CLI commands through `bunchyArgs`:

- `build` - Full production build with minification
- `code_frontend` - Bundle frontend TypeScript/JSX
- `html` - Process HTML templates
- `styles` - Compile CSS/SCSS stylesheets

### Command Options

- `--minify` - Enable minification (default: false in dev, true in build)
- `--sourcemap` - Include source maps (default: true in dev)
- `--builddir` - Specify build output directory

## File Structure

Bunchy expects your project to follow this structure:

```
your-project/
├── src/
│   ├── app.ts          # Main frontend entry
│   ├── index.html      # HTML template
│   ├── css/
│   │   └── app.css     # Main stylesheet
│   ├── components/     # Component files with .css
│   └── assets/
│       ├── fonts/
│       └── img/
└── public/             # Build output (auto-generated)
```

## Build Tasks

### Frontend Code (`code_frontend`)
- Bundles TypeScript/JSX using Bun's native bundler
- Supports ESM format with tree-shaking
- Generates hashed filenames for caching
- Includes error handling with browser notifications

### Stylesheets (`styles`)
- Compiles app-level CSS from `src/css/`
- Bundles component CSS from `src/components/` and common packages
- Supports CSS imports and asset references
- Hot-swaps stylesheets without page reload

### HTML Processing (`html`)
- Processes `src/index.html` with Lodash templates
- Injects build settings and asset references
- Outputs processed HTML to public directory

### Assets (`assets`)
- Copies fonts and images to public directory
- Maintains directory structure
- Optimized for static file serving

## Live Reloading

Bunchy provides intelligent live reloading:

- **TypeScript/JSX Changes**: Full page reload
- **CSS Changes**: Hot stylesheet replacement (no reload)
- **HTML Changes**: Full page reload
- **Asset Changes**: Asset reload

The client automatically connects to `ws://localhost:3030/bunchy` for real-time updates.

## Error Handling

### Build Errors
When builds fail, Bunchy displays:
- Error overlays in the browser
- Detailed stack traces
- Keyboard shortcuts (ESC to dismiss)
- Automatic clearing when issues are fixed

### Development Workflow
1. Make changes to your code
2. Bunchy detects changes and rebuilds
3. Updates are pushed to browser via WebSocket
4. Browser updates without losing application state (for CSS)

## Integration with Bun

Bunchy leverages Bun's features:
- **Bun.build()** for ultra-fast bundling
- **Bun.serve()** for the development server
- **Native file watching** for change detection
- **WebSocket support** for live communication

## Performance

- Sub-second rebuilds for most changes
- Debounced file watching (1000ms) to prevent rebuild spam
- Smart dependency tracking
- Efficient WebSocket broadcasting

## License

MIT