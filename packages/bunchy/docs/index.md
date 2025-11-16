# Bunchy

Blazingly fast frontend development tool for Bun. Provides hot module replacement (HMR), live reloading, build tasks, and development tooling.

Bunchy is integrated in `@garage44/common/app` and `@garage44/common/service`. For integration details, see the code.

## Features

- **Hot Module Replacement (HMR)**: Preserves application state while updating code
- **Live Reloading**: Real-time browser updates via WebSocket
- **Smart CSS Updates**: Hot-swaps stylesheets without page reloads
- **Error Overlays**: In-browser error displays with stack traces
- **Build Tasks**: Complete build pipeline for production

## CLI Commands

- `build` - Full production build with minification
- `code_frontend` - Bundle frontend TypeScript/JSX
- `html` - Process HTML templates
- `styles` - Compile CSS stylesheets

### Options

- `--minify` - Enable minification
- `--sourcemap` - Include source maps
- `--builddir` - Specify build output directory

## Build Tasks

- **Frontend Code**: Bundles TypeScript/JSX with Bun's native bundler, generates hashed filenames
- **Stylesheets**: Compiles CSS from `src/css/` and bundles component CSS
- **HTML**: Processes `src/index.html` with template injection
- **Assets**: Copies fonts and images to public directory

## HMR Behavior

- **TypeScript/JSX**: HMR update (preserves state) or full page reload
- **CSS**: Hot stylesheet replacement (no reload)
- **HTML**: Full page reload
- **Assets**: Asset reload

## License

MIT
