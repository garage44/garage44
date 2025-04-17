# Bunchy

Bunchy is a simple, lightweight replacement for LiveReload, designed to work seamlessly with Elysia.js and yargs.

## Features

- Easy integration with Elysia.js
- Supports yargs for command-line argument parsing
- Provides live reloading functionality for rapid development
- Minimal setup required

## Usage

```typescript
import {bunchyService, bunchyArgs} from '@garage44/bunchy'

const bunchyConfig = {
    common: [
        path.resolve(path.join(import.meta.dir, '../')),
    ],
    reload_ignore: ['/tasks/code'],
    workspace: import.meta.dir,
}

const argums = yargs(hideBin(process.argv))
bunchyArgs(argums, bunchyConfig)
.command('start', 'Start the Expressio service', () => {}, async(argv) => {

    await loadWorkspace(config, translator)
    const app = new Elysia()

    if (process.env.BUN_ENV === 'development') {
        await bunchyService(app, bunchyConfig)
    }

    app.listen({
        hostname: argv.host,
        port: argv.port
    })
})
```