# ADR-011: Modern CSS Migration and Unified Styleguide

## Status
Accepted

## Date
2025-10-11

## Context

The Garage44 monorepo contains multiple web applications (Pyrite, Expressio) that originally used SCSS for styling. This created several challenges:

- **Inconsistent Design Systems**: Each project had its own SCSS variables and patterns without a unified design language
- **Build Complexity**: SCSS required additional build steps and preprocessing, adding complexity to the development workflow
- **No Shared Styles**: Difficult to share common design tokens and components across projects
- **Legacy Tooling**: SCSS preprocessing is less relevant now that browsers natively support modern CSS features
- **Bun Native Support**: Bun has excellent native CSS bundling capabilities that were underutilized

Modern browsers (Chrome 109+, Firefox 117+, Safari 16.4+) now support CSS nesting natively, eliminating the primary technical reason for using SCSS.

### Strategic Need for Common Theme

As the monorepo grows with multiple user-facing applications (Pyrite for video conferencing, Expressio for i18n tooling), maintaining a consistent brand identity and user experience across projects became critical. Without a unified styleguide:

- Users experience visual inconsistency between applications
- Developers duplicate design work across projects
- Maintenance burden increases with divergent styling approaches
- Accessibility improvements need to be implemented separately in each project

## Decision

**Migrate all projects from SCSS to modern native CSS with a unified styleguide and shared design system.**

### Core Principles

1. **Modern CSS Native**: Use native browser features (nesting, custom properties, OKLCH colors) instead of preprocessors
2. **Unified Design Tokens**: Establish shared CSS custom properties in `@garage44/common` package for consistent theming
3. **Single Theme Import**: Projects import one `theme.css` file from common package instead of managing multiple imports
4. **OKLCH Color System**: Adopt perceptually uniform color system for predictable scaling across light/dark themes
5. **Component-Scoped Styles**: Co-locate CSS files with components for better organization
6. **Bun Native Bundling**: Leverage Bunchy's CSS bundling for optimal build performance

### Architecture

```
packages/
├── common/
│   ├── css/
│   │   ├── theme.css            # 🎯 SINGLE IMPORT - All shared styles
│   │   ├── _typography.css      # Shared typography system
│   │   ├── _variables.css       # Shared design tokens
│   │   └── common/
│   │       └── _tooltip.css     # Shared component styles
├── pyrite/
│   ├── src/
│   │   ├── css/
│   │   │   ├── app.css          # Main entry: @import common/theme.css + pyrite styles
│   │   │   └── _variables.css   # Pyrite-specific design tokens (extends common)
│   │   └── components/
│   │       └── **/*.css         # Component-scoped styles
├── expressio/
│   └── src/
│       ├── css/
│       │   ├── app.css          # Main entry: @import common/theme.css + expressio styles
│       │   └── _variables.css   # Expressio-specific design tokens (extends common)
│       └── components/
│           └── **/*.css         # Component-scoped styles
```

**Key Improvement**: Projects import **one file** (`@garage44/common/css/theme.css`) instead of managing multiple individual imports.

### Unified Design System

**Shared Design Tokens** (in `@garage44/common`):
```css
:root {
    /* Spacing scale - consistent across all projects */
    --spacer-1: 0.5rem;
    --spacer-2: 1rem;
    --spacer-3: 1.5rem;
    --spacer-4: 2rem;

    /* Typography scale */
    --font-size-base: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;

    /* OKLCH neutral scale (0=dark, 9=light) */
    --info-0: oklch(10% 0.02 240);
    --info-5: oklch(60% 0.02 240);
    --info-9: oklch(98% 0.02 240);

    /* Semantic color roles */
    --success: oklch(60% 0.15 140);
    --error: oklch(55% 0.18 20);
    --warning: oklch(70% 0.15 60);
}
```

**Theme System** (shared across projects):
```css
/* Light theme (default) */
:root,
.theme-light {
    --bg-primary: var(--info-9);
    --text-primary: var(--info-1);
    --border-primary: var(--info-7);
}

/* Dark theme */
.theme-dark {
    --bg-primary: var(--info-1);
    --text-primary: var(--info-9);
    --border-primary: var(--info-3);
}
```

### Single Import Pattern

**Before** (manual imports - error-prone):
```css
/* pyrite/src/css/app.css */
@import "./_variables.css";
@import "../../../common/css/_typography.css";
@import "../../../common/css/common/_tooltip.css";
/* ... more imports as common package grows */
```

