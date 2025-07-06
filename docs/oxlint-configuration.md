# OxLint Configuration Documentation

## Overview

This project uses **OxLint** as its primary linter, replacing ESLint for faster performance and modern TypeScript/React support. OxLint is a Rust-based linter that provides 524+ rules across multiple categories.

## Current Configuration (`oxlint.json`)

### Rule Categories
- **Correctness** (176 rules): ✅ **Error** - Code that is outright wrong or useless
- **Performance** (10 rules): ⚠️ **Warn** - Code that can be written to run faster  
- **Suspicious** (33 rules): ⚠️ **Warn** - Code that is most likely wrong or useless
- **Pedantic** (82 rules): ⚠️ **Warn** - Strict rules with occasional false positives
- **Style** (149 rules): ⚠️ **Warn** - Code style and idiom improvements
- **Restriction** (66 rules): 🚫 **Off** - Prevents use of certain language features
- **Nursery** (8 rules): 🚫 **Off** - New experimental rules

### Enabled Plugins
- **react** - React/Preact specific rules
- **jsx-a11y** - Accessibility rules for JSX
- **typescript** - TypeScript-specific enhancements
- **unicorn** - Modern JavaScript patterns
- **import** - Import/export organization

## Key Rules Configured

### Performance Rules (High Priority)
```json
"perf/no-accumulating-spread": "error",
"react-perf/jsx-no-new-array-as-prop": "error",
"react-perf/jsx-no-new-function-as-prop": "error",
"react-perf/jsx-no-new-object-as-prop": "error",
"unicorn/prefer-set-has": "warn",
"unicorn/prefer-array-find": "warn"
```

### React/Preact Specific Rules
```json
"react/exhaustive-deps": "error",
"react/jsx-key": "error",
"react/jsx-no-target-blank": "error",
"react/jsx-no-duplicate-props": "error",
"react/void-dom-elements-no-children": "error",
"react/jsx-boolean-value": "warn",
"react/self-closing-comp": "warn"
```

### TypeScript Enhancements
```json
"typescript/prefer-as-const": "error",
"typescript/consistent-type-imports": "warn",
"typescript/array-type": "warn",
"typescript/consistent-type-definitions": "warn",
"typescript/prefer-function-type": "warn",
"typescript/no-explicit-any": "warn"
```

### Code Quality Improvements
```json
"unicorn/prefer-string-starts-ends-with": "error",
"unicorn/prefer-array-some": "warn",
"unicorn/prefer-includes": "warn",
"unicorn/prefer-string-slice": "warn",
"unicorn/throw-new-error": "error",
"unicorn/no-instanceof-array": "error"
```

### Accessibility Rules
```json
"jsx-a11y/alt-text": "warn",
"jsx-a11y/anchor-has-content": "warn",
"jsx-a11y/click-events-have-key-events": "warn",
"jsx-a11y/no-autofocus": "warn"
```

## Performance Benefits

### Before (ESLint)
- ⏱️ Slower execution (Node.js based)
- 📦 Large dependency footprint
- ⚙️ Complex configuration

### After (OxLint)
- ⚡ **Extremely fast** (Rust-based, finishing in milliseconds)
- 📦 **Zero dependencies** (single binary)
- ⚙️ **Simple configuration**
- 🔧 **524 available rules** vs ESLint's scattered ecosystem
- 🚀 **4+ threads** for parallel processing

## Rule Statistics
- **Total Available**: 524 rules
- **Default Enabled**: 123 rules (Correctness category)
- **Project Enabled**: ~180 rules (all categories except Restriction/Nursery)
- **Auto-fixable**: Many rules support automatic fixes
- **SARIF Support**: Security-focused rules output SARIF format

## Commands

### Run Linting
```bash
# All packages
bun run lint:ts

# Individual package
cd packages/[package-name]
oxlint **/*.{ts,tsx}
```

### See Available Rules
```bash
npx oxlint --rules
```

### CLI Options
```bash
oxlint --help                    # Show help
oxlint --deny rule-name          # Enable specific rule
oxlint --allow rule-name         # Disable specific rule
oxlint --fix                     # Apply auto-fixes
```

## Migration Summary

### ✅ Completed
1. **Removed ESLint dependencies** from all packages
2. **Updated all lint scripts** to use `oxlint`
3. **Converted ESLint disable comments** to OxLint format
4. **Created comprehensive configuration** with 180+ rules
5. **Added React/TypeScript specific rules** for the project

### 🔧 Enhanced Features
- **Performance rules** to catch inefficient React patterns
- **Accessibility rules** for better UX
- **TypeScript rules** for type safety
- **Import organization** rules
- **Modern JavaScript patterns** via Unicorn rules

## Benefits for This Project

1. **🚀 Speed**: Linting completes in milliseconds vs seconds
2. **🎯 React-focused**: Optimized for React/Preact patterns
3. **📊 Better insights**: 180+ rules catching more issues
4. **🛠️ Auto-fixes**: Many rules can automatically fix issues
5. **🔍 Type safety**: Enhanced TypeScript rule coverage
6. **♿ Accessibility**: Built-in a11y rule support
7. **⚡ Performance**: Catches performance anti-patterns

## Example Issues Detected

- Unused imports (`languages` import in enola package)
- Unused function parameters (`session` parameter)
- Control characters in regex patterns
- React performance anti-patterns
- TypeScript type inconsistencies
- Accessibility violations

The configuration is optimized for this TypeScript/React/Preact monorepo while maintaining fast build times and comprehensive code quality checks.