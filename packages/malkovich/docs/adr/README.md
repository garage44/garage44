# ADR System Redesign - Summary

This document explains the redesigned ADR system optimized for LLM consumption.

## Key Changes

### 1. Current State Focus (Not History)

**Before**: ADRs included "Evolution Log" sections tracking changes over time  
**After**: ADRs focus on current architectural state. Git history provides change tracking.

**Rationale**: Git is the authoritative log of changes. ADRs should document "what is" not "what was."

### 2. Higher Information Density

**Before**: Verbose prose with repetition across sections  
**After**: Structured, concise format with tables, diagrams, and bullet points

**Examples**:
- Technology stack in table format
- Decision criteria as weighted scores
- Anti-patterns as checklist
- Architecture diagrams (C4, Mermaid)

### 3. Visual Diagrams

**Added**: C4 and Mermaid diagrams to key ADRs:
- ADR-001: Package dependency graphs
- ADR-004: WebSocket communication flow
- ADR-011: CSS import structure and design token hierarchy
- ARCHITECTURE.md: System context and container diagrams

**Rationale**: Diagrams convey complex relationships faster than prose for both humans and LLMs.

### 4. Consolidated Architecture Reference

**New File**: `ARCHITECTURE.md` - Single source of truth for current system state:
- System overview with C4 diagrams
- Technology stack reference table
- Package boundaries and dependencies
- Communication patterns
- Design system structure
- Anti-patterns checklist

**Rationale**: LLMs can quickly understand current state without reading 20+ individual ADRs.

### 5. AI-Optimized Template

**New File**: `TEMPLATE-LLM.md` - Streamlined template:
- Removed redundant sections (Status/Date appear in frontmatter)
- Structured format (tables, bullet points)
- Diagram section included
- Higher information density

**Rationale**: Template guides creation of ADRs optimized for AI consumption.

## File Structure

```
packages/malkovich/docs/adr/
├── ARCHITECTURE.md          # NEW: Current system state overview
├── index.md                  # UPDATED: AI-optimized index
├── 001-monorepo.md          # UPDATED: Added diagrams
├── 004-preact-ws.md         # UPDATED: Added diagrams
├── 011-css.md               # UPDATED: Added diagrams
├── [other ADRs...]
└── guide/
    ├── TEMPLATE-LLM.md      # NEW: AI-optimized template
    ├── TEMPLATE.md          # Original template (kept for reference)
    ├── PATTERNS.md          # Unchanged
    └── [other guides...]
```

## Usage for AI Assistants

1. **Start with ARCHITECTURE.md** - Get current system overview
2. **Search index.md** - Find relevant ADRs by category/tag
3. **Read specific ADRs** - Deep dive into decisions
4. **Apply patterns** - Use PATTERNS.md frameworks
5. **Create new ADRs** - Use TEMPLATE-LLM.md

## Migration Notes

- **Existing ADRs**: Keep as-is (no breaking changes)
- **New ADRs**: Use TEMPLATE-LLM.md
- **ARCHITECTURE.md**: Update when system-wide changes occur
- **Evolution Logs**: Removed from new ADRs (Git handles history)

## Benefits

**For LLMs**:
- Faster context understanding (ARCHITECTURE.md)
- Higher information density (structured format)
- Visual diagrams aid comprehension
- Clear anti-patterns prevent mistakes

**For Humans**:
- Quick reference (ARCHITECTURE.md)
- Visual diagrams clarify relationships
- Less verbose, easier to scan
- Git history still available for change tracking

## Next Steps

1. ✅ Created ARCHITECTURE.md
2. ✅ Updated index.md
3. ✅ Added diagrams to key ADRs
4. ✅ Created TEMPLATE-LLM.md
5. ✅ Updated cursor rules
6. ⏳ Gradually update remaining ADRs with diagrams (optional)
7. ⏳ Remove Evolution Log sections from old ADRs (optional, Git has history)
