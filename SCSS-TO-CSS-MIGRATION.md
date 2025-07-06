# SCSS to Modern CSS Migration with Bun

This document outlines the migration from SCSS to modern CSS using Bun as the CSS bundler. The migration maintains the same Bunchy collection pattern while leveraging modern CSS features like native nesting, custom properties, and Bun's built-in CSS bundling.

## ✅ What Has Been Completed

### 1. **Bunchy Infrastructure Updated**
- **packages/bunchy/utils.ts**: Replaced SASS compiler with Bun's CSS bundler
- **packages/bunchy/package.json**: Removed sass dependency
- **packages/bunchy/index.ts**: Updated to use CssBundler instead of Scss
- **packages/bunchy/tasks.ts**: Updated file watching and bundling tasks for CSS files

### 2. **Core CSS Files Created**
- **packages/expressio/src/css/_variables.css**: Complete variable conversion to CSS custom properties
- **packages/expressio/src/css/_spacing.css**: Utility classes using CSS custom properties
- **packages/expressio/src/css/_typography.css**: Font-face declarations (unchanged)
- **packages/expressio/src/css/app.css**: Main app CSS with imports and base styles
- **packages/common/css/common/_tooltip.css**: Tooltip component styles

### 3. **Component CSS Examples Created**
- **packages/common/components/ui/button/button.css**: Button component with nesting
- **packages/common/components/ui/icon/icon.css**: Icon component styles
- **packages/common/components/ui/notifications/notifications.css**: Complex component with animations
- **packages/expressio/src/components/pages/login/login.css**: Login page with complex animations

### 4. **Directory Structure Update**
- Bunchy now looks for `src/css/` instead of `src/scss/`
- Component CSS files are collected from `**/*.css` patterns
- File watching updated to monitor `.css` files instead of `.scss`

## 🔄 Migration Features

### **SCSS Variables → CSS Custom Properties**
```scss
// Before (SCSS)
$spacer-1: 8px;
$info-5: hsl(var(--info-h) var(--s-3) var(--l-5));
margin: $spacer-1;
```

```css
/* After (Modern CSS) */
:root {
    --spacer-1: 8px;
    --info-5: hsl(var(--info-h) var(--s-3) var(--l-5));
}
.element {
    margin: var(--spacer-1);
}
```

### **SCSS Math → CSS calc()**
```scss
// Before (SCSS)
$spacer-2: $spacer-1 * 2;
padding: $spacer-1 * 1.5;
```

```css
/* After (Modern CSS) */
:root {
    --spacer-2: calc(var(--spacer-1) * 2);
}
.element {
    padding: calc(var(--spacer-1) * 1.5);
}
```

### **SCSS Nesting → CSS Nesting**
```scss
// Before (SCSS)
.component {
    color: $primary;
    
    &:hover {
        color: $primary-dark;
    }
    
    .child {
        margin: $spacer-1;
    }
}
```

```css
/* After (Modern CSS) */
.component {
    color: var(--primary);
    
    &:hover {
        color: var(--primary-dark);
    }
    
    .child {
        margin: var(--spacer-1);
    }
}
```

### **SCSS Imports → CSS Imports**
```scss
// Before (SCSS)
@use "variables" as *;
@use "spacing";
```

```css
/* After (Modern CSS) */
@import "./_variables.css";
@import "./_spacing.css";
```

## 🚀 Bun CSS Bundler Configuration

The Bunchy CSS bundler now uses Bun's built-in CSS bundling with the following configuration:

```typescript
// packages/bunchy/utils.ts
export function CssBundler(settings) {
    return async function(options) {
        const result = await Bun.build({
            entrypoints: [options.entrypoint],
            experimentalCss: true,
            minify: options.minify,
            outdir: path.dirname(options.outFile),
            naming: `[name].[ext]`,
            sourcemap: options.sourcemap ? 'inline' : 'none',
        })
        // ... bundling logic
    }
}
```

## 📁 File Collection Pattern (Maintained)

Bunchy continues to collect stylesheets in the same way:

1. **App Styles**: `src/css/app.css` (main entry point)
2. **Component Styles**: All `**/*.css` files from components directories
3. **Common Styles**: Shared styles from `packages/common/`

The collection creates two bundles:
- `app.{buildId}.css` - Application-level styles
- `components.{buildId}.css` - Component styles bundle

## 🔧 Development Experience

### **Hot Module Replacement**
- File watching now monitors `.css` files
- Changes trigger automatic CSS rebuilding
- WebSocket client updates stylesheets without page reload

### **Build Performance**
- Bun's CSS bundler is significantly faster than SASS compilation
- Native CSS parsing and bundling
- Experimental CSS features enabled

## 📋 Remaining Tasks

### **Critical: Complete File Conversions**

1. **Convert Main Component SCSS Files**:
   ```bash
   # These need manual conversion:
   packages/expressio/src/components/main/main.scss
   packages/expressio/src/components/elements/**/*.scss
   packages/expressio/src/components/pages/**/*.scss (except login.scss - done)
   packages/common/components/field/**/*.scss
   ```

2. **Update Import Paths**: All CSS files need to import variables
   ```css
   /* Add to top of each component CSS file */
   @import "../../../css/_variables.css";
   ```

3. **Convert Remaining Component Libraries**:
   ```bash
   packages/common/components/ui/progress/progress.scss
   packages/common/components/field/**/*.scss
   ```

### **Directory Structure Updates**

1. **Move SCSS directory**: 
   ```bash
   mv packages/expressio/src/scss packages/expressio/src/css
   ```

2. **Update Common CSS Structure**:
   ```bash
   mkdir -p packages/common/css/common
   mv packages/common/scss/common/* packages/common/css/common/
   ```

3. **Update Bunchy Settings**: Directory paths in Bunchy configuration

### **Testing and Validation**

1. **Test CSS Bundling**:
   ```bash
   cd packages/expressio
   bun run build
   # Verify CSS files are generated correctly
   ```

2. **Test Development Mode**:
   ```bash
   bun run dev
   # Verify hot reloading works with CSS files
   ```

3. **Validate CSS Output**: Ensure all variables resolve correctly

### **Documentation Updates**

1. Update development guidelines to reference CSS instead of SCSS
2. Update component documentation
3. Update build process documentation

## 🎯 Benefits Achieved

### **Performance Improvements**
- **Faster bundling**: Bun's CSS bundler is significantly faster than SASS
- **Native CSS**: No transpilation overhead for modern CSS features
- **Reduced dependencies**: Removed SASS dependency

### **Modern CSS Features**
- **Native nesting**: No preprocessor needed
- **CSS custom properties**: Better runtime flexibility
- **Modern calc()**: More powerful mathematical expressions
- **CSS imports**: Standard specification compliance

### **Developer Experience**
- **Better tooling**: IDE support for modern CSS
- **Standards compliance**: Using web standards instead of proprietary syntax
- **Simplified build**: One bundler for all assets

## 🔗 Next Steps

1. **Complete component conversions** (highest priority)
2. **Test the build process** thoroughly
3. **Update development documentation**
4. **Consider removing old SCSS files** after validation
5. **Optimize CSS bundle splitting** if needed

The migration maintains full compatibility with the existing Bunchy collection system while modernizing the CSS pipeline for better performance and developer experience.