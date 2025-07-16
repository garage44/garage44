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

## Error Handling & User Experience

### Visual Error Feedback
- **Pattern**: Implement styled error overlays instead of relying on console output or system notifications
- **Discovered**: Generation 1 (Exception page implementation)
- **Evidence**: User requested styled exception page over system notifications for build errors
- **Implementation**: Create modal overlays with comprehensive error information (task, error, details, timestamp)

### WebSocket Error Broadcasting
- **Pattern**: Use existing WebSocket patterns for error communication
- **Discovered**: Generation 1 (Exception page implementation)
- **Evidence**: Successfully integrated with existing bunchy broadcast system
- **Implementation**: Extend existing broadcast patterns rather than creating new communication channels

### Progressive Error Handling
- **Pattern**: Add error broadcasting to all build tasks systematically
- **Discovered**: Generation 1 (Exception page implementation)
- **Evidence**: User needed error handling for code_frontend, stylesApp, and stylesComponents
- **Implementation**: Add try/catch blocks with broadcast calls to all build tasks

### User Interface Patterns
- **Pattern**: Implement self-contained styling for error components
- **Discovered**: Generation 1 (Exception page implementation)
- **Evidence**: Inline styles prevented external dependencies and CSS conflicts
- **Implementation**: Use inline styles or style injection for isolated components

## Task Management

### Todo Lists for Complex Tasks
- **Pattern**: Create structured todo lists for multi-step implementations
- **Discovered**: Generation 1 (Exception page implementation)
- **Evidence**: User appreciated systematic approach to complex task breakdown
- **Implementation**: Use todo_write tool for tasks with 3+ distinct steps

## Testing & Automation

### Playwright Screenshot Configuration
- **Pattern**: Configure browser launch arguments to hide scrollbars, not CSS injection
- **Discovered**: Generation 2 (Screenshot scrollbar removal)
- **Evidence**: User rejected CSS injection approaches and preferred browser-level configuration
- **Implementation**: Add `--hide-scrollbars` to chromium.launch() args instead of injecting CSS styles
- **Anti-pattern**: Using CSS injection (`page.addStyleTag()` or `page.evaluate()`) to hide scrollbars - less reliable and not the proper approach

---

*Last Updated: Generation 2 - Playwright Screenshot Configuration*
*This file is updated by each agent generation when new effective patterns are discovered.*