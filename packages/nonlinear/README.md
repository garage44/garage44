# Nonlinear

AI-Powered Automated Project Management

Nonlinear is an automated project management tool that uses AI agents to manage the complete software development lifecycle from backlog to closed tickets.

## Features

- **Automated Ticket Lifecycle**: Backlog → Todo → In Progress → Review → Closed
- **AI Agents**:
  - **Prioritizer**: Analyzes and prioritizes backlog tickets
  - **Developer**: Implements tickets, creates branches and merge requests
  - **Reviewer**: Reviews code and provides feedback
- **Git Integration**: Supports GitHub, GitLab, and local git repositories
- **Adaptive CI**: Automatically fixes linting and test issues
- **Human-in-the-Loop**: Approval workflow with @mention system for routing work
- **Real-time Kanban Board**: Drag-and-drop interface with live updates

## Architecture

Following ADR-021, Nonlinear is built with:
- **Backend**: Bun runtime with Bun.serve(), SQLite database, WebSocket-first API
- **Frontend**: Preact with DeepSignal state management
- **AI**: Anthropic Claude API for agent reasoning
- **Git**: Platform-agnostic adapters (GitHub, GitLab, local)

## Installation

```bash
bun install
```

## Configuration

Create a `.nonlinearrc` file in your home directory or set environment variables:

```json
{
  "anthropic": {
    "apiKey": "env:ANTHROPIC_API_KEY",
    "model": "claude-3-5-sonnet-20241022"
  },
  "git": {
    "defaultPlatform": "github",
    "github": {
      "token": "env:GITHUB_TOKEN"
    },
    "gitlab": {
      "token": "env:GITLAB_TOKEN",
      "url": "https://gitlab.com"
    }
  },
  "agents": {
    "prioritizer": {
      "enabled": true,
      "checkInterval": 300000
    },
    "developer": {
      "enabled": true,
      "maxConcurrent": 3
    },
    "reviewer": {
      "enabled": true,
      "maxConcurrent": 2
    }
  },
  "ci": {
    "maxFixAttempts": 3,
    "timeout": 600000
  }
}
```

### Development Mode (No Authentication)

For development, you can bypass authentication by setting the `GARAGE44_NO_SECURITY` environment variable:

```bash
# Auto-login as admin user
GARAGE44_NO_SECURITY=1 bun run dev

# Auto-login as specific user
GARAGE44_NO_SECURITY=admin bun run dev
```

You can also override per-session using:
- Cookie: `GARAGE44_DEBUG_USER=username`
- Query parameter: `?debug_user=username`

This automatically authenticates requests and WebSocket connections without requiring login.

## Usage

### Start the service

```bash
bun run dev
```

Or in production:

```bash
bun run server
```

### Access the UI

Navigate to `http://localhost:3030` (or configured port)

### Workflow

1. **Create Tickets**: Add tickets to the backlog via the UI
2. **Prioritization**: The prioritizer agent automatically moves high-priority tickets to "todo"
3. **Development**: The developer agent picks up "todo" tickets, implements them, and creates MRs
4. **Review**: The reviewer agent reviews MRs and provides feedback
5. **Approval**: Humans approve closed tickets or reopen with comments
6. **Comments**: Use @mentions to route work to specific agents or humans

## Development

```bash
# Development mode with hot reload
bun run dev

# Build for production
bun run build

# Run linters
bun run lint:ts
bun run lint:css
```

## License

AGPL-3.0