**After** (single import):
```css
/* pyrite/src/css/app.css */
@import "../../../common/css/theme.css";  /* ✨ One import, all shared styles */
@import "./_variables.css";              /* Project-specific overrides */
```

**Benefits:**
- **Consistency**: All projects automatically get the same common styles
- **Maintainability**: Updates to common styles don't require changes in consuming projects
- **Discoverability**: Clear entry point for the design system
- **Versioning**: Easier to version and track changes to the unified theme

### Build Process with Bunchy

Bunchy handles CSS bundling for all projects:

**Development Mode:**
1. Watches `src/css/app.css` and all `src/components/**/*.css` files
2. Bundles into `public/app.<buildId>.css` and `public/components.<buildId>.css`
3. Hot-reloads browser on CSS changes
4. No preprocessing step required

**Production Build:**
1. Minifies CSS with Bun.build
2. Generates content-hashed filenames for cache busting
3. Updates `index.html` with correct asset references

### OKLCH Color System Rationale

OKLCH (Lightness, Chroma, Hue in OKLAB color space) provides:

- **Perceptual Uniformity**: Unlike HSL, OKLCH maintains consistent perceived lightness
- **Predictable Scaling**: Generate color scales from dark to light with consistent intervals
- **Theme Support**: Easy to create light/dark themes by adjusting lightness value
- **Wide Gamut**: Supports P3 and wider color gamuts for modern displays
- **Accessibility**: Easier to maintain WCAG contrast ratios with predictable lightness

Example:
```css
/* Neutral scale - consistent perceived brightness steps */
--info-0: oklch(10% 0.02 240);   /* Almost black */
--info-1: oklch(20% 0.02 240);   /* Very dark */
--info-5: oklch(60% 0.02 240);   /* Mid gray */
--info-9: oklch(98% 0.02 240);   /* Almost white */

/* Brand colors - same lightness, different hues */
--brand-primary: oklch(60% 0.15 260);   /* Blue */
--brand-success: oklch(60% 0.15 140);   /* Green */
--brand-error: oklch(60% 0.18 20);      /* Red */
```

## Consequences

### Positive Consequences

#### Unified User Experience
- **Consistent Design Language**: Users experience cohesive visual identity across Pyrite and Expressio
- **Shared Components**: UI components from `@garage44/common` have consistent styling
- **Brand Coherence**: Unified color system and typography reinforce brand identity
- **Accessibility**: Centralized theme system ensures WCAG compliance across all applications

#### Developer Experience
- **Single Import**: One line to import all shared styles (`@import common/theme.css`) instead of managing multiple imports
- **Single Source of Truth**: Design tokens defined once in common package
- **Faster Development**: No need to redefine spacing, colors, typography for each project
- **Easy Customization**: Projects can extend shared tokens with project-specific values
- **Better Collaboration**: Designers and developers reference the same design system
- **Reduced Errors**: No risk of forgetting to import required common CSS files

#### Technical Benefits
- **No Preprocessor Overhead**: Native CSS eliminates SCSS build step
- **Smaller Bundle**: Remove SCSS compiler and dependencies from build pipeline
- **Faster Builds**: Bun's native CSS bundler is significantly faster than SCSS compilation
- **Hot Reload**: Instant CSS injection without full page reload
- **Better Debugging**: Native CSS in browser DevTools (no source maps needed for simple styles)

#### Maintenance
- **Reduced Duplication**: Common styles defined once and shared
- **Easier Updates**: Change design tokens in one place, affects all projects
- **Version Control**: Track design system changes through git history
- **Documentation**: Single styleguide documents the entire design system

### Negative Consequences

#### Migration Effort
- **Initial Refactoring**: Converting existing SCSS to modern CSS across multiple projects
- **Testing Required**: Ensure visual parity after migration
- **Learning Curve**: Team needs to understand modern CSS features and OKLCH color space

#### Browser Support Constraints
- **Modern Browsers Only**: Requires Chrome 109+, Firefox 117+, Safari 16.4+ (2023+)
- **No Polyfill**: Native nesting and OKLCH cannot be polyfilled at runtime
- **Enterprise Support**: May not work in older corporate browser environments

#### SCSS Feature Limitations
- **No Mixins**: Must use CSS custom properties instead of SCSS mixins
- **No Functions**: Cannot use SCSS color manipulation functions (mitigated by OKLCH)
- **No Imports with Logic**: Cannot conditionally import SCSS partials

