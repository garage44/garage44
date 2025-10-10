# Pyrite Stack Migration Status

## Overview
Migration of Pyrite from Vue 3 + Express.js to Preact + Bun.serve stack, integrating into the Expressio monorepo.

**Started:** 2025-01-10
**Current Status:** Phase 1 & 2 Complete - Backend and Core Frontend Migrated
**Remaining:** Component Migration, SFU Integration, Testing

---

## ✅ Completed (Phase 1 & 2)

### Monorepo Integration
- [x] Created `/home/deck/code/expressio/packages/pyrite/` directory structure
- [x] Set up `package.json` with correct dependencies
- [x] Created `tsconfig.json` with Preact configuration
- [x] Added `LICENSE.md` (MIT)
- [x] Created `README.md` with documentation

### Backend Migration (Express.js → Bun.serve)
- [x] **service.ts** - Main entry point with Bun.serve, yargs CLI, WebSocket managers
- [x] **lib/config.ts** - RC-based configuration with SFU settings
- [x] **lib/middleware.ts** - Complete Bun Request/Response patterns
  - Custom Router class for Express-like routing
  - Session management (Map-based)
  - Authentication middleware
  - **SFU WebSocket proxy** - Proxies to Galène at `/sfu` path

### API Endpoints Migration
All migrated to Bun Router pattern:
- [x] **api/i18n.ts** - Translation loading
- [x] **api/chat.ts** - Chat messages and emoji data
- [x] **api/profile.ts** - Authentication, login, logout, context
- [x] **api/groups.ts** - Group management CRUD
- [x] **api/users.ts** - User management CRUD
- [x] **api/dashboard.ts** - Statistics
- [x] **api/recordings.ts** - Recording management

### WebSocket Backend
- [x] **Chat WebSocket routes** - Real-time message broadcasting
- [x] **Groups WebSocket routes** - Group state synchronization
- [x] **Users WebSocket routes** - Presence updates
- [x] WebSocket managers for `/ws` and `/bunchy` endpoints

### Frontend Core
- [x] **src/app.ts** - App bootstrap with Preact, DeepSignal, WebSocketClient
- [x] **src/lib/state.ts** - Complete state management (persistant + volatile)
- [x] **src/types.ts** - TypeScript interfaces for PyriteState
- [x] **src/components/main/main.tsx** - Main application shell with routing
- [x] **src/components/conference/app.tsx** - Conference app shell (stub)
- [x] **src/components/admin/app.tsx** - Admin app shell (stub)

### Build & Development
- [x] **.bunchy.ts** - Frontend build task configuration
- [x] **public/index.html** - HTML entry point
- [x] **public/css/main.css** - Unified theme system with CSS variables
- [x] Copied i18n translations (de, en, fr, nl)
- [x] Copied emoji data
- [x] Copied image and audio assets

### Business Logic
- [x] Copied lib files from old Pyrite (needs adaptation):
  - user.ts, group.ts, profile.ts, dashboard.ts, recording.ts, utils.ts, sanity.ts

---

## 🔄 In Progress / Remaining

### Phase 3: Component Migration (40+ components)

#### Conference Components (Priority: HIGH)
- [ ] **Login component** - Group authentication form
- [ ] **Group component** - Video stream grid container
- [ ] **Stream components** - Video/audio stream display
- [ ] **Controls components** - Main conference controls (mic, camera, share, hang up)
- [ ] **Chat components** - Chat panel, message list, emoji picker
- [ ] **Settings components** - Device selection, media settings, theme picker
- [ ] **Context components** - User/group context panels

#### Admin Components (Priority: MEDIUM)
- [ ] **Dashboard** - Statistics and overview
- [ ] **User management** - User CRUD interface
- [ ] **Group management** - Group CRUD interface
- [ ] **Login** - Admin authentication

#### Elements for Common Library (Priority: LOW)
- [ ] **Chart** - Statistics visualization (move to common)
- [ ] **Soundmeter** - Audio level visualization (move to common)
- [ ] **Splash** - Loading screen (move to common)
- [ ] **ButtonGroup** - Use existing from common
- [ ] **ContextMenu** - Right-click menu (evaluate for common)

### Phase 4: Models & Business Logic

