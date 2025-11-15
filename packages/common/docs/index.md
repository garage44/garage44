# Common Package

The `@garage44/common` package is the shared component library and infrastructure foundation for all Garage44 projects. It provides domain-agnostic UI components, design tokens, utilities, and infrastructure code that can be reused across the monorepo.

## Scope

### What Common Provides

**Design System:**
- [Design Tokens](./tokens) - Colors, typography, spacing, and other design system values
- CSS theme system with OKLCH color scales
- Consistent styling patterns across all projects

**UI Components:**
- [Components](./components) - Reusable Preact components for building user interfaces
- Form fields, buttons, menus, notifications, charts, and more
- All components follow the component-driven design pattern

**Form Components:**
- [Forms](./forms) - Comprehensive form field components with validation support
- FieldText, FieldSelect, FieldCheckbox, FieldNumber, FieldSlider, and more
- Integrated with DeepSignal for reactive state management

**Infrastructure:**
- WebSocket client and server utilities
- Logger (isomorphic - works in browser and Node.js)
- State management utilities (DeepSignal helpers, store patterns)
- Validation utilities
- API client helpers
- Middleware patterns
- Database utilities
- User and group management utilities

**Utilities:**
- Path manipulation utilities
- Avatar handling and routing
- Internationalization (i18n) setup
- Environment configuration
- Development context helpers

### What Common Does NOT Include

- **Business Logic** - Domain-specific business rules belong in domain packages (expressio, pyrite, etc.)
- **Domain Models** - Business entities and their relationships
- **API Routes** - Application-specific API endpoints
- **Database Schemas** - Domain-specific data models
- **Project-Specific Features** - Features that are only relevant to one project

## Package Boundaries

The common package follows strict boundary rules:

- ✅ **Domain-Agnostic Only** - Code must be reusable across multiple projects
- ✅ **MIT License** - All code is MIT licensed (no AGPL dependencies)
- ✅ **Zero Business Logic** - Pure utilities and infrastructure
- ✅ **Framework Agnostic Where Possible** - Core utilities work independently

## Usage

### Importing Components

```typescript
import {Button, FieldText, Icon} from '@garage44/common/components'
```

### Using Design Tokens

```css
@import '@garage44/common/css/theme.css';

.my-component {
    padding: var(--spacer-2);
    color: var(--text-primary);
    background: var(--surface-2);
}
```

### Using Utilities

```typescript
import {logger} from '@garage44/common/lib/logger'
import {ws} from '@garage44/common/lib/ws-client'
import {createValidator, required} from '@garage44/common/lib/validation'
```

## Documentation

- [Design Tokens](./tokens) - Complete design system token reference
- [Components](./components) - All available UI components with examples
- [Forms](./forms) - Form components and best practices

## License

MIT - This package is licensed under the MIT License, making it suitable for use in both open-source and proprietary projects within the Garage44 monorepo.
