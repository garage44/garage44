# Expressio Feature Roadmap
## Making Expressio a Competitive i18n Solution

This roadmap outlines features needed to make Expressio competitive with commercial i18n tools like Lokalise, Crowdin, and POEditor.

---

## ✅ Phase 1: Foundation (COMPLETED)

### Core Translation Workflow
- ✅ Individual tag translation
- ✅ Group/batch translation
- ✅ Real-time WebSocket synchronization
- ✅ Undo/redo history
- ✅ Code sync with linting
- ✅ Multiple translation engines (Anthropic, DeepL)

### CLI Tools
- ✅ Import from i18next format
- ✅ Export to i18next format
- ✅ Lint command for validation
- ✅ Bulk translate-all command
- ✅ Statistics with progress visualization
- ✅ Enhanced export with splitting

### UI/UX
- ✅ Hierarchical group/tag organization
- ✅ Search and filter
- ✅ Collapse/expand groups
- ✅ Error notifications
- ✅ Success feedback

---

## 🎯 Phase 2: Essential i18n Features (HIGH PRIORITY)

### 1. Pluralization Support 🔴
**Why Critical:** Most apps need plural forms (0 items, 1 item, N items)

**Implementation:**
```typescript
// Data structure
interface PluralTag {
    source: {
        zero?: string
        one: string
        two?: string
        few?: string
        many?: string
        other: string
    }
    target: Record<string, typeof source>
    type: 'plural'
}

// UI: Show multiple input fields for plural forms
// Different languages have different plural rules
```

**UI Mockup:**
```
Tag: cart.items
Type: [Plural Form ▼]

English Source:
  zero:  "No items"
  one:   "1 item"
  other: "{count} items"

French Translation:
  one:   "1 article"
  other: "{count} articles"
```

**Effort:** 2-3 weeks
**Impact:** Essential for e-commerce, social media, any counting

---

### 2. Variable/Interpolation Detection 🔴
**Why Critical:** Broken variables = broken app

**Features:**
- Parse source for `{var}`, `{{var}}`, `%s`, etc.
- Validate all translations have same variables
- Lint errors for mismatches
- Syntax highlighting in UI

**Implementation:**
```typescript
interface TranslationTag {
    source: string
    variables: string[]  // Extracted: ['count', 'name']
    // ...
}

function extractVariables(text: string): string[] {
    return [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1])
}

function validateTranslation(source: string, target: string): string[] {
    const sourceVars = new Set(extractVariables(source))
    const targetVars = new Set(extractVariables(target))
    
    const missing = [...sourceVars].filter(v => !targetVars.has(v))
    const extra = [...targetVars].filter(v => !sourceVars.has(v))
    
    return [...missing.map(v => `Missing: {${v}}`), 
            ...extra.map(v => `Extra: {${v}}`)]
}
```

**UI Indicator:**
```
✅ welcome.message: "Hello {name}!" → "Bonjour {name}!"
⚠️ welcome.greeting: "Hi {name}!" → "Salut!" (missing {name})
❌ goodbye.message: "Bye {name}!" → "Au revoir {user}!" (wrong variable)
```

**Effort:** 1 week
**Impact:** Prevents production bugs

---

### 3. Context & Notes for Translators 🔴
**Why Critical:** Translators need context for quality

**Data Structure:**
```typescript
interface TranslationTag {
    source: string
    context?: string  // "Button label in checkout flow"
    notes?: string    // "Keep it short, max 20 chars"
    screenshot?: string  // URL or base64
    maxLength?: number
    tags?: string[]  // ['button', 'urgent', 'legal']
    // ...
}
```

**UI:**
```
┌─────────────────────────────────────┐
│ Tag: checkout.confirm               │
├─────────────────────────────────────┤
│ Source: "Confirm Purchase"          │
│                                     │
│ Context: Button label in checkout   │
│          flow, appears after review │
│                                     │
│ Notes: Keep under 20 characters     │
│                                     │
│ [📷 View Screenshot]                │
│                                     │
│ Max Length: 20 chars                │
│ Tags: [button] [checkout]           │
└─────────────────────────────────────┘
```

**Effort:** 1-2 weeks
**Impact:** Dramatically improves translation quality

---

### 4. Translation States & Review Workflow 🔴
**Why Critical:** Teams need approval process

**States:**
```typescript
type TranslationState = 
    | 'empty'      // Not translated yet
    | 'draft'      // Auto-translated, needs review
    | 'review'     // Submitted for review
    | 'approved'   // Reviewed and approved
    | 'outdated'   // Source changed after approval

interface TranslationValue {
    text: string
    state: TranslationState
    translatedBy?: string
    translatedAt?: number
    reviewedBy?: string
    reviewedAt?: number
    comments?: Comment[]
}
```

