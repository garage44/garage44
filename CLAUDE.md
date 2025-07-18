# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expressio is an AI-powered translation and i18n workflow automation platform. The project is a Bun-based monorepo with multiple packages:

- **expressio**: Main application (AGPLv3) - Web interface for translation management
- **bunchy**: Task runner (MIT) - Development and build tooling
- **common**: Shared components (MIT) - Reusable UI components and utilities  
- **enola**: Translation engine (MIT) - AI translation service abstraction

## Essential Commands

### Development
```bash
# Start development server
cd packages/expressio
bun run dev

# Start without security for development (skips auth)
GARAGE44_NO_SECURITY=1 bun run dev

# Quick start via npx
bunx @garage44/expressio start
```

### Build & Publishing
```bash
# Build all packages
bun run build

# Clean all packages
bun run clean

# Lint TypeScript across workspace
bun run lint:ts

# Lint CSS across workspace  
bun run lint:css

# Publish workspace
bun run publish
```

### Screenshots & Testing
```bash
# Take application screenshots
bun run screenshots

# Setup screenshot environment
bun run setup:screenshots

# Install Playwright
bun run playwright:install
```

## Architecture Overview

### Runtime & Server
- **Runtime**: Bun (not Node.js)
- **Server**: Bun.serve() with custom routing (NOT Express.js)
- **WebSockets**: Native Bun WebSocket implementation for real-time updates
- **CLI**: yargs-based command interface

### Frontend Stack
- **Framework**: Preact with JSX (`jsx: "react-jsx"`, `jsxImportSource: "preact"`)
- **State Management**: DeepSignal (proxy-based reactive objects) - NOT useState
- **Styling**: SCSS with organized structure - NO inline styles
- **Icons**: Icon component from common library - NOT direct SVG/font icons
- **Real-time**: WebSocket client for live translation updates

### Key Patterns

**Bun Server Routing:**
```typescript
// Using Bun.serve() with custom routing
export default {
  port: 3030,
  fetch(request: Request): Response | Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/workspaces')) {
      return handleWorkspaces(request);
    }
    
    return new Response('Not Found', { status: 404 });
  },
  websocket: { /* WebSocket handlers */ }
};
```

**DeepSignal State Management:**
```typescript
// Component state - direct property access, no .value needed
const localState = deepSignal({
  filter: '',
  sort: 'asc' as 'asc' | 'desc'
});

// Global state access
import {$s, ws} from '@/app'

// Access global workspace state
if (!$s.workspace) return null
```

**WebSocket Real-time Updates:**
```typescript
// Listen for translation sync events
events.on('app:init', () => {
  ws.on('/i18n/sync', ({create_tags, delete_tags, modify_tags}) => {
    // Handle real-time translation updates
  });
});
```

### Project Structure
```
packages/
├── expressio/           # Main web application
│   ├── api/            # REST API endpoints (Bun.serve)
│   ├── lib/            # Core business logic
│   ├── src/            # Frontend Preact components
│   └── service.ts      # CLI entry point
├── bunchy/             # Development tooling and task runner
├── common/             # Shared components and utilities
│   ├── components/     # Reusable UI components
│   ├── lib/           # Backend utilities (logger, WS, etc.)
│   └── css/           # Shared styles
└── enola/              # Translation service wrapper
```

## Key Development Guidelines

### Backend (Bun Server)
- Use Bun.serve() with native Web APIs (Request/Response)
- Implement custom routing, not Express.js patterns
- Use structured logging with context: `logger.info('operation', {context})`
- Validate and sanitize all file paths and user inputs
- Use WebSocket subscriptions for real-time updates

### Frontend (Preact + DeepSignal)
- Use DeepSignal for all state management (no useState)
- Access global state via `{$s, ws} from '@/app'`
- Use Icon component from `@garage44/common/components`
- Organize styles with SCSS, use existing variables ($spacer-1, etc.)
- Handle WebSocket events with `events.on('app:init', ...)`

### Translation Workflow
- Source-text oriented workflow with AI providers (DeepL, Claude)
- Real-time collaboration using WebSocket updates
- Smart caching for performance and cost optimization
- Extensive language coverage (ISO 639-2)

## Configuration
- Default login: admin/admin (customizable in ~/.expressiorc)
- Uses RC file-based configuration management
- Environment variable overrides supported
- WebSocket connects automatically when authenticated

## Important Notes
- This is a translation and i18n tool, not a general web framework
- Built for real-time collaboration with WebSocket-based updates
- Optimized for Bun runtime - use Bun-specific APIs when available
- Security: Never store API keys in workspace files, use environment variables
- The project follows ALE (Agent Lineage Evolution) framework for continuous learning