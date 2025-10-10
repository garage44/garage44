#!/usr/bin/env python3
import os
import re
from pathlib import Path

COMPONENTS_DIR = Path("/home/deck/code/expressio/packages/pyrite/src/components")

# Define replacement patterns
REPLACEMENTS = [
    # Import fixes
    (r"from '@/lib/main\.js'", "from '@/app'"),
    (r"from '@/lib/main'", "from '@/app'"),
    (r"import \{app\}", "import {$s, notifier}"),
    
    # Add necessary imports where $s, notifier are used
    (r"^import \{([^}]+)\} from '@/app'$", lambda m: f"import {{{m.group(1)}, $s, notifier, api, logger}} from '@/app'" if '$s' not in m.group(1) else m.group(0)),
    
    # Vue to Preact
    (r"from 'vue'", "from 'preact'"),
    (r"from 'vue-router'", "from 'preact-router'"),
    
    # App references
    (r"\bapp\.\$s\b", "$s"),
    (r"\bapp\.notifier\b", "notifier"),
    (r"\bapp\.\$t\b", "$t"),
    (r"\bapp\.api\b", "api"),
    (r"\bapp\.logger\b", "logger"),
    
    # Common hook renames
    (r", ref,", ", useRef,"),
    (r", reactive,", ","),
    (r", watch,", ","),
    (r"import \{defineComponent", "import {h"),
]

def process_file(filepath):
    """Process a single TypeScript/TSX file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Apply replacements
        for pattern, replacement in REPLACEMENTS:
            if callable(replacement):
                content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
            else:
                content = content.replace(pattern.replace('\\b', '').replace('\\', ''), replacement)
        
        # Write if changed
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process all TSX files in components directory"""
    count = 0
    for tsx_file in COMPONENTS_DIR.rglob("*.tsx"):
        if process_file(tsx_file):
            count += 1
            print(f"✓ {tsx_file.relative_to(COMPONENTS_DIR)}")
    
    print(f"\n{count} files updated")

if __name__ == "__main__":
    main()

