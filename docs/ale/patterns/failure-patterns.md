# Failure Patterns

This file documents patterns that have failed and should be avoided by future generations.

## CSS & Styling

### Creating Redundant Variables
- **Anti-pattern**: Creating new CSS variables without checking existing tokens
- **Discovered**: User feedback (initial setup)
- **Evidence**: User specifically mentioned preferring fewer variables over extensive token systems
- **Avoidance**: Always check `packages/expressio/src/css/tokens/` first

## Component Architecture

### Breaking Established Patterns
- **Anti-pattern**: Creating components that don't follow the existing structure
- **Discovered**: TBD by future generations
- **Evidence**: TBD
- **Avoidance**: Study existing components before creating new ones

## WebSocket Implementation

### Reinventing Connection Handling
- **Anti-pattern**: Creating new WebSocket connection patterns when existing ones work
- **Discovered**: TBD by future generations
- **Evidence**: TBD
- **Avoidance**: Extend `ws-client.ts` patterns rather than replacing them

## Function Implementation

### Referencing Undefined Functions
- **Anti-pattern**: Adding function calls before defining the function
- **Discovered**: Generation 1 (Exception page implementation)
- **Evidence**: Linter error when calling `showExceptionPage` before it was defined
- **Avoidance**: Define functions before referencing them, or plan function structure before implementation

---

*Last Updated: Generation 1 - Exception Page Implementation*
*This file is updated by each agent generation when failure patterns are identified.*