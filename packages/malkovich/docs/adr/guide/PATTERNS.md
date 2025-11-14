# ADR Decision Patterns

This document captures reusable decision-making patterns extracted from existing ADRs. When facing similar decisions in the future, these patterns provide structured frameworks for evaluation and decision-making.

## Table of Contents

1. [Technology Adoption Pattern](#technology-adoption-pattern)
2. [Migration Pattern](#migration-pattern)
3. [Architecture Pattern](#architecture-pattern)
4. [Design System Pattern](#design-system-pattern)
5. [Tool Replacement Pattern](#tool-replacement-pattern)

---

## Technology Adoption Pattern

**Extracted From**: ADR-003 (Bun Runtime), ADR-004 (Preact + WebSocket)

**When to Use:**
- Adopting a new runtime, framework, or core technology
- Replacing an existing foundational technology
- Making long-term infrastructure commitments

**Decision Criteria Template:**

| Criterion | Weight | Evaluation Questions |
|-----------|--------|---------------------|
| Developer Experience | 9/10 | Does it improve iteration speed? Reduce complexity? |
| Performance | 8/10 | Measurable improvements in build time, runtime, bundle size? |
| Ecosystem Maturity | 7/10 | Community size, package compatibility, production usage? |
| Team Knowledge | 6/10 | Learning curve, documentation quality, expertise available? |
| Future Viability | 8/10 | Active development, roadmap alignment, vendor lock-in risk? |
| Migration Cost | 7/10 | Effort to adopt, breaking changes, fallback options? |

**Key Questions:**
1. What specific problem does this technology solve that current tools don't?
2. What's the migration path if this technology proves unsuitable?
3. How does this affect the team's ability to deliver features?
4. What are the long-term maintenance implications?
5. Are there production case studies in similar contexts?

**Success Metrics:**
- Build time improvement: Target 2-5x faster
- Developer feedback: Positive sentiment from team
- Production stability: No regressions in key metrics
- Adoption rate: Team comfortable within 1-2 weeks

**Common Pitfalls:**
- ⚠️ Adopting bleeding-edge tech without proven production usage
- ⚠️ Underestimating ecosystem compatibility issues
- ⚠️ Ignoring team learning curve and productivity impact
- ⚠️ Not having a fallback plan for critical production issues

**AI Reasoning Prompts:**
- "Compare this technology's ecosystem maturity to [current technology]"
- "What specific features does this enable that justify migration cost?"
- "How does this align with our developer experience priority principle?"
- "What's the worst-case scenario if this technology fails?"

**Example Application:**
```markdown
## Evaluating New Technology: Deno vs Bun

**Problem**: Need faster build times and simpler TypeScript setup

**Evaluation**:
- DX: Bun (9/10) - Native TS, fast | Deno (8/10) - Native TS, different imports
- Performance: Bun (9/10) - 10x faster npm | Deno (7/10) - Fast, smaller gains
- Ecosystem: Bun (7/10) - Growing, npm compatible | Deno (6/10) - Different module system
- Team: Bun (8/10) - npm familiar | Deno (6/10) - New paradigm
- Future: Both (8/10) - Active development

**Decision**: Bun - Better ecosystem compatibility and superior performance gains
```

---

## Migration Pattern

**Extracted From**: ADR-006 (REST to WebSocket), ADR-007 (Bun.serve), ADR-011 (Modern CSS)

**When to Use:**
- Migrating from one technology/pattern to another
- Gradual adoption of new approaches
- Modernizing existing systems

**Decision Criteria Template:**

| Criterion | Weight | Evaluation Questions |
|-----------|--------|---------------------|
| Value Add | 9/10 | What specific improvements does migration provide? |
| Risk Level | 8/10 | Can we migrate incrementally? What's the rollback plan? |
| Effort Required | 7/10 | Realistic estimate? Can it be phased? |
| User Impact | 9/10 | Will users notice? Is there any service disruption? |
| Reversibility | 7/10 | Can we easily roll back if issues arise? |

**Migration Strategy Framework:**

**Phase 1: Validation**
1. Create proof-of-concept in isolated environment
2. Measure baseline metrics (performance, bundle size, DX)
3. Document breaking changes and compatibility issues
4. Get team feedback on proposed approach

**Phase 2: Incremental Rollout**
1. Identify low-risk migration target (single component/endpoint)
2. Implement migration with feature flag or parallel implementation
3. Monitor metrics and gather real-world data
4. Iterate based on findings

**Phase 3: Gradual Expansion**
1. Migrate additional areas based on priority/risk
2. Maintain old and new systems in parallel during transition
3. Document learnings and update migration guide
4. Build confidence through successful migrations

**Phase 4: Completion**
1. Migrate remaining areas
2. Remove old system/dependencies
3. Update documentation and training materials
4. Celebrate and retrospect

**Key Questions:**
1. Can we run old and new systems in parallel during migration?
2. What's the minimum viable migration to validate benefits?
3. How do we handle data/state compatibility during transition?
4. What metrics will prove migration success/failure?
5. What's the rollback trigger and process?

**Success Metrics:**
- Migration velocity: Steady progress without blocking features
- Zero production incidents: No user-facing issues from migration
- Metric improvements: Quantified gains in target metrics
- Team confidence: Developers comfortable with new approach

**Common Pitfalls:**
- ⚠️ Big-bang migrations without incremental validation
- ⚠️ Insufficient rollback planning
- ⚠️ Not maintaining old system during transition
- ⚠️ Ignoring edge cases that work differently in new system

**AI Reasoning Prompts:**
- "What's the smallest increment we can migrate to validate benefits?"
- "How does this migration align with ADR-003's developer experience principle?"
- "What monitoring should we add to detect migration issues early?"
- "Can this migration be feature-flagged for easy rollback?"

**Example Application:**
```markdown
## Migrating API Endpoints from REST to WebSocket

**Phase 1**: Migrate workspace GET endpoint (low risk, high value)
**Phase 2**: Add translation status updates (new functionality)
**Phase 3**: Migrate mutation endpoints with read-after-write pattern
**Phase 4**: Remove deprecated REST endpoints after 2 sprints

**Rollback**: Maintain REST endpoints in parallel, feature flag WebSocket
**Metrics**: Latency (target <100ms), connection stability (>99.9%)
```

---

## Architecture Pattern

**Extracted From**: ADR-001 (Monorepo Structure), ADR-004 (Preact + WebSocket)

**When to Use:**
- Defining system structure and boundaries
- Establishing communication patterns
- Making choices that affect multiple components

**Decision Criteria Template:**

| Criterion | Weight | Evaluation Questions |
|-----------|--------|---------------------|
| Scalability | 9/10 | Does this support future growth? |
| Maintainability | 9/10 | Easy to understand, modify, and test? |
| Boundary Clarity | 8/10 | Clear separation of concerns? |
| Team Collaboration | 7/10 | Does it enable or hinder parallel work? |
| Performance | 8/10 | Measurable impact on user experience? |
| Flexibility | 7/10 | Can we adapt to changing requirements? |

**Architecture Evaluation Framework:**

**1. Define Boundaries**
- What are the logical domains/concerns?
- Where should boundaries exist?
- What crosses boundaries and how?

**2. Establish Communication**
- How do components interact?
- Sync vs async? Request/response vs events?
- What are the data flow patterns?

**3. Consider Scale**
- Does this work at 10x current size?
- Can components evolve independently?
- What are the scaling bottlenecks?

**4. Validate Principles**
- Does this align with core architectural principles?
- What principles does this establish or modify?
- Are there unavoidable trade-offs?

**Key Questions:**
1. What are the natural boundaries in this system?
2. How does this decision affect coupling between components?
3. Can we test components in isolation?
4. What happens when requirements change significantly?
5. Does this enable or prevent future architectural changes?

**Success Metrics:**
- Code organization: Clear structure, easy to navigate
- Change velocity: Features can be added without friction
- Bug isolation: Issues contained to specific components
- Team velocity: Parallel work without conflicts

**Common Pitfalls:**
- ⚠️ Over-architecting for hypothetical future requirements
- ⚠️ Creating boundaries that don't align with actual domains
- ⚠️ Choosing patterns that optimize for the wrong dimension
- ⚠️ Ignoring team size and organizational structure

**AI Reasoning Prompts:**
- "How does this structure support the 'Package Boundary Discipline' principle?"
- "What dependencies exist between [component A] and [component B]?"
- "Can we test this component without starting the entire system?"
- "Does this enable the 'Real-time First' principle from ADR-004?"

**Example Application:**
```markdown
## Structuring New AI Translation Feature

**Boundaries**:
- Domain logic: packages/expressio/lib/translate.ts
- API layer: packages/expressio/api/translate.ts
- State management: packages/common/lib/store.ts
- UI: packages/expressio/src/components/translate/

**Communication**:
- UI ↔ API: WebSocket for real-time progress (follows ADR-004)
- API ↔ Domain: Direct function calls (same package)
- Domain ↔ External: Async promises with timeout handling

**Validation**: Aligns with monorepo boundaries (ADR-001) and real-time architecture (ADR-004)
```

---

## Design System Pattern

**Extracted From**: ADR-011 (Modern CSS), ADR-012 (Design System Consolidation)

**When to Use:**
- Establishing visual/UX consistency
- Creating shared component libraries
- Making CSS/styling architecture decisions

**Decision Criteria Template:**

| Criterion | Weight | Evaluation Questions |
|-----------|--------|---------------------|
| Consistency | 10/10 | Single source of truth? |
| Reusability | 9/10 | Reduces duplication? Easy to share? |
| Maintainability | 9/10 | Changes propagate correctly? |
| Developer Experience | 8/10 | Easy to use? Well documented? |
| Performance | 7/10 | Bundle size impact? Runtime cost? |
| Accessibility | 9/10 | WCAG compliant by default? |

**Design System Framework:**

**1. Define Tokens**
- Colors: Semantic scales (primary, success, danger, etc.)
- Spacing: Mathematical progression
- Typography: Modular scale
- Components: Sizes, states, variants

**2. Establish Patterns**
- Layout components (containers, grids, sidebars)
- Form patterns (inputs, validation, submission)
- Feedback patterns (notifications, loading, errors)
- Navigation patterns (menus, breadcrumbs, pagination)

**3. Create Components**
- Generic components in common package
- Project-specific extensions
- Clear composition patterns
- Accessibility built-in

**4. Document Usage**
- Living styleguide with examples
- Code snippets and anti-patterns
- Accessibility guidelines
- Migration guides

**Key Questions:**
1. Where should design tokens live? (common vs project-specific)
2. How generic should shared components be?
3. How do we handle project-specific customization?
4. What's the migration path for existing components?
5. How do we ensure accessibility compliance?

**Success Metrics:**
- Code reduction: Measure eliminated duplication
- Consistency: Visual audit across applications
- Adoption: Usage of shared components vs custom
- Accessibility: WCAG compliance score

**Common Pitfalls:**
- ⚠️ Creating overly generic components that fit no use case well
- ⚠️ Tight coupling between styleguide and specific applications
- ⚠️ Design tokens in wrong package (not truly shared)
- ⚠️ No clear guidance on when to use shared vs custom components

**AI Reasoning Prompts:**
- "Should this component live in @garage44/common or stay project-specific?"
- "How does this align with the unified design system from ADR-012?"
- "Are we using design tokens from common/css/theme.css?"
- "Does this component need specialized behavior like Pyrite's PanelContext?"

**Example Application:**
```markdown
## Creating New Table Component

**Token Usage**:
- Spacing: var(--spacer-2), var(--spacer-3) from common theme
- Colors: var(--surface-0), var(--border-primary) from common theme
- Typography: var(--font-size-base) from common theme

**Generic Component** (@garage44/common):
- Basic table structure, sorting, filtering
- Keyboard navigation, screen reader support
- Theme-aware styling

**Project Extensions**:
- Expressio: Translation-specific columns
- Pyrite: User presence indicators

**Validation**: Uses common design tokens (ADR-011), generic enough for reuse (ADR-012)
```

---

## Tool Replacement Pattern

**Extracted From**: ADR-010 (OxLint replacing ESLint)

**When to Use:**
- Replacing development tooling (linters, formatters, bundlers)
- Upgrading to more modern/performant alternatives
- Simplifying toolchain

**Decision Criteria Template:**

| Criterion | Weight | Evaluation Questions |
|-----------|--------|---------------------|
| Performance | 9/10 | Measurable speed improvements? |
| Feature Parity | 8/10 | Does it cover our use cases? |
| Migration Cost | 7/10 | Realistic effort? Automated migration? |
| Maintenance Burden | 8/10 | Less configuration? Fewer dependencies? |
| Future Proofing | 7/10 | Active development? Growing adoption? |
| Team Impact | 6/10 | Learning curve? Tool familiarity? |

**Tool Evaluation Framework:**

**1. Benchmark Current Tool**
- Measure performance (time, resource usage)
- Document pain points and limitations
- Identify features you rely on
- Count dependencies and configuration

**2. Evaluate Replacement**
- Run same benchmarks on new tool
- Verify feature coverage
- Test on real codebase (not just samples)
- Check ecosystem compatibility

**3. Calculate Migration**
- Estimate time to migrate
- Identify breaking changes
- Plan configuration conversion
- Consider team training needs

**4. Validate Benefits**
- Quantify improvements (speed, simplicity)
- Confirm feature requirements met
- Verify edge cases work
- Get team feedback

**Key Questions:**
1. What specific pain points does the new tool solve?
2. Are there deal-breaker missing features?
3. What's the one-way door risk (can we rollback)?
4. How does this simplify our toolchain?
5. What's the maintenance burden comparison?

**Success Metrics:**
- Performance: 2-10x improvements in target metrics
- Simplicity: Reduced dependencies, configuration lines
- Feature coverage: 100% of required features working
- Team satisfaction: Positive developer feedback

**Common Pitfalls:**
- ⚠️ Focusing only on performance, ignoring feature gaps
- ⚠️ Not testing on real codebase before committing
- ⚠️ Underestimating migration complexity
- ⚠️ Choosing tool that's too experimental/unstable

**AI Reasoning Prompts:**
- "Does this tool align with our 'Developer Experience Priority' principle?"
- "How does this compare to ADR-003's Bun adoption (modern tooling pattern)?"
- "What's the dependency reduction impact?"
- "Can we validate this on a single package before monorepo-wide adoption?"

**Example Application:**
```markdown
## Evaluating New Bundler: Rollup vs Turbopack

**Current**: Webpack (slow, complex config)

**Benchmarks**:
- Webpack: 5s build, 300 lines config, 12 dependencies
- Rollup: 2s build, 50 lines config, 3 dependencies
- Turbopack: 0.5s build, 20 lines config, 1 dependency

**Feature Check**:
- ✅ CSS modules: All support
- ✅ Code splitting: All support
- ✅ HMR: Rollup limited, others full
- ⚠️ Turbopack: Beta, missing plugins we need

**Decision**: Rollup - Best balance of performance, maturity, and simplicity
**Turbopack**: Revisit in 6 months when more stable
```

---

## Using These Patterns

**For LLMs:**
1. **Identify Pattern**: Match the decision type to appropriate pattern
2. **Apply Framework**: Use the evaluation criteria and questions
3. **Cross-reference ADRs**: Check related ADRs for context
4. **Validate Alignment**: Ensure consistency with architectural principles
5. **Document Decision**: Use TEMPLATE.md with pattern-specific insights

**For Humans:**
1. Review patterns before major decisions
2. Use frameworks to structure evaluation
3. Document deviations from patterns (with justification)
4. Update patterns based on new learnings

**Pattern Evolution:**
- Patterns should evolve as we learn from new decisions
- Add new patterns when novel decision types emerge
- Refine criteria weights based on retrospectives
- Update AI prompts based on what helps in practice

---

## Contributing New Patterns

When you identify a new reusable decision pattern:

1. Document at least 2-3 ADRs that follow the pattern
2. Extract common evaluation criteria
3. Identify key questions that led to good decisions
4. Document pitfalls from real experiences
5. Create AI reasoning prompts for future use
6. Add to this document with link to source ADRs
