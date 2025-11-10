# AI Reasoning Guide for Architecture Decision Records

This guide teaches LLMs how to effectively use the ADR corpus to make better architectural decisions, maintain consistency, and extrapolate principles from existing decisions.

## Table of Contents

1. [How to Search for Relevant Decisions](#how-to-search-for-relevant-decisions)
2. [How to Extrapolate from Existing Patterns](#how-to-extrapolate-from-existing-patterns)
3. [When to Create a New ADR](#when-to-create-a-new-adr)
4. [How to Evaluate Consistency](#how-to-evaluate-consistency)
5. [Example Reasoning Chains](#example-reasoning-chains)
6. [Red Flags and Architectural Drift](#red-flags-and-architectural-drift)

---

## How to Search for Relevant Decisions

### Step 1: Understand the Decision Type

First, classify what kind of decision you're making:
- **Technology Choice**: Adopting new runtime, framework, library
- **Architecture Pattern**: Structure, boundaries, communication patterns
- **Tool Adoption**: Developer tooling (linters, bundlers, formatters)
- **Process Change**: Workflow, development practices, deployment

### Step 2: Search Strategies

**By Decision Type:**
```
Use codebase_search:
- "What technology choices have been made?" → ADR-003 (Bun), ADR-010 (OxLint)
- "How is the architecture structured?" → ADR-001 (Monorepo), ADR-004 (Preact/WebSocket)
- "What design system decisions exist?" → ADR-011, ADR-012, ADR-013, ADR-014
```

**By Technology/Topic:**
```
Use grep to find ADRs mentioning specific technologies:
- grep "WebSocket" docs/adr/*.md → ADR-004, ADR-006
- grep "CSS" docs/adr/*.md → ADR-011, ADR-012
- grep "migration" docs/adr/*.md → ADR-006, ADR-007, ADR-011
```

**By Impact Area:**
```
Check README.md metadata table for:
- Decisions affecting "common" package
- Decisions impacting "expressio" or "pyrite"
- Cross-cutting decisions (multiple impact areas)
```

### Step 3: Read Related Decisions

Always check the "Related Decisions" section of relevant ADRs to discover connected decisions you should also review.

### Quick Reference Table

| Question | Relevant ADRs | Pattern |
|----------|--------------|---------|
| How should I structure packages? | ADR-001 | Architecture Pattern |
| What runtime should I use? | ADR-003 | Technology Adoption |
| How do I implement real-time features? | ADR-004, ADR-006 | Architecture Pattern |
| How should I handle styling? | ADR-011, ADR-012 | Design System Pattern |
| Should I migrate to a new tool? | ADR-010 | Tool Replacement |
| How do I structure a migration? | ADR-006, ADR-007, ADR-011 | Migration Pattern |

---

## How to Extrapolate from Existing Patterns

### Pattern-Based Reasoning Framework

**1. Identify the Pattern Category**

Match your decision to a pattern from `PATTERNS.md`:
- Technology Adoption Pattern
- Migration Pattern
- Architecture Pattern
- Design System Pattern
- Tool Replacement Pattern

**2. Extract Decision Criteria**

From the relevant pattern, use the weighted criteria:
```
Example for Technology Adoption:
- Developer Experience: 9/10
- Performance: 8/10
- Ecosystem Maturity: 7/10
- Team Knowledge: 6/10
```

**3. Apply Pattern Questions**

Use the pattern's key questions:
```
Technology Adoption Pattern asks:
1. What specific problem does this solve?
2. What's the migration path if unsuitable?
3. How does this affect feature delivery?
4. What are long-term maintenance implications?
5. Are there production case studies?
```

**4. Reference Similar Decisions**

Find ADRs that followed this pattern and extract lessons:
```
ADR-003 (Bun adoption):
- Chose modern tech over mature for DX gains
- Validated with proof-of-concept
- Kept Node.js as fallback option
- Monitored compatibility issues

Apply to new decision:
- Choose [NewTech] over [CurrentTech] for [specific benefit]
- Validate with isolated test
- Keep [CurrentTech] as fallback
- Monitor [specific metrics]
```

**5. Check Architectural Principles**

Validate against core principles from `README.md`:
- Real-time First
- Package Boundary Discipline
- Developer Experience Priority
- Commercial/Community Balance
- LLM-Optimized Strategic Reasoning
- Unified Design System

### Extrapolation Example

**Scenario**: Should we adopt Drizzle ORM for database access?

**Pattern Identification**: Technology Adoption Pattern (like ADR-003)

**Criteria Evaluation**:
- DX (9/10): Type-safe queries, better than raw SQL → Score: 9
- Performance (8/10): Minimal overhead, prepared statements → Score: 8
- Ecosystem (7/10): Growing, active development → Score: 7
- Team Knowledge (6/10): New but well-documented → Score: 7
- Future (8/10): Strong TypeScript community support → Score: 8
- Migration (7/10): Gradual adoption possible → Score: 8

**Pattern Questions**:
1. Solves: Type safety in database queries, reduces bugs
2. Migration: Can start with one model, keep existing code
3. Feature delivery: Initially slower (learning), faster long-term
4. Maintenance: Better refactoring, fewer runtime errors
5. Case studies: Used by Payload CMS, other TS projects

**Reference ADR-003**:
- Bun chose performance + DX over maturity → Drizzle similar trade-off
- Monitored compatibility issues → Should monitor query performance
- Team learned Bun quickly → Drizzle has good docs, should be similar

**Principles Check**:
- ✅ Developer Experience Priority: Strong type safety improves DX
- ✅ Future-proofing: TypeScript-first approach aligns with stack
- ✅ Package Boundary Discipline: Can isolate in data layer

**Conclusion**: Adopt Drizzle following ADR-003 pattern - start with one package, monitor performance, keep fallback option.

---

## When to Create a New ADR

### Decision Significance Checklist

Create a new ADR when the decision meets **any** of these criteria:

**High Significance** (Always create ADR):
- [ ] Affects multiple packages or applications
- [ ] Introduces new architectural pattern
- [ ] Adopts new core technology (runtime, framework)
- [ ] Changes build or deployment process
- [ ] Establishes new development practices
- [ ] Impacts system performance or scalability significantly
- [ ] Affects security or data handling

**Medium Significance** (Strongly consider ADR):
- [ ] Affects single package but sets precedent
- [ ] Replaces existing tool or library
- [ ] Changes API design patterns
- [ ] Impacts developer workflow
- [ ] Modifies design system or component architecture

**Low Significance** (Probably doesn't need ADR):
- [ ] Implementation detail within existing pattern
- [ ] Bug fix or refactoring without architectural change
- [ ] Configuration change within established system
- [ ] Routine dependency update

### Trigger Phrases

If your plan or implementation includes these phrases, consider creating an ADR:

- "We should adopt [new technology]..."
- "Let's migrate from X to Y..."
- "This sets a pattern for..."
- "This affects how we..."
- "Going forward, we'll use..."
- "This changes the architecture by..."

### ADR vs. Documentation

**Create ADR for**: Decisions with trade-offs, alternatives, and architectural implications

**Use regular docs for**: Implementation guides, API references, usage examples

---

## How to Evaluate Consistency

### Consistency Check Process

**1. Core Principles Alignment**

From `docs/adr/README.md`, check alignment with:

```markdown
✅ Real-time First
Question: "Does this default to WebSocket/real-time, or does it use REST?"
Reference: ADR-004, ADR-006

✅ Package Boundary Discipline
Question: "Does this respect package boundaries? Are dependencies correct?"
Reference: ADR-001

✅ Developer Experience Priority
Question: "Does this optimize for fast iteration and simplicity?"
Reference: ADR-003, ADR-007, ADR-010

✅ Commercial/Community Balance
Question: "Is licensing appropriate? Core vs utility separation clear?"
Reference: ADR-002

✅ LLM-Optimized Strategic Reasoning
Question: "Does this support AI-assisted development and decision-making?"
Reference: ADR-009

✅ Unified Design System
Question: "Does this use shared design tokens and components?"
Reference: ADR-011, ADR-012
```

**2. Technology Stack Consistency**

Check that choices align with established stack:

```
Runtime: Bun (ADR-003)
Frontend: Preact (ADR-004)
State: DeepSignal (ADR-004)
Communication: WebSocket-first (ADR-004, ADR-006)
CSS: Modern native CSS with OKLCH (ADR-011)
Linting: OxLint (ADR-010)
Package Manager: Bun workspaces (ADR-001, ADR-003)
```

**3. Pattern Consistency**

Ensure approach follows established patterns:

```
Example: Proposing new API endpoint

Check ADR-006: "REST to WebSocket Migration"
- Pattern says: Default to WebSocket for user-facing features
- Pattern says: REST acceptable for one-time operations

Question: Is this user-facing with potential for updates?
- Yes → Use WebSocket (consistent)
- No → REST is acceptable (justified exception)
```

**4. Detect Conflicts**

Use grep and codebase_search to find potentially conflicting decisions:

```bash
# Check if decision contradicts existing ADRs
grep -i "keyword" docs/adr/*.md

# Example: Proposing Express.js
grep -i "express\|bun.serve" docs/adr/*.md
# Result: ADR-007 migrated TO Bun.serve, AWAY from Express
# Conflict! Proposing Express contradicts ADR-007
```

### Example Consistency Evaluation

**Scenario**: Proposing to use SCSS for new component

**Consistency Check**:

1. **Principles**: Check "Unified Design System"
   - ADR-011 migrated FROM SCSS TO native CSS
   - Reason: Modern CSS features, simpler build, unified tokens
   - **Conflict detected** ⚠️

2. **Technology Stack**:
   - Current: Native CSS with Bun bundler
   - Proposed: SCSS (requires preprocessing)
   - **Inconsistent** ⚠️

3. **Pattern Check**:
   - Design System Pattern (ADR-011, ADR-012)
   - Says: Use `@import common/css/theme.css` and native CSS
   - **Violates pattern** ⚠️

**Conclusion**: Proposing SCSS contradicts ADR-011. Either:
- Follow ADR-011 and use native CSS (recommended)
- OR justify why SCSS is necessary and propose superseding ADR-011

---

## Example Reasoning Chains

### Example 1: Evaluating New Library

**Question**: Should we use Zod for schema validation?

**Reasoning Chain**:

1. **Search for relevant ADRs**:
   - grep "validation" docs/adr/*.md → No specific validation ADR
   - Check ADR-003 (Bun/TypeScript) → TypeScript-first approach

2. **Identify pattern**: Technology Adoption Pattern

3. **Evaluate criteria**:
   - DX (9/10): Type inference, great DX ✅
   - Performance (8/10): Fast runtime validation ✅
   - Ecosystem (7/10): Popular in TypeScript community ✅
   - Fits TypeScript-first approach from ADR-003 ✅

4. **Check principles**:
   - Developer Experience Priority ✅
   - No conflicts with existing decisions ✅

5. **Conclusion**: Adopt Zod
   - Aligns with TypeScript-first approach (ADR-003)
   - Follows Technology Adoption Pattern
   - Create ADR-015 to document this decision

### Example 2: Choosing Communication Pattern

**Question**: Should new notifications feature use WebSocket or Server-Sent Events?

**Reasoning Chain**:

1. **Search for relevant ADRs**:
   - ADR-004: Preact + WebSocket Real-time Architecture
   - ADR-006: REST to WebSocket Migration

2. **Extract principles**:
   - ADR-004: "WebSocket-first for real-time communication"
   - ADR-006: "Default to WebSocket for user-facing features"

3. **Evaluate need**:
   - Bidirectional? No, only server→client
   - Real-time? Yes
   - User-facing? Yes

4. **Apply reasoning**:
   - SSE would work (one-way communication)
   - BUT WebSocket is established pattern (ADR-004)
   - WebSocket infrastructure already exists
   - Future: Might need client→server (marking as read)

5. **Check consistency**:
   - "Real-time First" principle ✅
   - Existing WebSocket infrastructure ✅
   - Follows ADR-004 and ADR-006 patterns ✅

6. **Conclusion**: Use WebSocket
   - Consistent with established patterns
   - Enables future bidirectional needs
   - No new infrastructure needed
   - No ADR needed (follows existing pattern)

### Example 3: Package Structure Decision

**Question**: Should new email service live in common or expressio?

**Reasoning Chain**:

1. **Search for relevant ADRs**:
   - ADR-001: Monorepo Structure with Package Separation

2. **Extract criteria from ADR-001**:
   - Common: Shared utilities, MIT licensed, reusable
   - Expressio: Core business logic, AGPL, app-specific

3. **Evaluate email service**:
   - Reusable? Maybe (Pyrite could send emails)
   - Business logic? No (just email sending utility)
   - License? MIT appropriate for utility
   - Domain? Infrastructure, not i18n-specific

4. **Check boundaries**:
   - Does it depend on expressio internals? No
   - Could Pyrite use it? Yes
   - Is it domain-agnostic? Yes

5. **Apply ADR-001 principle**:
   - "Separate packages by business domain, not technical layers"
   - Email is infrastructure utility, not business domain
   - "Shared utilities in common package" ✅

6. **Conclusion**: Place in common package
   - Follows ADR-001 package separation
   - Enables reuse across applications
   - MIT license appropriate
   - No ADR needed (follows existing pattern)

---

## Red Flags and Architectural Drift

### Recognizing Red Flags

**Technology Red Flags**:
- ⚠️ Proposing technology contradicted by recent ADR
- ⚠️ Adding dependency that duplicates existing capability
- ⚠️ Choosing mature tech over modern (conflicts with DX priority)
- ⚠️ Ignoring existing infrastructure (WebSocket, Bun, etc.)

**Architecture Red Flags**:
- ⚠️ Creating new package boundary without justification
- ⚠️ Introducing circular dependencies
- ⚠️ Mixing business logic with infrastructure
- ⚠️ Bypassing established communication patterns

**Pattern Red Flags**:
- ⚠️ Implementing feature without checking for similar ADRs
- ⚠️ Using different pattern than established precedent
- ⚠️ Making architecture decision without documented reasoning
- ⚠️ Deviating from core principles without justification

**Process Red Flags**:
- ⚠️ Skipping ADR for significant decision
- ⚠️ Not updating ADR when decision evolves
- ⚠️ Implementing before evaluating alternatives
- ⚠️ Ignoring lessons from previous ADRs

### Detecting Architectural Drift

**Drift Indicators**:

1. **Inconsistent Technology Choices**
   - Different packages using different solutions for same problem
   - Example: Some components use REST, others WebSocket, with no clear rationale

2. **Eroding Boundaries**
   - Packages importing from places they shouldn't
   - Example: expressio importing from pyrite (violates ADR-001)

3. **Principle Violations**
   - Decisions that contradict stated architectural principles
   - Example: Blocking synchronous operations in real-time UI (violates "Real-time First")

4. **Pattern Abandonment**
   - New code not following established patterns
   - Example: New API endpoint using REST without justification (violates ADR-006)

**How to Handle Drift**:

1. **Acknowledge**: "This appears to conflict with [ADR-XXX]"
2. **Evaluate**: Is the conflict necessary? What changed?
3. **Document**: If deviation is justified, create/update ADR
4. **Correct**: If not justified, follow established pattern

### Example Drift Detection

**Scenario**: Code review finds new component using inline styles

**Detection**:
```typescript
// ❌ New component using inline styles
<div style={{ margin: '1rem', padding: '2rem' }}>
```

**Check ADRs**:
- ADR-011: "NO inline styles - use CSS classes"
- ADR-012: "Use design tokens from common/css/theme.css"

**Drift Analysis**:
- Violates established pattern ⚠️
- Bypasses design system ⚠️
- No documented reason ⚠️

**Response**:
"This uses inline styles, which violates ADR-011 and ADR-012. Please use design tokens:
```css
.component {
  margin: var(--spacer-2);
  padding: var(--spacer-4);
}
```
If inline styles are necessary, please document why this is an exception."

---

## Practical Usage Guide

### For Creating Plans

**Before writing plan**:
1. Search for relevant ADRs using strategies above
2. Cite specific ADRs that inform your approach
3. Explain how plan aligns with patterns and principles
4. Flag any deviations with justification

**In the plan**:
```markdown
## Architectural Alignment

This plan follows:
- ADR-004: Using WebSocket for real-time updates
- ADR-012: Components use design tokens from common package
- Pattern: Architecture Pattern (defining clear boundaries)

Deviations:
- None

Suggests new ADR:
- Yes, if approved this should be documented as ADR-015
```

### For Reviewing Code

**Check for**:
1. Does code follow patterns from relevant ADRs?
2. Are new architectural decisions documented?
3. Is there architectural drift?
4. Should an ADR be created/updated?

### For Making Decisions

**Process**:
1. Search ADRs for relevant decisions
2. Apply appropriate pattern from PATTERNS.md
3. Evaluate consistency with principles
4. Document reasoning (even if not creating ADR)
5. If significant, create ADR using TEMPLATE.md

---

## Quick Reference

### Decision Workflow

```
New Decision Needed
       ↓
Search ADRs (codebase_search, grep)
       ↓
Found Relevant ADR?
       ↓ Yes          ↓ No
Follow Pattern    Apply Generic Pattern
       ↓                    ↓
Evaluate Consistency   Check Principles
       ↓                    ↓
Implement Decision   Document if Significant
       ↓                    ↓
        Create/Update ADR?
              ↓ Yes
         Use TEMPLATE.md
```

### Key Files to Reference

- `README.md`: Core principles and ADR index
- `PATTERNS.md`: Reusable decision patterns
- `TEMPLATE.md`: ADR structure for new decisions
- `PLAN-TO-ADR-TEMPLATE.md`: Converting plans to ADRs

### Command Cheat Sheet

```bash
# Find ADRs by topic
grep -i "websocket" docs/adr/*.md

# Search for pattern
grep -i "migration" docs/adr/PATTERNS.md

# Check technology decisions
grep -i "bun\|node\|deno" docs/adr/*.md

# Find design system decisions
grep -i "css\|design\|theme" docs/adr/*.md
```

---

This guide should be consulted whenever making significant architectural or technology decisions. The patterns and reasoning chains provide a framework for consistent, well-reasoned decisions that align with the project's architectural principles.
