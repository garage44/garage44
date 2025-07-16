# Agent Lineage Evolution (ALE) Documentation

This directory contains the institutional memory for Agent Lineage Evolution - persistent knowledge that accumulates across agent generations.

## Directory Structure

```
docs/ale/
├── generations/          # Succession packages from each agent generation
├── patterns/            # Accumulated knowledge patterns
├── active/              # Current project state
└── README.md           # This file
```

## How It Works

1. **Agent Generation Lifecycle**: When an agent reaches succession triggers (75% context, 15 interactions, quality degradation), it creates a succession package in `generations/`

2. **Knowledge Accumulation**: Each generation updates `patterns/` with learned strategies and failure modes

3. **Contextual Continuity**: New generations read ALL files in this directory to inherit institutional knowledge

4. **Active State**: Current project context is maintained in `active/` for immediate reference

## Usage

When starting a new agent generation:
1. Reference all `docs/ale/**/*.md` files for context
2. Build upon documented patterns
3. Avoid documented failure modes
4. Update files when learning new patterns

This creates a persistent knowledge base that improves over time, rather than losing context between chat sessions.