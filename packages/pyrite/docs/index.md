# Pyrite - Video Conferencing Platform

Pyrite is a web-based video conferencing platform built with Preact, DeepSignal, and Bun. It provides a modern interface for the [Galène](https://galene.org/) SFU (Selective Forwarding Unit).

## Features

- **Multi-party video conferencing** - Support for multiple participants with adaptive video layouts
- **Screen sharing** - Share your screen or individual application windows
- **Chat system** - Public and private messaging with emoji support
- **Admin interface** - Manage users, groups, and permissions
- **Recording** - Record conference sessions
- **i18n support** - Multi-language interface (English, German, French, Dutch)
- **Responsive design** - Works on desktop and mobile devices

## Architecture

Pyrite is built on modern web technologies:

- **Backend**: Bun.serve() with native WebSocket support
- **Frontend**: Preact with DeepSignal for reactive state management
- **SFU**: Galène (external, proxied through Pyrite backend)
- **Build**: Bunchy for hot-reload development

## Installation

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

Edit `~/.pyriterc` with your configuration (see Configuration section below).

3. **Start Galène SFU**:

Pyrite requires a running Galène instance. Follow the [Galène installation guide](https://galene.org/).

4. **Run Pyrite**:

```bash
cd packages/pyrite
bun run dev
```

Access Pyrite at `http://localhost:3030`

## Configuration

Pyrite uses the [rc](https://www.npmjs.com/package/rc) configuration pattern. Configuration is loaded from:

1. Command-line arguments
2. Environment variables (prefixed with `pyrite_`)
3. `.pyriterc` file in your home directory
4. Default values

### Configuration Options

#### `listen`

Server binding configuration:

```json
{
  "listen": {
    "host": "0.0.0.0",
    "port": 3030
  }
}
```

- `host` (string): IP address to bind to (default: `"0.0.0.0"`)
- `port` (number): Port to listen on (default: `3030`)

#### `logger`

Logging configuration:

```json
{
  "logger": {
    "level": "info",
    "transports": ["console"]
  }
}
```

- `level` (string): Log level - `"debug"`, `"info"`, `"warn"`, `"error"` (default: `"info"`)
- `transports` (array): Logging outputs - `"console"`, `"file"` (default: `["console"]`)

#### `session`

Session management configuration:

```json
{
  "session": {
    "cookie": {
      "maxAge": 86400000
    },
    "resave": false,
    "saveUninitialized": true
  }
}
```

- `cookie.maxAge` (number): Session cookie lifetime in milliseconds (default: 86400000 = 1 day)
- `resave` (boolean): Force session to be saved even if unmodified (default: `false`)
- `saveUninitialized` (boolean): Force uninitialized session to be saved (default: `true`)

#### `sfu`

Galène SFU connection configuration:

```json
{
  "sfu": {
    "path": "/path/to/galene/data",
    "url": "http://localhost:8443",
    "admin": {
      "username": "admin",
      "password": "changeme"
    }
  }
}
```

- `path` (string): Path to Galène data directory (groups, recordings)
- `url` (string): Galène HTTP endpoint URL (default: `"http://localhost:8443"`)
- `admin.username` (string): Galène admin username for API access
- `admin.password` (string): Galène admin password for API access

#### `users`

Initial user accounts for Pyrite admin interface:

```json
{
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

- `username` (string): User login name
- `password` (string): User password (plain text, stored in config)
- `permissions.op` (boolean): Operator permissions (manage groups/users)
- `permissions.present` (boolean): Can present audio/video
- `permissions.record` (boolean): Can record sessions

**Security Note**: Store `.pyriterc` with restricted permissions (`chmod 600 ~/.pyriterc`) as it contains passwords.

## Development

### Project Structure

```
packages/pyrite/
├── api/              # REST/WebSocket API endpoints
│   ├── chat.ts       # Chat and emoji APIs
│   ├── dashboard.ts  # Dashboard statistics
│   ├── groups.ts     # Group management
│   ├── i18n.ts       # Translation loading
│   ├── profile.ts    # Authentication
│   ├── recordings.ts # Recording management
│   └── users.ts      # User administration
├── lib/              # Backend business logic
│   ├── config.ts     # Configuration management
│   ├── dashboard.ts  # Dashboard data processing
│   ├── group.ts      # Group operations
│   ├── middleware.ts # HTTP middleware
│   ├── profile.ts    # User profile operations
│   ├── recording.ts  # Recording operations
│   ├── sanity.ts     # Configuration validation
│   ├── user.ts       # User management
│   └── utils.ts      # Utility functions
├── src/              # Frontend source
│   ├── components/   # Preact components
│   ├── models/       # Business logic models
│   ├── lib/          # Frontend utilities
│   └── app.ts        # Frontend entry point
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
bun run start
```

### Adding Features

#### Create a new API endpoint

1. Add a file in `api/` directory
2. Export a function that takes `router` and registers routes:

```typescript
import type { Router } from '@garage44/common/lib/middleware'

export const registerMyRoutes = (router: Router) => {
  router.get('/api/my-endpoint', async (req, params, session) => {
    return new Response(JSON.stringify({ data: 'hello' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  })
}
```

3. Import and call in `lib/middleware.ts`

#### Create a new component

1. Add component file in `src/components/`
2. Use Preact functional components with DeepSignal:

```typescript
import { $s } from '@/app'

export const MyComponent = () => {
  return (
    <div class="my-component">
      <p>Current user: {$s.user.username}</p>
    </div>
  )
}
```

## WebSocket Architecture

Pyrite uses **two separate WebSocket connections**:

### 1. Pyrite WebSocket (`/ws`)

Backend-to-frontend communication for:
- Chat message broadcasting
- User presence updates
- Group state synchronization
- Recording status notifications

### 2. SFU WebSocket (`/sfu`)

Frontend-to-Galène communication for:
- WebRTC signaling
- Media stream management
- Video/audio track negotiation

The SFU WebSocket is proxied through Pyrite backend but the protocol is between frontend and Galène directly.

## i18n (Internationalization)

Translation files are in `i18n/` directory:

- `en.json` - English (default)
- `de.json` - German
- `fr.json` - French
- `nl.json` - Dutch

Add new translations by adding keys to these JSON files. Use in components:

```typescript
import { $t } from '@/app'

<button>{$t('group.action.leave')}</button>
```

## Deployment

### Production Considerations

1. **Use a reverse proxy** (nginx, Caddy) for SSL/TLS termination
2. **Set secure session cookies** in production
3. **Configure firewall** to restrict SFU access
4. **Use strong passwords** in `.pyriterc`
5. **Enable HTTPS** for WebRTC to work properly

### Docker Deployment

Docker support is planned. See `misc/docker/` in the old Pyrite repository for reference.

## Troubleshooting

### Can't connect to conference

- Check that Galène is running and accessible at the configured URL
- Verify `sfu.url` in `.pyriterc` is correct
- Check browser console for WebSocket connection errors

### No video/audio

- Ensure HTTPS is enabled (required for WebRTC)
- Check browser permissions for camera/microphone
- Verify Galène group permissions allow presenting

### Authentication fails

- Check `users` array in `.pyriterc`
- Verify passwords are correct
- Check session configuration

## License

MIT License - see LICENSE.md

## Contributing

Contributions are welcome! Please follow the project's code style and testing guidelines.

## Related Projects

- [Galène](https://galene.org/) - The SFU backend
- [Expressio](../expressio/) - i18n tooling that shares the same tech stack
- [Bunchy](../bunchy/) - Hot-reload development tool

## Upgrading from Old Pyrite

This version of Pyrite has been completely rewritten:

- **Vue 3 → Preact** for the frontend
- **Express.js → Bun.serve()** for the backend
- **Vite → Bunchy** for development
- **SCSS → Modern CSS** for styling

Configuration is largely compatible, but some options have changed. Review your `.pyriterc` against the example file.
