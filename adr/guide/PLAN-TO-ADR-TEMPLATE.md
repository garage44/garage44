# Plan-to-ADR Conversion Template

This guide provides a structured workflow for converting approved Cursor plans into Architecture Decision Records (ADRs). This ensures the feedback loop: **Plan → Build → ADR → Learning**.

## When to Convert a Plan to an ADR

Convert a plan to an ADR when:
- ✅ Plan was approved and successfully implemented
- ✅ Decision has architectural significance (see AI-REASONING-GUIDE.md)
- ✅ Pattern or approach should be reused in future decisions
- ✅ Decision affects multiple components or establishes precedent

## Conversion Workflow

### Phase 1: Pre-Implementation (During Planning)

**1. Flag ADR Need in Plan**

In your plan, include an "ADR Candidate" section:
```markdown
## ADR Candidate

**Decision Type**: technology_choice | architecture_pattern | tool_adoption | process_change
**Significance**: High | Medium | Low
**Rationale**: [Why this deserves an ADR]
**Related ADRs**: [Existing ADRs this builds on or modifies]
```

**2. Reference Existing ADRs**

Always cite relevant ADRs in the plan:
```markdown
## Architectural Alignment

Following ADR-003 (Bun Runtime), we should...
This builds on ADR-004 (WebSocket Architecture) by...
Deviates from ADR-010 because...
```

### Phase 2: During Implementation

**1. Track Actual Decisions**

Keep notes on:
- What worked as planned
- What required adjustment
- Unexpected challenges
- Better approaches discovered
- Performance measurements
- Code patterns that emerged

**2. Document Code Context**

Track:
- Files created/modified
- Implementation patterns used
- Anti-patterns avoided
- Migration steps taken

### Phase 3: Post-Implementation (Creating ADR)

## Step-by-Step Conversion Guide

### Step 1: Extract Metadata

**From Plan:**
```markdown
Plan: "Migrate CSS from SCSS to native modern CSS"
Tags: frontend, tooling, design-system
Impact: expressio, pyrite, styleguide
Related: Build system changes, design tokens
```

**To ADR Metadata:**
```markdown
---
id: ADR-011
title: Modern CSS Migration and Unified Styleguide
status: Accepted
date: 2025-10-11
tags: [frontend, infrastructure, tooling, ux]
impact_areas: [expressio, pyrite, common, styleguide]
decision_type: tool_adoption | architecture_pattern
related_decisions: [ADR-003, ADR-004]
supersedes: []
superseded_by: []
---
```

### Step 2: Map Plan Sections to ADR Sections

| Plan Section | ADR Section | Notes |
|--------------|-------------|-------|
| Overview/Goal | Context | Expand with why this was needed |
| Approach | Decision | Add what was actually decided |
| Implementation Steps | Code Context | Show actual files and patterns |
| Risks/Considerations | Consequences (Negative) | Include actual issues encountered |
| Benefits | Consequences (Positive) | Include measured results |
| Alternatives Considered | Rationale Chain | Expand with deeper analysis |
| Success Criteria | Decision Pattern (Metrics) | Add actual results achieved |

### Step 3: Add ADR-Specific Sections

These sections don't exist in plans but are crucial for ADRs:

**Decision Pattern:**
```markdown
## Decision Pattern

**When to Apply This Pattern:**
- [Extract from: When would someone face a similar decision?]

**Key Questions to Ask:**
1. [What questions led to this decision?]
2. [What criteria were most important?]
3. [What validated the decision?]

**Decision Criteria:**
- [Criterion 1]: [Weight] - [How it was evaluated]
```

**Rationale Chain:**
```markdown
## Rationale Chain

**Primary Reasoning:**
1. We chose [X] because [Y]
2. [Y] enables [Z]
3. [Z] addresses the core problem of [W]

**Alternatives Considered:**
[From plan, but expand with specific rejection reasons]

**Trade-off Analysis:**
- We accepted [cost] to gain [benefit] because [reason]
```

**AI Reasoning Prompts:**
```markdown
## AI Reasoning Prompts

**When Evaluating Similar Decisions:**
1. "[Question that would help LLM in future]"
2. "[Pattern recognition cue]"

**Red Flags:**
- ⚠️ [Warning sign that indicates misapplication]
- ⚠️ [Sign that suggests reconsidering approach]
```

**Architectural Implications:**
```markdown
## Architectural Implications

**Core Principles Affected:**
- [Principle from README.md]: Reinforced/Modified - How

**System-Wide Impact:**
- Package Boundaries: [How this affected separation]
- Communication Patterns: [Changes to data flow]
```

### Step 4: Add Retrospective Analysis

This is NEW information not in the original plan:

