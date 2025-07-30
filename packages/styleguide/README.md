# @garage44/styleguide

A comprehensive styleguide application showcasing all components and design tokens from the `@garage44/common` package.

## Features

- **Component Showcase**: Interactive examples of all available components
  - Buttons (various types and states)
  - Form fields (text, checkbox, select, upload)
  - Icons and progress indicators
  - Notifications

- **Design Tokens**: Visual documentation of the design system
  - Color palettes (Surface, Primary, Success, Danger, Warning)
  - Typography scale
  - Spacing system
  - Icon sizes
  - Border radius values

## Getting Started

### Prerequisites

- Bun runtime installed
- This styleguide is part of the Expressio monorepo workspace

### Development

```bash
# Navigate to the styleguide directory
cd packages/styleguide

# Install dependencies (managed by workspace)
bun install

# Start development server with hot reload
bun run dev
```

The styleguide will be available at `http://localhost:3000` (or the next available port).

### Building for Production

```bash
# Build the styleguide
bun run build

# Serve the built files
bun run serve
```

## Architecture

### Technology Stack

- **Frontend Framework**: Preact with JSX
- **State Management**: DeepSignal (reactive state)
- **Routing**: Preact Router
- **Styling**: CSS with design tokens imported from Expressio
- **Build Tool**: Bun bundler

### Project Structure

```
styleguide/
├── src/
│   ├── components/
│   │   ├── main.tsx           # Main layout component
│   │   ├── main.css           # Main stylesheet
│   │   ├── navigation.tsx     # Navigation component
│   │   ├── component-demo.tsx # Component demo wrapper
│   │   └── pages/
│   │       ├── components.tsx # Component showcase page
│   │       └── tokens.tsx     # Design tokens page
│   ├── lib/
│   │   └── state.ts          # State configuration
│   ├── app.ts                # Main app setup
│   ├── types.ts              # TypeScript type definitions
│   └── index.html            # HTML entry point
├── package.json
├── tsconfig.json
└── README.md
```

### State Management

The styleguide uses a simplified state structure:

```typescript
interface StyleguideState extends CommonState {
    theme: 'light' | 'dark'
    sidebarCollapsed: boolean
    currentRoute: string
    selectedComponent: string | null
}
```

### Design System Integration

The styleguide imports design tokens directly from Expressio:

- Colors (OKLCH-based systematic color construction)
- Typography (Inter font with modular scale)
- Spacing (8px base unit with mathematical progression)
- Component tokens (form controls, validation states, etc.)

## Development Guidelines

### Adding New Components

When a new component is added to `@garage44/common`:

1. Export it from `packages/common/components.ts`
2. Add a demo section to `packages/styleguide/src/components/pages/components.tsx`
3. Include various states and props to demonstrate usage

### Adding New Design Tokens

When new design tokens are added:

1. Add them to the Expressio CSS variables
2. Document them in `packages/styleguide/src/components/pages/tokens.tsx`
3. Include visual examples and usage guidance

### CSS Architecture

- Import design tokens from Expressio CSS files
- Use BEM naming convention for styleguide-specific styles
- Ensure responsive design for mobile and tablet viewports
- Follow the established design system patterns

## Deployment

The styleguide is built as a static single-page application and can be deployed to any static hosting service:

```bash
bun run build
# Deploy the `dist/` folder to your hosting service
```

## Contributing

When contributing to the styleguide:

1. Follow the existing code patterns and conventions
2. Ensure all components are properly demonstrated
3. Update documentation when adding new features
4. Test across different screen sizes and browsers
5. Run linting before submitting changes: `bun run lint:ts`

## License

This styleguide is part of the Garage44 Common package and follows the same MIT license.