**Workflow:**
```
[Empty] → [AI Translate] → [Draft]
[Draft] → [Manual Edit] → [Draft]
[Draft] → [Submit Review] → [Review]
[Review] → [Approve] → [Approved]
[Review] → [Reject] → [Draft]
[Approved] → [Source Changed] → [Outdated]
```

**UI Indicators:**
```
🟦 Empty (0/3 languages)
🟨 Draft (AI translated, needs review)
🟧 Review (waiting for approval)
🟩 Approved (ready for production)
🟥 Outdated (source changed)
```

**Effort:** 2-3 weeks
**Impact:** Essential for professional teams

---

### 5. Translation Memory 🟡
**Why Important:** Reuse translations, maintain consistency

**Architecture:**
```typescript
// Global translation cache
interface TranslationMemory {
    id: string
    sourceText: string
    sourceHash: string
    translations: {
        languageId: string
        text: string
        quality: number  // 0-100 confidence
    }[]
    usageCount: number
    lastUsedAt: number
    createdAt: number
}

// Search by similarity
function findSimilar(sourceText: string, threshold = 0.8): TranslationMemory[] {
    // Use fuzzy matching or embeddings
}
```

**UI Feature:**
```
┌──────────────────────────────────────┐
│ Source: "Save changes"               │
├──────────────────────────────────────┤
│ 💡 Similar translations found:       │
│                                      │
│ "Save changes?" (95% match)          │
│   FR: "Enregistrer les modifications│
│       ?                              │
│   Used 12 times                      │
│   [Use This]                         │
│                                      │
│ "Save" (70% match)                   │
│   FR: "Enregistrer"                  │
│   Used 45 times                      │
│   [Use This]                         │
└──────────────────────────────────────┘
```

**Effort:** 3-4 weeks
**Impact:** Saves translation costs, ensures consistency

---

## 🚀 Phase 3: Power User Features (MEDIUM PRIORITY)

### 6. Search & Replace 🟡
```typescript
interface SearchReplace {
    find: string | RegExp
    replace: string
    scope: 'source' | 'target' | 'all'
    languages?: string[]
    preview: boolean
}
```

**UI:**
```
┌───────────────────────────────────────┐
│ Find:    [user               ]        │
│ Replace: [customer           ]        │
│                                       │
│ Scope:   ◉ Source  ◯ Translations    │
│          ◯ All                        │
│                                       │
│ Languages: [All ▼] [French] [German] │
│                                       │
│ ☑ Case sensitive                     │
│ ☑ Regex mode                         │
│                                       │
│ [Preview Changes]  [Replace All]     │
└───────────────────────────────────────┘

Preview (15 matches):
✓ user.profile → customer.profile
✓ user.settings → customer.settings
...
```

**Effort:** 1 week

---

### 7. Batch Operations UI 🟡
**Select Multiple Tags:**
- Shift+Click for range
- Ctrl+Click for individual
- Select all in group

**Batch Actions:**
```
┌─────────────────────────────────────┐
│ 15 tags selected                    │
│                                     │
│ [Translate] [Delete] [Export]      │
│ [Approve] [Mark Draft] [Add Tags]  │
│                                     │
│ Change State: [Draft ▼]            │
│ Add Tag: [urgent]                  │
│ Assign To: [translator@example]    │
└─────────────────────────────────────┘
```

**Effort:** 1-2 weeks

---

### 8. Quality Scoring 🟡
**Automatic Checks:**
```typescript
interface QualityCheck {
    type: 'length' | 'capitalization' | 'punctuation' | 'variables'
    severity: 'error' | 'warning' | 'info'
    message: string
}

function checkQuality(source: string, target: string): QualityCheck[] {
    const checks: QualityCheck[] = []
    
    // Length mismatch (>50% difference)
    if (Math.abs(target.length - source.length) / source.length > 0.5) {
        checks.push({
            type: 'length',
            severity: 'warning',
            message: `Length differs significantly (${source.length} → ${target.length})`
        })
    }
    
    // Capitalization
    if (source[0] === source[0].toUpperCase() && 
        target[0] === target[0].toLowerCase()) {
        checks.push({
            type: 'capitalization',
            severity: 'warning',
            message: 'Source is capitalized but target is not'
        })
    }
    
    // Punctuation
    if (source.endsWith('.') && !target.endsWith('.')) {
        checks.push({
            type: 'punctuation',
            severity: 'warning',
            message: 'Source ends with period but target does not'
        })
    }
    
    return checks
}
```