**What Actually Happened:**
```markdown
## Evolution Log

**Initial Implementation** (YYYY-MM-DD):
[Describe what was actually built]

**Lessons Learned:**
- ✅ [What worked better than expected]
- ⚠️ [What was more challenging than anticipated]
- 💡 [What we'd do differently next time]
- 📊 [Actual metrics vs predicted]

**Unexpected Outcomes:**
- [Positive surprises]
- [Challenges not anticipated in plan]
- [Emergent patterns or practices]
```

### Step 5: Quantify Results

Add actual measurements where plan had estimates:

**Plan Said:**
> "Expected 2-5x performance improvement"

**ADR Shows:**
> "Build time reduced from 2s to 0.3s (6.6x faster)"

**Plan Said:**
> "Should reduce bundle size"

**ADR Shows:**
> "Bundle size reduced from 110KB to 80KB (27% reduction)"

## Complete Conversion Example

### Original Plan (Abbreviated)

```markdown
# Modern CSS Migration Plan

## Overview
Migrate from SCSS to native CSS for better performance and simpler build.

## Approach
- Move design tokens to common package
- Convert SCSS nesting to native CSS nesting
- Use OKLCH for color system

## Benefits
- Faster builds
- Simpler toolchain
- Better design system sharing

## Risks
- Browser compatibility (need modern browsers)
- Team learning curve
```

### Converted to ADR (Key Sections)

```markdown
---
id: ADR-011
title: Modern CSS Migration and Unified Styleguide
status: Accepted
date: 2025-10-11
tags: [frontend, infrastructure, tooling, ux]
impact_areas: [expressio, pyrite, common, styleguide]
decision_type: tool_adoption | architecture_pattern
related_decisions: [ADR-003]
---

## Context

The monorepo had multiple applications using SCSS independently, creating:
- Inconsistent design systems across projects
- Duplication of design tokens
- Complex build process requiring preprocessing
- Opportunity: Modern browsers now support native CSS nesting

[Much more detail than plan...]

## Decision

Migrate all projects from SCSS to modern native CSS with unified design system...

[Implementation details from actual work...]

## Decision Pattern

**When to Apply This Pattern:**
- Migrating from preprocessor to native browser features
- Establishing shared design system across applications
- Simplifying build toolchain

**Key Questions:**
1. Do target browsers support required features?
2. What design tokens should be shared vs project-specific?
3. How to migrate incrementally without disrupting development?

**Decision Criteria:**
- Browser support: 8/10 (modern browsers only)
- Design system unification: 10/10 (critical need)
- Migration effort: 7/10 (significant but manageable)

## Rationale Chain

**Primary Reasoning:**
1. Native CSS nesting eliminates primary need for SCSS
2. Shared design tokens in common package enable consistency
3. Bun's native CSS bundler is faster than SCSS preprocessing
4. Single `theme.css` import simplifies consumption

**Alternatives Considered:**
- Keep SCSS: Rejected due to build complexity and duplication
- Tailwind: Rejected due to bundle size and token control
- CSS-in-JS: Rejected due to runtime cost and complexity

[More detail than plan...]

## Code Context

**Files Created:**
- `/packages/common/css/theme.css` - Unified theme entry point
- `/packages/common/css/_variables.css` - Shared design tokens
[From actual implementation...]

**Implementation Pattern:**
```css
/* ✅ Single import pattern */
@import "../../../common/css/theme.css";
```

**Anti-patterns:**
```css
/* ❌ Don't import individual files */
@import "../../../common/css/_variables.css";
@import "../../../common/css/_typography.css";
```

[From actual code...]

## AI Reasoning Prompts

**When Evaluating Similar Decisions:**
1. "Does this align with ADR-003's developer experience priority?"
2. "Can native browser features replace this preprocessor?"
3. "How does this affect design system consistency?"

**Red Flags:**
- ⚠️ Proposing SCSS in new components (contradicts this decision)
- ⚠️ Not using common design tokens (breaks consistency)
- ⚠️ Requiring older browser support (incompatible)

## Evolution Log

**Initial Implementation** (2025-10-11):
- Migrated Expressio and Pyrite successfully
- Created unified `theme.css` entry point

**Lessons Learned:**
- ✅ Native CSS nesting worked seamlessly
- ✅ Single import pattern much better than anticipated
- ⚠️ OKLCH required more documentation than expected
- 📊 Build performance: 6.6x faster (exceeded 2-5x estimate)
- 📊 Bundle size: 27% reduction (better than expected)

**Unexpected Benefits:**
- Hot reload significantly faster (10x improvement)
- Design token changes propagate instantly
- Developers prefer native CSS in DevTools (no source maps)

**Adjustment Recommendations:**
- Document OKLCH color space better for team
- Create visual design token documentation
- Consider CSS layers for better cascade control
```

