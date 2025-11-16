# Garage44

Modern web applications built with Bun, Preact, and DeepSignal.

[![License](https://img.shields.io/badge/License-Mixed-blue.svg)](#licenses)
[![Bun](https://img.shields.io/badge/Powered%20by-Bun-black.svg)](https://bun.sh/)

## Projects

### Expressio

AI-powered i18n automation platform. Automates translation workflows using AI providers (DeepL, Claude) and exports translation runtime for frontend applications.

**🌐 Live:** [expressio.garage44.org](https://expressio.garage44.org)

```bash
bunx @garage44/expressio start
# Login: admin/admin
```

**License:** AGPLv3
**Documentation:** [packages/expressio/docs/index.md](./packages/expressio/docs/index.md)

### Pyrite

Video conferencing frontend for the [Galène](https://galene.org/) SFU. Self-hosted solution with multi-party video, screen sharing, and chat.

**🌐 Live:** [pyrite.garage44.org](https://pyrite.garage44.org)

```bash
cd packages/pyrite
bun run dev
# Configure in ~/.pyriterc
```

**License:** AGPLv3
**Documentation:** [packages/pyrite/docs/index.md](./packages/pyrite/docs/index.md)

### Bunchy

Blazingly fast frontend development tool for Bun. Provides hot module replacement (HMR), live reloading, build tasks, and development tooling with minimal setup.

```bash
cd packages/bunchy
bun install
```

**License:** MIT
**Documentation:** [packages/bunchy/README.md](./packages/bunchy/README.md)

## Shared Stack

- **Runtime:** Bun
- **Backend:** Bun.serve() with WebSocket support
- **Frontend:** Preact with DeepSignal
- **Styles:** Modern CSS with native nesting
- **Build:** Bunchy (hot-reload tooling with HMR)

## Quick Start

```bash
# Install dependencies
bun install

# Start Expressio
cd packages/expressio && bun run dev

# Or start Pyrite
cd packages/pyrite && bun run dev
```

See individual project documentation for detailed setup and configuration.

## Contact

- Website: [garage44.org](https://garage44.org)
- Email: info@garage44.org
- GitHub: [github.com/garage44](https://github.com/garage44)

---

Built by Garage44