**UI:**
```
Tag: error.message
✅ Variables match
⚠️ Length: 45 chars → 89 chars (+98%)
⚠️ Missing punctuation at end
ℹ️ Consider reviewing for brevity
Quality Score: 75/100
```

**Effort:** 1-2 weeks

---

### 9. Advanced Export Formats 🟡
**Formats to Support:**

1. **Android XML**
```xml
<resources>
    <string name="welcome">Welcome</string>
    <string name="goodbye">Goodbye</string>
</resources>
```

2. **iOS Strings**
```
"welcome" = "Welcome";
"goodbye" = "Goodbye";
```

3. **XLIFF (for external services)**
```xml
<xliff version="1.2">
    <file source-language="en" target-language="fr">
        <trans-unit id="welcome">
            <source>Welcome</source>
            <target>Bienvenue</target>
        </trans-unit>
    </file>
</xliff>
```

4. **CSV (for spreadsheets)**
```csv
Key,English,French,German
welcome,Welcome,Bienvenue,Willkommen
goodbye,Goodbye,Au revoir,Auf Wiedersehen
```

**Effort:** 1 week per format

---

### 10. Dashboard & Analytics 🟡
**Metrics to Track:**
```typescript
interface ProjectStats {
    translations: {
        total: number
        byLanguage: Record<string, {
            translated: number
            approved: number
            draft: number
            outdated: number
        }>
    }
    activity: {
        translationsToday: number
        translationsThisWeek: number
        topContributors: {user: string, count: number}[]
    }
    costs: {
        apiCallsThisMonth: number
        estimatedCost: number
        byEngine: Record<string, number>
    }
    progress: {
        date: string
        completionRate: number
    }[]
}
```

**Dashboard UI:**
```
┌─────────────────────────────────────────────┐
│ 📊 Project: MyApp                           │
├─────────────────────────────────────────────┤
│ Overall Progress:  85% Complete             │
│ ████████████████████████░░░░░░░░            │
│                                             │
│ Languages:                                  │
│ 🇫🇷 French:   98% ████████████████████░     │
│ 🇩🇪 German:   87% ██████████████████░░░     │
│ 🇪🇸 Spanish:  72% ███████████████░░░░░░     │
│                                             │
│ This Week:                                  │
│ • 45 translations added                     │
│ • 12 tags approved                          │
│ • 3 tags need review                        │
│                                             │
│ API Usage:                                  │
│ • 1,234 calls this month                    │
│ • ~$15.50 estimated cost                    │
│                                             │
│ Top Contributors:                           │
│ 1. alice@example (45 translations)          │
│ 2. bob@example (32 translations)            │
│ 3. AI Translator (234 translations)         │
└─────────────────────────────────────────────┘
```

**Effort:** 2-3 weeks

---

## 🌟 Phase 4: Enterprise Features (LOW PRIORITY)

### 11. Multi-User Collaboration
- User roles: Admin, Translator, Reviewer
- Permissions per language
- Activity feed
- @mentions in comments
- Real-time cursor position
- Conflict resolution

**Effort:** 4-6 weeks

---

### 12. Version Control Integration
- Auto-commit on save
- Git diff view
- Branch management
- Revert to specific version
- Blame view

**Effort:** 2-3 weeks

---

### 13. Plugin System
```typescript
interface ExpressioPlugin {
    name: string
    version: string
    
    hooks?: {
        beforeTranslate?: (tag: Tag) => Tag | Promise<Tag>
        afterTranslate?: (tag: Tag, result: string) => string
        validateTranslation?: (source: string, target: string) => ValidationResult
        onSave?: (workspace: Workspace) => void
    }
    
    commands?: {
        name: string
        handler: () => void
    }[]
    
    ui?: {
        panels?: ComponentType[]
        menuItems?: MenuItem[]
    }
}
```

**Example Plugin:**
```typescript
// Custom validation plugin
export default {
    name: 'brand-terms',
    version: '1.0.0',
    
    hooks: {
        validateTranslation(source, target) {
            const brandTerms = ['MyApp', 'MyFeature']
            const errors = []
            
            for (const term of brandTerms) {
                if (source.includes(term) && !target.includes(term)) {
                    errors.push({
                        type: 'error',
                        message: `Brand term "${term}" should not be translated`
                    })
                }
            }
            
            return errors
        }
    }
}
```

**Effort:** 3-4 weeks

