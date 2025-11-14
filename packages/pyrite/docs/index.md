# Pyrite

Video conferencing platform built with Preact, DeepSignal, and Bun. Provides a modern web interface for the [Galène](https://galene.org/) SFU (Selective Forwarding Unit).

Pyrite is part of the **garage44/common** infrastructure, sharing the same tech stack as [Expressio](../expressio/) - Bun runtime, Preact frontend, DeepSignal state management, and Bunchy for development.

## What It Does

Pyrite provides a self-hosted video conferencing solution with:

- **Multi-party video conferencing** - Support for multiple participants with adaptive video layouts
- **Screen sharing** - Share your screen or individual application windows
- **Chat system** - Public and private messaging with emoji support
- **Admin interface** - Manage users, groups, and permissions
- **Recording** - Record conference sessions
- **i18n support** - Multi-language interface (English, German, French, Dutch)
- **Responsive design** - Works on desktop and mobile devices

## Quick Start

```bash
# Install globally
bunx @garage44/pyrite start

# Or from source
cd packages/pyrite
bun install
bun run dev
```

Access Pyrite at `http://localhost:3030` (default login: `admin/admin`).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Galène](https://galene.org/) SFU server (running separately)

### Setup

1. **Install dependencies** (from monorepo root):

```bash
bun install
```

2. **Configure Pyrite**:

Create a `.pyriterc` file in your home directory:

```bash
cp packages/pyrite/.pyriterc.example ~/.pyriterc
```

Edit `~/.pyriterc` with your configuration. At minimum, configure:

- `sfu.path` - Path to Galène data directory
- `sfu.url` - Galène HTTP endpoint (default: `http://localhost:8443`)
- `sfu.admin.username` and `sfu.admin.password` - Galène admin credentials

3. **Start Galène SFU**:

Pyrite requires a running Galène instance. Follow the [Galène installation guide](https://galene.org/).

4. **Run Pyrite**:

```bash
cd packages/pyrite
bun run dev
```

## Configuration

Pyrite uses the [rc](https://www.npmjs.com/package/rc) configuration pattern. Configuration is loaded from:

1. Command-line arguments
2. Environment variables (prefixed with `pyrite_`)
3. `.pyriterc` file in your home directory
4. Default values

### Essential Configuration

```json
{
  "listen": {
    "host": "0.0.0.0",
    "port": 3030
  },
  "sfu": {
    "path": "/path/to/galene/data",
    "url": "http://localhost:8443",
    "admin": {
      "username": "admin",
      "password": "changeme"
    }
  },
  "users": [
    {
      "username": "admin",
      "password": "changeme",
      "permissions": {
        "op": true,
        "present": true,
        "record": true
      }
    }
  ]
}
```

**Security Note**: Store `.pyriterc` with restricted permissions (`chmod 600 ~/.pyriterc`) as it contains passwords.

## Architecture

Pyrite is built on the garage44/common infrastructure:

- **Backend**: Bun.serve() with native WebSocket support
- **Frontend**: Preact with DeepSignal for reactive state management
- **SFU**: Galène (external, proxied through Pyrite backend)
- **Build**: Bunchy for hot-reload development
- **Shared Components**: UI components and utilities from `@garage44/common`

## Development

### Project Structure

```
packages/pyrite/
├── api/              # REST/WebSocket API endpoints
├── lib/              # Backend business logic
├── src/              # Frontend source (Preact components)
├── public/           # Static assets
├── i18n/             # Translation files
├── service.ts        # Backend entry point
└── .bunchy.ts        # Hot-reload configuration
```

### Development Workflow

**Start development server** (with hot reload):

```bash
bun run dev
```

This starts:
- Bun.serve() backend on port 3030
- Bunchy file watcher for hot reload
- WebSocket server for real-time updates

**Build for production**:

```bash
bun run build
```

**Run production server**:

```bash
bun run server
```

## WebSocket Architecture

Pyrite uses **two separate WebSocket connections**:

1. **Pyrite WebSocket (`/ws`)** - Backend-to-frontend communication for chat, presence, and group state
2. **SFU WebSocket (`/sfu`)** - Frontend-to-Galène communication for WebRTC signaling and media streams

The SFU WebSocket is proxied through Pyrite backend but the protocol is between frontend and Galène directly.

## Related Projects

- [Galène](https://galene.org/) - The SFU backend
- [Expressio](../expressio/) - i18n tooling (shares the same tech stack)
- [Bunchy](../bunchy/) - Hot-reload development tool
- [Common](../common/) - Shared UI components and utilities

## License

AGPLv3
