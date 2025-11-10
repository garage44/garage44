# Garage44

Modern web applications built with Bun, Preact, and DeepSignal.

[![License](https://img.shields.io/badge/License-Mixed-blue.svg)](#licenses)
[![Bun](https://img.shields.io/badge/Powered%20by-Bun-black.svg)](https://bun.sh/)

## Projects

### Expressio - Translation automation through AI

Streamline internationalization workflows with intelligent translation. Connects to DeepL, Claude, and other providers through Enola.

```bash
bunx @garage44/expressio start
# Login: admin/admin
```

**Core features:** AI translation, source-text workflow, smart caching, hot-reload, WebSocket sync

**License:** AGPLv3

### Pyrite - Video Conferencing

Self-hosted video conferencing with a Preact interface. Frontend for the [Galène](https://galene.org/) SFU.

```bash
cd packages/pyrite
bun run dev
# Configure in ~/.pyriterc
```

**Core features:** Multi-party video, screen sharing, chat, recording, admin interface, responsive design

**License:** AGPLv3

## Shared Architecture

Both projects use the same modern stack:

- **Runtime:** Bun
- **Backend:** Bun.serve() with WebSocket support
- **Frontend:** Preact with JSX
- **State:** DeepSignal (proxy-based reactivity)
- **Styles:** Modern CSS with native nesting
- **Build:** Bunchy (hot-reload tooling)
- **i18n:** i18next

Benefits: consistent development experience, reusable components, unified build process, easier maintenance.

## Packages

| Package | Purpose | License |
|---------|---------|---------|
| [expressio](./packages/expressio/) | i18n automation tool | AGPLv3 |
| [pyrite](./packages/pyrite/) | Video conferencing frontend | AGPLv3 |
| [enola](./packages/enola/) | Translation engine wrapper | MIT |
| [bunchy](./packages/bunchy/) | Development tooling | MIT |
| [common](./packages/common/) | Shared components & utilities | MIT |
| [malkovich](./packages/malkovich/) | Platform documentation & deployment | MIT |

## Getting Started

### Prerequisites

- Bun v1.0+
- Modern browser (2023+)

### Development

```bash
# Clone
git clone git@github.com:garage44/garage44.git
cd garage44

# Install dependencies
bun install

# Start Expressio
cd packages/expressio
bun run dev

# Or start Pyrite
cd packages/pyrite
bun run dev

# Or start Malkovich
cd packages/malkovich
bun run dev
```

### Production

```bash
# Build
cd packages/[expressio|pyrite]
bun run build

# Run
NODE_ENV=production bun service.ts start
```

## Monorepo Structure

```
garage44/
├── packages/
│   ├── expressio/      # i18n automation
│   ├── pyrite/         # Video conferencing
│   ├── enola/          # Translation services
│   ├── bunchy/         # Dev server
│   ├── common/         # Shared library
│   └── malkovich/      # Platform documentation & deployment
├── docs/
│   └── adr/            # Architecture decisions
└── bun.lock
```

## Documentation

- [Expressio README](./packages/expressio/README.md) - i18n automation guide
- [Pyrite README](./packages/pyrite/README.md) - Video conferencing setup
- [ADRs](./docs/adr/) - Architecture decisions
- [Bunchy](./packages/bunchy/README.md) - Development tooling
- [Enola](./packages/enola/README.md) - Translation API

## Contributing

Each package has a specific focus:

- **expressio:** i18n workflows, translation UI, workspace management
- **pyrite:** Video UI, WebRTC integration, chat
- **enola:** Translation providers, language support
- **bunchy:** Build tools, hot-reload, DX
- **common:** Reusable components, utilities

See individual package READMEs for details.

## Licenses

Mixed licensing strategy:

- **End Products:** AGPLv3
- **Libraries:** MIT (permissive for shared tools)

See [ADR-002](./docs/adr/ADR-002-mixed-license-strategy.md) for rationale.

## Why Bun?

- 3-4x faster than Node.js
- Built-in bundler, test runner, package manager
- Native TypeScript, JSX, ESM support
- Fast installs and hot reload

See [ADR-003](./docs/adr/ADR-003-bun-runtime-adoption.md) for details.

## Contact

- Website: [garage44](https://garage44.org)
- Email: info@garage44.org
- GitHub: [github.com/garage44](https://github.com/garage44)

---

Built by Garage44
