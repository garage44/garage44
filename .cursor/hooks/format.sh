#!/bin/bash
# Cursor format hook - auto-formats files after edit
# Receives file paths from stdin (one per line)
# Auto-formats TypeScript/TSX files with oxlint and eslint
# Auto-formats CSS files with stylelint

# Get the project root (where .cursor directory is located)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Process each file path from stdin
while IFS= read -r filepath || [ -n "$filepath" ]; do
    # Skip empty lines
    [ -z "$filepath" ] && continue

    # Convert to absolute path if relative
    if [[ "$filepath" != /* ]]; then
        filepath="$PROJECT_ROOT/$filepath"
    fi

    # Skip if file doesn't exist
    [ ! -f "$filepath" ] && continue

    # Get file extension
    ext="${filepath##*.}"

    # Format TypeScript/TSX files
    if [[ "$ext" == "ts" || "$ext" == "tsx" ]]; then
        # Run oxlint with --fix (config auto-detected from project root)
        if command -v bunx &> /dev/null; then
            bunx oxlint --fix "$filepath" 2>/dev/null || true
            bunx eslint --fix "$filepath" 2>/dev/null || true
        elif command -v npx &> /dev/null; then
            npx oxlint --fix "$filepath" 2>/dev/null || true
            npx eslint --fix "$filepath" 2>/dev/null || true
        fi

    # Format CSS files
    elif [[ "$ext" == "css" ]]; then
        if command -v bunx &> /dev/null; then
            bunx stylelint --fix "$filepath" 2>/dev/null || true
        elif command -v npx &> /dev/null; then
            npx stylelint --fix "$filepath" 2>/dev/null || true
        fi
    fi
done

# Always exit successfully to not block file saves
exit 0