#### SFU Integration (Priority: CRITICAL)
- [ ] **src/models/sfu/sfu.ts** - Adapt to use new logger and $s
- [ ] **src/models/sfu/protocol.ts** - Keep as-is (Galène protocol)
- [ ] **src/models/sfu/commands.ts** - Adapt imports

#### Business Models
- [ ] **src/models/chat.ts** - Migrate to DeepSignal patterns
- [ ] **src/models/group.ts** - Migrate to DeepSignal patterns
- [ ] **src/models/media.ts** - Migrate to DeepSignal patterns
- [ ] **src/models/user.ts** - Migrate to DeepSignal patterns

#### Library Utilities
- [ ] **src/lib/animate.ts** - Keep as-is or use common
- [ ] **src/lib/api.ts** - Use common Api or adapt
- [ ] **src/lib/helpers.ts** - Adapt for Preact refs
- [ ] **src/lib/sound.ts** - Keep as-is
- [ ] **src/lib/utils.ts** - Merge with common utils where applicable

### Phase 5: Styling & Theme
- [ ] Convert all SCSS files to modern CSS
- [ ] Implement unified theme system in common
- [ ] Update Expressio to use new theme
- [ ] Style conference components
- [ ] Style admin components

### Phase 6: WebSocket Frontend
- [ ] Implement WebSocket subscriptions in components
- [ ] Chat message real-time updates
- [ ] User presence updates
- [ ] Group state synchronization
- [ ] Recording status updates

### Phase 7: Router & Navigation
- [ ] Migrate vue-router patterns to preact-router
- [ ] Implement conference routes structure
- [ ] Implement admin routes structure
- [ ] Handle route guards and redirects

### Phase 8: Configuration & Documentation
- [ ] Create example `.pyriterc` file
- [ ] Document configuration options
- [ ] Update README with migration notes
- [ ] Add development setup guide

### Phase 9: Testing & Validation
- [ ] Test admin login
- [ ] Test group creation/management
- [ ] Test user connection to groups
- [ ] Test video streaming (camera, screen share)
- [ ] Test audio device selection
- [ ] Test chat functionality
- [ ] Test recording features
- [ ] Validate WebSocket connections
- [ ] Test theme switching
- [ ] Verify i18n translations

### Phase 10: Cleanup
- [ ] Remove all Vue dependencies
- [ ] Remove old Express.js patterns
- [ ] Optimize imports
- [ ] Fix remaining lint errors
- [ ] Update barrel exports

---

## Critical Dependencies

### Backend Dependencies (Already Migrated)
The lib files need minor adaptations to remove `app` import pattern:
- Replace `import app from '../app.js'` with config/logger imports
- Use `config` from `../lib/config.ts`
- Use `logger` from `../service.ts`

### Frontend Dependencies (Need Migration)
Components depend on:
1. **SFU models** - Critical for video conferencing
2. **Media utilities** - Camera/mic access
3. **State models** - Chat, group, user state
4. **Common components** - Icon, FieldSelect, Notifications, etc.

---

## Architecture Decisions

### WebSocket Strategy
- **Pyrite WebSocket** (`/ws`) - Application-level features (chat, presence)
- **Galène SFU** (`/sfu`) - Media streaming (proxied to Galène backend)
- Both use native Bun WebSocket support

### State Management
- **DeepSignal** for reactive state
- **No useState hooks** (per Expressio patterns)
- Global state via `$s` export
- Local component state via `deepSignal({})`

### Theme System
- CSS custom properties (no SCSS)
- Unified theme in `@garage44/common/css/theme.css`
- Light/dark/system preference support
- Semantic color tokens (`--bg-primary`, `--text-primary`, etc.)

### Component Patterns
```tsx
// Vue Options API
export default defineComponent({
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } }
})

// Preact Functional
export const Component = () => {
  const state = deepSignal({ count: 0 })
  return <div onClick={() => state.count++}>{state.count}</div>
}
```

---

## File Structure

