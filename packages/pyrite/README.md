# Pyrite

Modern video conferencing powered by Galène SFU, built with Bun, Preact, and DeepSignal.

## Overview

Pyrite is a self-hosted video conferencing solution that leverages the powerful Galène SFU (Selective Forwarding Unit) for efficient media routing. Built with modern web technologies, Pyrite provides a fast, responsive, and feature-rich conferencing experience.

## Features

- **Real-time Video Conferencing**: High-quality video and audio streaming
- **Screen Sharing**: Share your screen with participants
- **Group Management**: Create and manage conference groups
- **Chat**: Built-in chat functionality with emoji support
- **Recording**: Record conference sessions
- **Admin Dashboard**: Comprehensive administration interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: System-aware theming

## Technology Stack

- **Runtime**: Bun
- **Frontend**: Preact with DeepSignal for state management
- **Backend**: Bun.serve with WebSocket support
- **SFU**: Galène (external)
- **Styling**: Modern CSS with native nesting

## Quick Start

### Prerequisites

- Bun installed
- Galène SFU running (default: `http://localhost:8443`)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Configuration

Create a `.pyriterc` file in your project root:

```json
{
  "listen": {
    "host": "0.0.0.0",
    "port": 3030
  },
  "sfu": {
    "url": "http://localhost:8443"
  },
  "users": [
    {
      "name": "admin",
      "password": "your-secure-password",
      "admin": true
    }
  ]
}
```

## Development

```bash
# Run with hot reload
bun run dev

# Lint TypeScript
bun run lint:ts

# Lint CSS
bun run lint:css

# Run tests
bun test
```

## Architecture

Pyrite follows a modern monorepo architecture:

- **`/api`**: REST and WebSocket API endpoints
- **`/lib`**: Core business logic and utilities
- **`/src`**: Frontend application
  - **`/components`**: React components
  - **`/models`**: Business models (including SFU integration)
  - **`/lib`**: Frontend utilities
- **`/public`**: Static assets

## WebSocket Communication

Pyrite uses two WebSocket connections:

1. **Pyrite WebSocket** (`/ws`): Application-level real-time features (chat, presence, etc.)
2. **Galène SFU** (`/sfu`): Media streaming connection

## License

MIT License - see LICENSE.md for details

## Credits

- **Galène SFU**: https://galene.org
- Built with the Expressio monorepo stack