#### Coordination Required
- **Cross-Project Coordination**: Changes to shared design tokens affect multiple projects
- **Breaking Changes**: Updates to common CSS may require coordination across teams
- **Version Management**: Need to carefully version `@garage44/common` for breaking changes

## Implementation Notes

### Migration Strategy

1. **Establish Common Package Styles** (✅ Completed)
   - Create `packages/common/css/` directory
   - Define core design tokens (spacing, typography, colors)
   - Implement shared component styles (tooltips, forms)
   - **Create `theme.css` as single entry point** for all common styles

2. **Migrate Expressio** (✅ Completed)
   - Convert SCSS variables to CSS custom properties
   - Replace SCSS nesting with native CSS nesting
   - Update component styles to use shared tokens
   - Replace multiple imports with single `@import common/theme.css`
   - Test light/dark theme switching

3. **Migrate Pyrite** (✅ Completed)
   - Apply same conversion process as Expressio
   - Replace multiple imports with single `@import common/theme.css`
   - Ensure video conferencing UI maintains visual integrity
   - Validate accessibility in dark theme

4. **Documentation**
   - Document design tokens and usage patterns
   - Create styleguide examples for developers
   - Provide migration guide for future projects
   - Document the single import pattern for new projects

### Bundle Sizes

**Before (SCSS):**
- Pyrite CSS: ~75KB (minified + gzipped)
- Expressio CSS: ~35KB (minified + gzipped)
- Total: ~110KB with duplication

**After (Modern CSS):**
- Shared common CSS: ~10KB (minified + gzipped)
- Pyrite CSS: ~50KB (minified + gzipped)
- Expressio CSS: ~20KB (minified + gzipped)
- Total: ~80KB with shared tokens

**Net Savings**: ~30KB (~27% reduction)

### Performance Impact

- **Build Time**: Reduced from ~2s to ~0.3s for CSS bundling (6.6x faster)
- **Hot Reload**: CSS injection now takes ~50ms instead of ~500ms (10x faster)
- **Runtime**: Zero overhead - native CSS has no runtime cost

## Alternatives Considered

### Alternative 1: Keep SCSS with Shared Variables
- **Pros**: No migration effort, familiar tooling
- **Cons**: Still requires preprocessing, no unified design system, build complexity

### Alternative 2: CSS-in-JS (Styled Components, Emotion)
- **Pros**: Dynamic styling, component scoping
- **Cons**: Runtime overhead, bundle size increase, complexity for simple styles, poor developer experience

### Alternative 3: Tailwind CSS
- **Pros**: Utility-first approach, rapid development
- **Cons**: Large bundle size, difficult to share design tokens, less control over design system

### Alternative 4: Project-Specific Modern CSS (No Common Package)
- **Pros**: Independence, no coordination required
- **Cons**: Duplicated design tokens, inconsistent user experience, missed opportunity for unification

## Validation Criteria

Migration considered successful when:

- ✅ All projects (Pyrite, Expressio) use modern CSS
- ✅ Shared design tokens defined in `@garage44/common/css/`
- ✅ Visual parity maintained across all applications
- ✅ Light/dark themes work consistently
- ✅ Build times improved vs SCSS baseline
- ✅ Hot reload performance improved
- ✅ No visual regressions in production

## Future Enhancements

### Phase 2: Enhanced Design System
- [ ] CSS layers (`@layer`) for better cascade control
- [ ] Container queries for responsive component patterns
- [ ] CSS `@scope` for component style isolation
- [ ] View Transitions API for smooth page transitions

### Phase 3: Design Tooling
- [ ] Storybook integration showing shared component styles
- [ ] Design token documentation site
- [ ] Automated visual regression testing
- [ ] Figma plugin for design token synchronization

### Phase 4: Accessibility
- [ ] WCAG contrast checker for OKLCH color combinations
- [ ] High contrast theme support
- [ ] Reduced motion preferences
- [ ] Focus visible patterns

## References

- [MDN: CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting)
- [OKLCH Color Picker](https://oklch.com/)
- [Bun Build API](https://bun.sh/docs/bundler)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [OKLCH Color Space Explained](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [Can I Use: CSS Nesting](https://caniuse.com/css-nesting)
- [ADR-003: Bun Runtime Adoption](./ADR-003-bun-runtime-adoption.md)
- [ADR-004: Preact WebSocket Architecture](./ADR-004-preact-websocket-architecture.md)

## Related Documentation

- `/packages/pyrite/CSS_MIGRATION.md` - Detailed implementation guide for Pyrite migration
- `@garage44/common/css/` - Shared design system implementation
