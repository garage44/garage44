# Cursor Rules Architecture

This directory contains modular, layered cursor rules for the Garage44 monorepo. The rules use a **hierarchical, context-aware lookup system** to optimize LLM performance.

## Layered Approach

### Why Layered?

Large context files can decrease LLM performance. Instead of loading everything at once, we use a **tree-like lookup system**:

1. **Index files** (`*/index.mdc`) - Lightweight overviews (~50-100 lines)
2. **Topic files** (`*/*.mdc`) - Focused, detailed patterns (~100-200 lines each)
3. **Context-based loading** - LLM loads only relevant topic files based on what you're working on

### Benefits

- ✅ **Reduced context size** - Only load what's needed
- ✅ **Faster responses** - Less context to process
- ✅ **Better focus** - Relevant patterns only
- ✅ **Easier maintenance** - Smaller, focused files
- ✅ **Comprehensive coverage** - All patterns still available

## Structure

```
.cursor/rules/
├── adr.mdc                    # Architecture Decision Records
├── backend.mdc                # Compatibility shim (points to backend/index.mdc)
├── backend/
│   ├── index.mdc              # Backend overview & quick reference
│   ├── bun-serve.mdc         # Bun.serve() patterns
│   ├── websocket.mdc         # WebSocket server patterns
│   ├── database.mdc          # Database patterns
│   ├── middleware.mdc        # Middleware patterns
│   ├── cli.mdc               # CLI patterns
│   ├── logging.mdc           # Logging patterns
│   ├── config.mdc            # Configuration patterns
│   ├── errors.mdc            # Error handling
│   └── files.mdc             # File I/O patterns
├── frontend.mdc               # Compatibility shim (points to frontend/index.mdc)
├── frontend/
│   ├── index.mdc             # Frontend overview & quick reference
│   ├── components.mdc        # Component architecture
│   ├── state.mdc             # DeepSignal patterns
│   ├── css.mdc               # CSS guidelines
│   ├── websocket.mdc        # WebSocket client patterns
│   ├── icons.mdc             # Icon component usage
│   └── performance.mdc       # Optimization patterns
├── pr-deployment.mdc          # Compatibility shim (points to pr-deployment/index.mdc)
└── pr-deployment/
    ├── index.mdc             # PR/deployment overview
    ├── pr-workflow.mdc       # PR creation and review
    ├── ci-cd.mdc             # CI/CD pipeline
    ├── deployment.mdc        # Deployment architecture
    └── troubleshooting.mdc   # Common issues and solutions
```

## How It Works

### Context-Based Activation

Rules use YAML frontmatter with glob patterns:

```yaml
---
description: "Brief description"
globs:
  - "packages/expressio/api/**"
  - "**/*.tsx"
alwaysApply: false
---
```

- **Index files** (`alwaysApply: true`) - Always loaded for overview
- **Topic files** (`alwaysApply: false`) - Loaded based on file patterns

### LLM Lookup Flow

1. **User opens a file** (e.g., `packages/expressio/api/workspaces.ts`)
2. **Index file loads** (`backend/index.mdc`) - Provides overview
3. **Topic files activate** based on context:
   - Working with Bun.serve()? → Load `backend/bun-serve.mdc`
   - Adding WebSocket routes? → Load `backend/websocket.mdc`
   - Database operations? → Load `backend/database.mdc`
   - etc.

### Example: Backend Development

**Scenario**: Working on a new API endpoint

1. LLM loads `backend/index.mdc` (overview)
2. LLM detects API file → loads `backend/bun-serve.mdc` (routing patterns)
3. LLM detects middleware usage → loads `backend/middleware.mdc` (auth patterns)
4. LLM detects database queries → loads `backend/database.mdc` (query patterns)

**Result**: Only 4 focused files loaded (~400 lines) instead of 1 large file (~600 lines)

### Example: Frontend Development

**Scenario**: Creating a new component with state

1. LLM loads `frontend/index.mdc` (overview)
2. LLM detects component file → loads `frontend/components.mdc` (structure)
3. LLM detects state usage → loads `frontend/state.mdc` (DeepSignal patterns)
4. LLM detects CSS file → loads `frontend/css.mdc` (styling patterns)

**Result**: Only 4 focused files loaded (~400 lines) instead of 1 large file (~700 lines)

## File Size Guidelines

- **Index files**: 50-100 lines (overview only)
- **Topic files**: 100-200 lines (focused patterns)
- **Maximum per file**: ~250 lines (split if larger)

## Adding New Rules

### 1. Create Topic File

```bash
# Example: Adding a new backend topic
touch .cursor/rules/backend/testing.mdc
```

### 2. Add YAML Frontmatter

```yaml
---
description: "Testing patterns and best practices"
globs:
  - "**/*.test.ts"
  - "**/tests/**"
alwaysApply: false
---
```

### 3. Update Index File

Add reference in `backend/index.mdc`:

```markdown
## Quick Reference

For detailed patterns, see:
- **Testing**: `backend/testing.mdc` - Testing patterns and best practices
```

### 4. Update Compatibility Shim

If needed, update `backend.mdc`:

```markdown
- `backend/testing.mdc` - Testing patterns
```

## Compatibility Shims

The root-level files (`backend.mdc`, `frontend.mdc`, `pr-deployment.mdc`) are **compatibility shims** that:
- Point to the new modular structure
- Maintain backward compatibility
- Provide quick reference

These can be removed once all tooling is updated to use the new structure.

## Best Practices

1. **Keep index files lightweight** - Overview only, no detailed patterns
2. **Focus topic files** - One concern per file
3. **Use descriptive names** - Clear what each file covers
4. **Update indexes** - When adding new topic files
5. **Test context loading** - Verify only relevant files load

## Performance Impact

**Before (monolithic):**
- Backend rules: ~600 lines always loaded
- Frontend rules: ~700 lines always loaded
- PR/deployment: ~400 lines always loaded
- **Total**: ~1700 lines always in context

**After (layered):**
- Index files: ~150 lines always loaded
- Topic files: ~200-400 lines loaded based on context
- **Total**: ~350-550 lines in context (60-70% reduction)

This significantly improves LLM performance while maintaining comprehensive coverage.