---

### 14. Custom Translation Engines
```typescript
interface TranslationEngine {
    name: string
    translate(text: string, targetLang: string): Promise<string>
    translateBatch(texts: string[], targetLang: string): Promise<string[]>
    getSupportedLanguages(): Promise<string[]>
}

// Example: Azure Translator
class AzureTranslator implements TranslationEngine {
    async translate(text: string, targetLang: string): Promise<string> {
        // Implementation
    }
}
```

**Effort:** 1 week per engine

---

## 📊 Feature Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Pluralization | 🔴 High | Medium | **P0** | 2 |
| Variable Detection | 🔴 High | Low | **P0** | 2 |
| Context & Notes | 🔴 High | Medium | **P0** | 2 |
| Review Workflow | 🔴 High | High | **P1** | 2 |
| Translation Memory | 🟡 Medium | High | **P1** | 2 |
| Search & Replace | 🟡 Medium | Low | **P2** | 3 |
| Batch Operations | 🟡 Medium | Medium | **P2** | 3 |
| Quality Scoring | 🟡 Medium | Medium | **P2** | 3 |
| Export Formats | 🟡 Medium | Medium | **P2** | 3 |
| Dashboard | 🟡 Medium | High | **P3** | 3 |
| Multi-User | 🟢 Low | High | **P4** | 4 |
| Git Integration | 🟢 Low | Medium | **P4** | 4 |
| Plugins | 🟢 Low | High | **P4** | 4 |
| Custom Engines | 🟢 Low | Low | **P4** | 4 |

---

## 🎯 Recommended Next Steps

### Immediate (Next 1-2 Sprints)
1. **Pluralization Support** - Most requested, blocks many users
2. **Variable Detection** - Quick win, prevents bugs
3. **Context & Notes** - Dramatically improves quality

### Short-term (1-3 Months)
4. **Review Workflow** - Essential for teams
5. **Translation Memory** - Cost savings, consistency
6. **Search & Replace** - High ROI for effort

### Medium-term (3-6 Months)
7. **Batch Operations UI**
8. **Quality Scoring**
9. **Advanced Export Formats**
10. **Dashboard**

### Long-term (6+ Months)
11. Multi-user collaboration
12. Version control integration
13. Plugin system
14. Custom engines

---

## 🏆 Success Metrics

### Feature Adoption
- % of projects using pluralization
- % of tags with context/notes
- Review workflow usage
- Translation memory hit rate

### Quality Improvements
- Average quality score
- Decrease in variable errors
- Decrease in outdated translations
- User satisfaction scores

### Efficiency Gains
- Translation cost reduction
- Time saved via translation memory
- Faster translation throughput
- Lower error rates

---

## 📝 Notes for Implementation

### Architecture Patterns
1. Use TypeScript discriminated unions for different tag types
2. Event-driven for real-time updates
3. Plugin hooks before/after operations
4. Immutable history for undo/redo

### Database Schema
Consider migrating to proper database (SQLite/PostgreSQL):
```sql
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    source TEXT NOT NULL,
    type TEXT DEFAULT 'simple',  -- 'simple' | 'plural'
    context TEXT,
    notes TEXT,
    max_length INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE translations (
    tag_id TEXT,
    language_id TEXT,
    text TEXT,
    state TEXT DEFAULT 'empty',
    quality_score INTEGER,
    translated_by TEXT,
    translated_at INTEGER,
    reviewed_by TEXT,
    reviewed_at INTEGER,
    PRIMARY KEY (tag_id, language_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE TABLE translation_memory (
    id TEXT PRIMARY KEY,
    source_text TEXT NOT NULL,
    source_hash TEXT NOT NULL,
    language_id TEXT NOT NULL,
    target_text TEXT NOT NULL,
    quality INTEGER,
    usage_count INTEGER DEFAULT 0,
    created_at INTEGER
);

CREATE INDEX idx_tm_hash ON translation_memory(source_hash);
```

### Testing Strategy
1. Unit tests for all new features
2. Integration tests for workflows
3. E2E tests for critical paths
4. Performance tests for large datasets
5. Load tests for WebSocket sync

---

**Total Estimated Effort:**
- Phase 2: 9-13 weeks
- Phase 3: 8-12 weeks  
- Phase 4: 10-15 weeks

**Competitive Position After Phase 2:**
Expressio would be feature-competitive with Lokalise, Crowdin, and POEditor for small-medium teams, with advantages in:
- Open source
- Self-hosted
- AI-powered translation
- Real-time sync with codebase
- CLI-first workflow
