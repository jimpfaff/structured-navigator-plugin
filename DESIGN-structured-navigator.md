# Structured Navigator for Obsidian

## Project Vision

A next-generation Table of Contents plugin for Obsidian that transforms document outlines into **navigable knowledge maps**. Unlike traditional TOC plugins that merely list headings, Structured Navigator treats your document's heading structure as a framework for organizing both internal content and cross-vault references.

**Working Name:** `obsidian-structured-navigator` (or `obsidian-docmap`)

---

## Core Philosophy

1. **The TOC as a Living Index** — Not just a list of headings, but a structured map that can reference anywhere in your vault
2. **Multiple Perspectives** — Different TOCs can show different slices of the same document
3. **Composability** — TOCs can be scoped, filtered, and enhanced with metadata
4. **Non-Intrusive Syntax** — New features use intuitive markers that don't pollute your markdown

---

## Feature Specification

### 1. Base TOC Generation (Foundation)

Generate a table of contents from the heading structure of the current note.

**Code Block Syntax:**
```
```nav
style: bullet | number | inline
min_depth: 1-6
max_depth: 1-6
title: "## My Contents"
```
```

**Inline Trigger Options:**
- `[NAV]` — Primary trigger (distinct from legacy [TOC])
- `{{nav}}` — Alternative for template systems

**Key Differences from Legacy:**
- Fresh codebase, no inherited technical debt
- Modern Obsidian API usage (TypeScript, proper lifecycle)
- Designed for extension from the start

---

### 2. Cross-Note References (`@` Syntax)

**The Big Idea:** Any heading in your TOC can reference other notes in your vault, creating a structured index that lives within your document.

**Syntax in Your Document:**

```markdown
## Research Topics
### Climate Science @[[Climate Research Notes]]
### Economics @[[Market Analysis 2024]] @[[Federal Reserve Notes]]

## Project Files
### Documentation @[[Project Docs/README]]
```

**How It Works:**
1. Parser detects `@[[NoteName]]` patterns after headings
2. TOC renders the heading with linked note references
3. Optional: Expand to show that note's headings as nested items

**Rendering Options (configurable):**

```
```nav
refs: show | hide | expand
ref_style: inline | nested | badge
```
```

**Visual Output Examples:**

*Inline style:*
```
- Research Topics
  - Climate Science → [[Climate Research Notes]]
  - Economics → [[Market Analysis 2024]], [[Federal Reserve Notes]]
```

*Nested/Expand style:*
```
- Research Topics
  - Climate Science
    - ↳ Climate Research Notes
      - Overview (from linked note)
      - Key Findings (from linked note)
```

---

### 3. Quick Links (`--` Syntax)

**Purpose:** Add arbitrary links under any heading without creating sub-headings in the document itself.

**Syntax in Your Document:**

```markdown
## Meeting Notes
-- [[Action Items from Monday]]
-- [[Budget Spreadsheet]]

### Q1 Review
Content here...
```

**How It Works:**
1. Lines starting with `-- [[` immediately following a heading are collected
2. These appear as children of that heading in the TOC
3. They don't affect the actual document structure

**Rendering:**
```
- Meeting Notes
  - → Action Items from Monday
  - → Budget Spreadsheet
  - Q1 Review
```

**Configuration:**
```
```nav
quick_links: show | hide
quick_link_prefix: "→" | "•" | custom
```
```

---

### 4. Multiple Scoped TOCs

**The Big Idea:** Insert different TOCs at different points in your document, each showing a different slice.

**Scope by Section:**

```
```nav
scope: start_after: "## Introduction" 
       end_before: "## Conclusion"
```
```

**Scope by Depth Range:**

```
```nav
scope: depth: 2-3
title: "### Subsections Only"
```
```

**Scope by Tag/Pattern:**

```
```nav
scope: include_pattern: "Project*"
       exclude_pattern: "*Archive*"
```
```

**Named TOCs for Styling:**

```
```nav
id: main-nav
class: sidebar-toc
```
```

---

### 5. Exclusion Markers

**Purpose:** Exclude specific headings from TOC generation.

**Syntax Options:**

```markdown
## This Appears in TOC

## This is Hidden <!-- nav:ignore -->

## Also Hidden {.nav-ignore}
```