## Common Mapping Patterns

### Plan: "Overview" → ADR: "Context"

**Expand with:**
- Historical context (what led to this point)
- Business drivers and constraints
- Current state pain points
- Attempted solutions that didn't work

### Plan: "Approach" → ADR: "Decision"

**Expand with:**
- Precise technical choices made
- Configuration specifics
- Integration points
- Actual implementation decisions made during development

### Plan: "Implementation Steps" → ADR: "Code Context"

**Transform to:**
- Actual files created/modified (not planned files)
- Real code patterns that emerged
- Anti-patterns discovered during implementation
- Migration steps that actually worked

### Plan: "Benefits/Risks" → ADR: "Consequences"

**Enhance with:**
- Quantified results (actual measurements)
- Unexpected positive outcomes
- Issues that manifested (or didn't)
- Long-term implications observed

## ADR Review Checklist

Before finalizing converted ADR:

- [ ] All metadata fields completed
- [ ] Context explains why this was needed (not just what)
- [ ] Decision is clear and actionable
- [ ] Consequences include actual measured results
- [ ] Decision Pattern extracted for reuse
- [ ] Rationale Chain shows reasoning explicitly
- [ ] Code Context has real code examples
- [ ] AI Reasoning Prompts would help future decisions
- [ ] Architectural Implications analyzed
- [ ] Evolution Log captures lessons learned
- [ ] Related ADRs are linked
- [ ] References include relevant links

## Timing Recommendations

**Ideal Timing:**
- Write ADR within 1 week of implementation completion
- Memories are fresh, details are accurate
- Easy to gather metrics and screenshots

**If Delayed:**
- Review git commits for actual changes
- Check performance metrics from monitoring
- Interview team members about challenges
- Review code reviews for discussed alternatives

## Template for Quick Conversion

Use this when converting a simple plan:

```markdown
# ADR-XXX: [Title from Plan]

---
[Extract metadata from plan context]
---

## Context
[Copy plan overview, expand with why/background]

## Decision
[Copy plan approach, add what was actually decided]

## Consequences

### Positive
[From plan benefits + actual measured results]

### Negative
[From plan risks + what actually happened]

## Decision Pattern
[Extract: When to apply this pattern in future?]

## Rationale Chain

**Primary Reasoning:**
[Why this decision, step by step]

**Alternatives Considered:**
[From plan, with rejection reasons]

## Code Context

**Files Created:**
[Actual files from implementation]

**Implementation Pattern:**
[Code example showing the pattern]

## AI Reasoning Prompts

**When Evaluating Similar Decisions:**
1. [Key question for future LLMs]
2. [Pattern recognition cue]

**Red Flags:**
- ⚠️ [Warning sign]

## Architectural Implications

**Core Principles Affected:**
[Check against README.md principles]

## Evolution Log

**Lessons Learned:**
- ✅ [What worked well]
- ⚠️ [What was challenging]
- 💡 [What we'd do differently]
- 📊 [Actual vs predicted metrics]

## Related Decisions
[ADRs cited in plan + discovered during implementation]
```

## Anti-Patterns to Avoid

**❌ Don't:**
- Copy plan verbatim without expansion
- Skip retrospective analysis
- Forget to quantify results
- Omit lessons learned
- Write ADR months after implementation (details are lost)
- Create ADR for trivial decisions
- Skip the Decision Pattern section (most valuable for LLMs)

**✅ Do:**
- Add depth beyond original plan
- Include actual measurements
- Document what you learned
- Extract reusable patterns
- Write while implementation is fresh
- Focus on architecturally significant decisions
- Make AI Reasoning Prompts actionable

---

## Quick Conversion Workflow

1. **Gather Materials**
   - Original approved plan
   - Implementation commits
   - Performance metrics
   - Team feedback

2. **Create ADR File**
   - Use TEMPLATE.md
   - Fill metadata first

3. **Convert Core Sections**
   - Context from plan overview (expand)
   - Decision from plan approach (actual implementation)
   - Consequences from plan benefits/risks (add results)

4. **Add ADR-Specific Sections**
   - Decision Pattern (extract for reuse)
   - Rationale Chain (explicit reasoning)
   - AI Reasoning Prompts (help future LLMs)
   - Architectural Implications (system impact)
   - Evolution Log (lessons learned)

5. **Review & Refine**
   - Check against template checklist
   - Ensure actionable for future decisions
   - Verify code examples are accurate
   - Link related ADRs

6. **Update Index**
   - Add to docs/adr/README.md table
   - Update architectural principles if needed
   - Link from related ADRs

---

This conversion process ensures that approved plans become valuable architectural documentation that improves future decision-making through the feedback loop: Plan → Build → ADR → Learning.