```
packages/pyrite/
├── api/              # ✅ All REST/WebSocket API endpoints migrated
├── lib/              # ✅ Business logic copied (needs adaptation)
│   ├── config.ts     # ✅ Migrated
│   ├── middleware.ts # ✅ Migrated
│   ├── emoji/        # ✅ Copied
│   ├── user.ts       # ⚠️  Needs import fixes
│   ├── group.ts      # ⚠️  Needs import fixes
│   ├── profile.ts    # ⚠️  Needs import fixes
│   ├── dashboard.ts  # ⚠️  Needs import fixes
│   ├── recording.ts  # ⚠️  Needs import fixes
│   └── utils.ts      # ⚠️  Needs import fixes
├── public/           # ✅ Assets and build output
│   ├── index.html    # ✅ Created
│   ├── css/          # ✅ Theme CSS created
│   ├── img/          # ✅ Assets copied
│   ├── audio/        # ✅ Assets copied
│   └── js/           # (Build output)
├── src/
│   ├── app.ts        # ✅ Frontend bootstrap
│   ├── types.ts      # ✅ TypeScript types
│   ├── components/
│   │   ├── main/     # ✅ Main app shell
│   │   ├── conference/ # ⚠️  Stub created, needs full migration
│   │   ├── admin/    # ⚠️  Stub created, needs full migration
│   │   └── elements/ # ❌ Not started
│   ├── models/       # ❌ Needs migration
│   │   └── sfu/      # ❌ Critical - needs adaptation
│   └── lib/
│       └── state.ts  # ✅ Complete state management
├── i18n/             # ✅ Translations copied
├── .bunchy.ts        # ✅ Build configuration
├── service.ts        # ✅ Service entry point
├── package.json      # ✅ Dependencies configured
├── tsconfig.json     # ✅ TypeScript configuration
├── LICENSE.md        # ✅ MIT License
└── README.md         # ✅ Documentation
```

---

## Next Steps (Priority Order)

1. **Fix lib file imports** - Remove Express app dependencies
2. **Migrate SFU models** - Critical for video functionality
3. **Create Login component** - Required to access the app
4. **Migrate Group component** - Core video conference functionality
5. **Migrate Stream components** - Display video/audio streams
6. **Migrate Controls** - Mic, camera, share, hang up controls
7. **Migrate Chat components** - Real-time messaging
8. **Implement WebSocket subscriptions** - Connect frontend to backend
9. **Test basic conference flow** - End-to-end validation
10. **Migrate admin components** - Management interface

---

## Known Issues

1. **Lib files have old imports** - Need to replace `app` imports
2. **SFU models not adapted** - Still use Vue patterns
3. **Components are stubs** - Need full Vue → Preact migration
4. **No router setup** - Routes defined but components not wired
5. **Theme system not unified** - Needs common implementation

---

## Estimated Completion

- **Phase 1-2 (Backend + Core):** ✅ Complete
- **Phase 3-4 (Components + Models):** ~40 hours
- **Phase 5-6 (Styling + WebSocket):** ~10 hours
- **Phase 7-10 (Polish + Testing):** ~10 hours

**Total Remaining:** ~60 hours of focused development

---

## How to Continue

### Start Development Server
```bash
cd /home/deck/code/expressio/packages/pyrite
bun run dev
```

### Build Frontend
```bash
bun run build
```

### Test Backend
```bash
# Check if backend starts without errors
bun run service.ts start --host localhost --port 3030
```

### Priority Files to Work On
1. `lib/user.ts` - Fix imports (remove app dependency)
2. `lib/group.ts` - Fix imports (remove app dependency)
3. `src/models/sfu/sfu.ts` - Adapt to Preact patterns
4. `src/components/conference/login/login.tsx` - Create from scratch
5. `src/components/conference/group/group.tsx` - Create from scratch

---

## Migration Patterns Reference

### API Endpoint Pattern
```typescript
// Old Express
app.get('/api/groups', async (req, res) => {
  res.json(await getGroups())
})

// New Bun Router
router.get('/api/groups', async (req, params, session) => {
  return new Response(JSON.stringify(await getGroups()), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### State Access Pattern
```typescript
// Old Vue
import { app } from '@/lib/main.js'
app.$s.group.connected

// New Preact
import { $s } from '@/app'
$s.group.connected
```

### Component Pattern
```tsx
// Old Vue
export default defineComponent({
  render() {
    return <div>{this.$s.group.name}</div>
  }
})

// New Preact
export const Component = () => {
  return <div>{$s.group.name}</div>
}
```

---

**Last Updated:** 2025-01-10
