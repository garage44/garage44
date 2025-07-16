# Effective Strategies

This file accumulates proven strategies across agent generations.

## CSS & Styling

### Token System Usage
- **Pattern**: Always check `packages/expressio/src/css/tokens/` before creating new CSS variables
- **Discovered**: Generation 1 (initial)
- **Evidence**: User prefers semantic naming over color-based variables
- **Implementation**: Use existing tokens like `--color-primary` instead of creating `--blue-500`

## Component Patterns

### Preact Component Structure
- **Pattern**: Follow established component structure in `packages/common/components/`
- **Discovered**: Generation 1 (initial)
- **Evidence**: Consistent file organization improves maintainability
- **Implementation**: Use `component.tsx` + `component.css` pattern

## WebSocket Integration

### Real-time Updates
- **Pattern**: Use established WebSocket client patterns from `packages/common/lib/ws-client.ts`
- **Discovered**: Generation 1 (initial)
- **Evidence**: Existing patterns handle connection management effectively
- **Implementation**: Extend existing patterns rather than creating new ones

## Framework Implementation

### ALE System Design
- **Pattern**: Focus on continuous learning from ALL interactions, not just complex sessions
- **Discovered**: Generation 1 (ALE setup discussion)
- **Evidence**: User specifically wanted learning from simple questions, not just degradation management
- **Implementation**: Silent knowledge capture + file-based persistence + clean responses for simple tasks

### Knowledge Documentation
- **Pattern**: File-based institutional memory over chat-based handoffs
- **Discovered**: Generation 1 (ALE setup discussion)
- **Evidence**: User corrected initial approach to emphasize persistent file storage
- **Implementation**: Update `docs/ale/patterns/` files continuously, create succession packages only for complex sessions

### User Communication
- **Pattern**: Start with practical examples, explain benefits through real scenarios
- **Discovered**: Generation 1 (ALE setup discussion)
- **Evidence**: User engaged more with "how it works in practice" than theoretical framework
- **Implementation**: Lead with concrete examples, follow with conceptual explanations

---

*Last Updated: Generation 1 - ALE Setup*
*This file is updated by each agent generation when new effective patterns are discovered.*