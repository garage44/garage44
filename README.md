# Garage44

Modern web applications built with Bun, Preact, and DeepSignal.

[![License](https://img.shields.io/badge/License-Mixed-blue.svg)](#licenses)
[![Bun](https://img.shields.io/badge/Powered%20by-Bun-black.svg)](https://bun.sh/)

## The Automation Story

Garage44 represents a complete approach to automated software development. From writing code to deploying production systems, every step of the development lifecycle is streamlined and automated.

**Development** starts with **Bunchy**—instant hot module replacement and live reloading eliminate the traditional edit-compile-refresh cycle. Write code, see changes immediately.

**AI-assisted workflows** are built into the platform. **Expressio** automates translation workflows, detecting missing translations in your code and translating them using AI providers. **Malkovich** serves as both a documentation hub and an AI discovery platform, enabling AI agents to understand project structure, architectural decisions, and development patterns.

**Deployment** happens automatically. Push to a pull request? Malkovich spins up an isolated preview environment. Merge to main? Production deploys automatically via webhooks. Systemd services, nginx configurations, SSL certificates—all generated and managed automatically.

**Collaboration** is seamless. WebSocket-based real-time synchronization keeps teams in sync. Component styleguides ensure visual consistency. Architecture Decision Records guide both human developers and AI assistants.

The result: a development environment where you focus on building features, not configuring tooling. Where AI agents can understand and contribute to your codebase. Where deployment is a push away, not a multi-step manual process.

## Projects

### Malkovich

Platform documentation and deployment automation hub. Provides unified documentation, component styleguide, automated PR deployments, and AI discovery mechanisms for the entire monorepo.

**🌐 Live:** [garage44.org](https://garage44.org)

```bash
cd packages/malkovich
bun run dev
# Access at http://localhost:3032
```

**License:** MIT
**Documentation:** [packages/malkovich/docs/index.md](./packages/malkovich/docs/index.md)

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