**Alternative — Frontmatter Exclusions:**

```yaml
---
nav_exclude:
  - "Appendix*"
  - "Draft: *"
---
```

---

### 6. TOC Presets

**Purpose:** Define reusable configurations.

**In Plugin Settings:**
```json
{
  "presets": {
    "minimal": {
      "style": "bullet",
      "min_depth": 2,
      "max_depth": 3,
      "refs": "hide"
    },
    "full-index": {
      "style": "number",
      "min_depth": 1,
      "max_depth": 6,
      "refs": "expand",
      "quick_links": "show"
    }
  }
}
```

**Usage:**
```
```nav
preset: full-index
```
```

---

## Technical Architecture

### File Structure

```
obsidian-structured-navigator/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── settings.ts             # Settings tab and management
│   ├── types.ts                # TypeScript interfaces
│   ├── parser/
│   │   ├── heading-parser.ts   # Extract headings from cache
│   │   ├── ref-parser.ts       # Parse @ references
│   │   ├── quicklink-parser.ts # Parse -- quick links
│   │   └── scope-parser.ts     # Handle TOC scoping
│   ├── renderer/
│   │   ├── toc-renderer.ts     # Core rendering logic
│   │   ├── styles.ts           # Style variants
│   │   └── components/
│   │       ├── toc-item.ts     # Individual TOC entry
│   │       └── toc-container.ts
│   ├── commands/
│   │   ├── insert-nav.ts       # Command to insert nav block
│   │   └── refresh-nav.ts      # Manual refresh command
│   └── utils/
│       ├── config-parser.ts    # YAML config parsing
│       └── markdown-utils.ts   # Markdown helpers
├── styles.css
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
└── README.md
```

### Key Classes/Interfaces

```typescript
interface NavConfig {
  style: 'bullet' | 'number' | 'inline';
  min_depth: number;
  max_depth: number;
  title?: string;
  refs: 'show' | 'hide' | 'expand';
  ref_style: 'inline' | 'nested' | 'badge';
  quick_links: 'show' | 'hide';
  quick_link_prefix: string;
  scope?: ScopeConfig;
  id?: string;
  class?: string;
  preset?: string;
}

interface ScopeConfig {
  start_after?: string;
  end_before?: string;
  depth?: [number, number];
  include_pattern?: string;
  exclude_pattern?: string;
}

interface HeadingEntry {
  level: number;
  text: string;
  position: { start: number; end: number };
  refs: NoteRef[];
  quickLinks: NoteRef[];
  excluded: boolean;
}

interface NoteRef {
  path: string;
  display?: string;
  alias?: string;
}

interface ParsedDocument {
  headings: HeadingEntry[];
  frontmatter: Record<string, any>;
}
```

### Data Flow

```
Document Change
      ↓
MetadataCache Event
      ↓
┌─────────────────────┐
│   Heading Parser    │ ← Extract headings from cache
└─────────────────────┘
      ↓
┌─────────────────────┐
│   Ref Parser        │ ← Find @[[]] patterns
└─────────────────────┘
      ↓
┌─────────────────────┐
│   QuickLink Parser  │ ← Find -- [[]] patterns  
└─────────────────────┘
      ↓
┌─────────────────────┐
│   Scope Filter      │ ← Apply scope constraints
└─────────────────────┘
      ↓
┌─────────────────────┐
│   TOC Renderer      │ ← Generate markdown/HTML
└─────────────────────┘
      ↓
MarkdownRenderer.renderMarkdown()
      ↓
DOM Update
```

---

## Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup (TypeScript, esbuild, Obsidian types)
- [ ] Basic heading extraction from MetadataCache
- [ ] Code block processor for ```nav blocks
- [ ] Bullet/number/inline rendering
- [ ] Min/max depth filtering
- [ ] Settings tab with basic options
- [ ] Live update on document changes

### Phase 2: Cross-References
- [ ] @ syntax parser
- [ ] Reference rendering (inline mode)
- [ ] Reference rendering (nested/expand mode)
- [ ] Settings for reference display

### Phase 3: Quick Links
- [ ] -- syntax parser
- [ ] Quick link rendering
- [ ] Quick link prefix customization

### Phase 4: Scoping & Multiple TOCs
- [ ] Scope parser (start/end markers)
- [ ] Depth-based scoping
- [ ] Pattern-based include/exclude
- [ ] Frontmatter exclusion lists
- [ ] Multiple TOC instances per document

### Phase 5: Polish
- [ ] Preset system
- [ ] Inline trigger support ([NAV])
- [ ] Custom CSS classes/IDs
- [ ] Command palette integration
- [ ] Documentation
- [ ] Performance optimization

---

## Configuration Defaults

```typescript
const DEFAULT_SETTINGS: NavConfig = {
  style: 'bullet',
  min_depth: 2,
  max_depth: 6,
  title: '',
  refs: 'show',
  ref_style: 'inline',
  quick_links: 'show',
  quick_link_prefix: '→',
  presets: {}
};
```

---

## Example Usage Scenarios

### Scenario 1: Simple Document TOC

```markdown
# My Document

```nav
title: "## Contents"
style: bullet
```

## Introduction
Content...

## Main Section
Content...

### Subsection A
Content...
```

### Scenario 2: Research Index with References

```markdown
# Research Compilation

```nav
refs: expand
```

## Primary Sources @[[Source Analysis]]
### Government Reports @[[Census Data 2024]] @[[Fed Minutes]]
### Academic Papers @[[Literature Review]]

## Secondary Analysis
### Market Trends
Content...
```

### Scenario 3: Project Documentation with Quick Links

```markdown
# Project Alpha

```nav
quick_links: show
```

## Architecture
-- [[System Diagram]]
-- [[API Reference]]

### Backend Components
Content...

### Frontend Components
Content...

## Deployment
-- [[AWS Setup Guide]]
-- [[CI/CD Pipeline]]

### Production
Content...
```

### Scenario 4: Multiple Scoped TOCs

```markdown
# Long Document

## Part 1: Theory

```nav
id: theory-nav
scope: 
  start_after: "## Part 1: Theory"
  end_before: "## Part 2: Practice"
title: "### Theory Sections"
```

### Chapter 1
### Chapter 2
### Chapter 3

## Part 2: Practice

```nav
id: practice-nav
scope:
  start_after: "## Part 2: Practice"
  end_before: "## Appendix"
title: "### Practice Sections"
```

### Exercise 1
### Exercise 2

## Appendix
```

---

## Differentiation from Dynamic TOC

| Feature | Dynamic TOC | Structured Navigator |
|---------|-------------|---------------------|
| Basic TOC | ✓ | ✓ |
| Cross-note references | ✗ | ✓ (@ syntax) |
| Quick links | ✗ | ✓ (-- syntax) |
| Multiple scoped TOCs | ✗ | ✓ |
| Heading exclusions | ✗ | ✓ |
| Presets | ✗ | ✓ |
| Reference expansion | ✗ | ✓ |
| Pattern filtering | ✗ | ✓ |
| Modern architecture | Limited | TypeScript, modular |

---

## Open Questions for Development

1. **Expand Mode Depth** — When expanding referenced notes, how many heading levels to show?
2. **Circular Reference Handling** — What if Note A references Note B which references Note A?
3. **Performance** — Cache parsed results? Debounce updates?
4. **Mobile Compatibility** — Test on Obsidian Mobile
5. **Reading Mode vs Edit Mode** — Ensure both work correctly
6. **Sync with Heading Changes** — Auto-update @ refs if headings change?

---

## Getting Started with Claude Code

To begin implementation:

```bash
# Create project structure
mkdir obsidian-structured-navigator
cd obsidian-structured-navigator

# Initialize
npm init -y
npm install -D typescript esbuild @types/node obsidian

# Create tsconfig
# Create esbuild config
# Start with src/main.ts
```

**First Task:** Implement Phase 1 - the basic heading-to-TOC pipeline without any of the advanced features. Get a working plugin that can parse headings and render a simple TOC.

---

## Notes

- All syntax choices (```nav, @, --) are intentionally distinct from the original plugin
- Architecture is designed for extensibility
- TypeScript ensures type safety and better IDE support
- Modular design allows features to be developed independently
