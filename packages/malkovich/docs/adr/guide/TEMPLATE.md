# ADR-XXX: [Short Descriptive Title]

---
**Metadata:**
- **ID**: ADR-XXX
- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Date**: YYYY-MM-DD
- **Tags**: [frontend, backend, infrastructure, tooling, ux, performance, security]
- **Impact Areas**: [expressio, pyrite, common, bunchy]
- **Decision Type**: technology_choice | architecture_pattern | tool_adoption | process_change
- **Related Decisions**: [ADR-XXX, ADR-YYY]
- **Supersedes**: [ADR-XXX] (if applicable)
- **Superseded By**: [ADR-XXX] (if applicable)
---

## Status
[Proposed/Accepted/Deprecated/Superseded] - [Brief status description]

## Date
YYYY-MM-DD (from commit `hash` or initial context)

## Context

[Describe the situation that led to this decision. Include:]
- What problem are we trying to solve?
- What are the business/technical drivers?
- What constraints exist?
- What is the current state?

## Decision

[State the decision clearly and concisely. Include:]
- What exactly was decided?
- What approach/technology/pattern will be used?
- Key implementation details

## Consequences

### Positive
- [Benefit 1 with specific impact]
- [Benefit 2 with quantified metrics where possible]
- [Performance/maintainability/developer experience improvements]

### Negative
- [Trade-off 1 with mitigation strategy]
- [Limitation 1 with workaround if available]
- [Risk 1 with monitoring approach]

## Decision Pattern

[Reusable template for similar decisions in the future]

**When to Apply This Pattern:**
- [Condition 1]
- [Condition 2]
- [Condition 3]

**When NOT to Apply:**
- [Anti-condition 1]
- [Anti-condition 2]

**Key Questions to Ask:**
1. [Question about requirements]
2. [Question about constraints]
3. [Question about trade-offs]
4. [Question about long-term implications]

**Decision Criteria:**
- [Criterion 1]: Weight X/10
- [Criterion 2]: Weight Y/10
- [Criterion 3]: Weight Z/10

**Success Metrics:**
- [Metric 1]: Target value
- [Metric 2]: Target value
- [Metric 3]: Target value

## Rationale Chain

[Explicit reasoning showing how the decision was reached]

**Primary Reasoning:**
1. We chose X because Y
2. Y enables Z
3. Z addresses the core problem of W

**Alternatives Considered:**

### Alternative 1: [Name]
- **Pros**: [Specific benefits]
- **Cons**: [Specific drawbacks]
- **Rejected Because**: [Specific reason with evidence]

### Alternative 2: [Name]
- **Pros**: [Specific benefits]
- **Cons**: [Specific drawbacks]
- **Rejected Because**: [Specific reason with evidence]

**Trade-off Analysis:**
- [Trade-off 1]: We accepted X to gain Y (quantify if possible)
- [Trade-off 2]: We sacrificed X for Y because [reason]

**Assumptions:**
- [Assumption 1]: How to validate
- [Assumption 2]: How to validate
- [Assumption 3]: How to validate

## Code Context

**Files Created:**
- `/path/to/file1.ts` - Purpose and description
- `/path/to/file2.tsx` - Purpose and description

**Files Modified:**
- `/path/to/existing.ts` - What changed and why
- `/path/to/another.tsx` - What changed and why

**Implementation Pattern:**
```typescript
// Example showing the recommended pattern
import { something } from '@garage44/common'

// Clear example of how to implement this decision
export const ExamplePattern = () => {
  // Implementation details
}
```

**Anti-patterns to Avoid:**
```typescript
// ❌ Don't do this:
// Bad pattern with explanation of why it's wrong

// ✅ Do this instead:
// Good pattern with explanation of why it's right
```

**Migration Path:**
1. [Step 1 with specific actions]
2. [Step 2 with specific actions]
3. [Step 3 with validation criteria]

## AI Reasoning Prompts

[Prompts to guide LLMs when considering similar decisions]

**When Evaluating Similar Decisions:**
1. "Does this decision align with [architectural principle]?"
2. "How does this compare to the approach in ADR-XXX?"
3. "What are the long-term maintenance implications?"
4. "Does this introduce new dependencies or complexity?"

**Pattern Recognition Cues:**
- If you see [pattern X], consider applying this decision pattern
- If the problem involves [characteristic Y], this ADR is relevant
- If requirements include [feature Z], review this decision's trade-offs

**Red Flags:**
- ⚠️ [Warning sign 1]: Indicates potential misapplication
- ⚠️ [Warning sign 2]: Suggests reconsidering this approach
- ⚠️ [Warning sign 3]: May indicate architectural drift

**Consistency Checks:**
- Does this align with ADR-XXX (related decision)?
- Does this contradict ADR-YYY? If so, why?
- Does this reinforce our architectural principles?

## Architectural Implications

**Core Principles Affected:**
- [Principle 1]: [Reinforced/Modified/Challenged] - How and why
- [Principle 2]: [Reinforced/Modified/Challenged] - How and why

**System-Wide Impact:**
- **Package Boundaries**: How this affects package separation
- **Communication Patterns**: Changes to data flow or APIs
- **State Management**: Impact on application state architecture
- **Build System**: Changes to compilation or bundling

**Coupling Changes:**
- [Component A] now depends on [Component B]: Justification
- Removed coupling between [X] and [Y]: Benefit

**Future Constraints:**
- [Constraint 1]: What this decision prevents/enables in the future
- [Constraint 2]: Long-term implications
- [Constraint 3]: Scalability considerations

## Evolution Log

[Track how this decision has evolved over time]

**Initial Decision** (YYYY-MM-DD):
- Original rationale and context
- Initial implementation approach

**Update 1** (YYYY-MM-DD):
- What changed and why
- New information or constraints
- Lessons learned

**Update 2** (YYYY-MM-DD):
- Further evolution
- Adjustments based on real-world usage

**Lessons Learned:**
- [Lesson 1]: What we learned in practice
- [Lesson 2]: What we'd do differently
- [Lesson 3]: Unexpected benefits/challenges

**Adjustment Recommendations:**
- [Recommendation 1]: Consider this improvement
- [Recommendation 2]: Watch for this issue
- [Recommendation 3]: Future enhancement opportunity

## Related Decisions

- [ADR-XXX](./ADR-XXX-title.md): How it relates
- [ADR-YYY](./ADR-YYY-title.md): Dependency or conflict
- [ADR-ZZZ](./ADR-ZZZ-title.md): Similar pattern or follow-up

## References

- [Documentation link](https://example.com)
- [Relevant article or paper](https://example.com)
- [Tool documentation](https://example.com)
- Related commit: `hash`

---

## Template Usage Notes

**For LLMs creating new ADRs:**
1. Fill in all metadata fields at the top
2. Be specific in Context - include concrete examples
3. Make Decision section actionable and clear
4. Quantify Consequences where possible (performance numbers, bundle sizes, etc.)
5. Provide real code examples in Code Context
6. Write AI Reasoning Prompts thinking about future similar decisions
7. Consider long-term implications in Architectural Implications
8. Leave Evolution Log empty initially (fill in as decision evolves)

**For Humans reviewing ADRs:**
- Ensure metadata is accurate and complete
- Verify code examples are current and correct
- Validate that decision aligns with stated architectural principles
- Check that AI Reasoning Prompts would actually be helpful
- Confirm related decisions are correctly linked
