# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Structured Navigator** (`obsidian-structured-navigator`) is an Obsidian plugin for generating dynamic tables of contents with cross-note references and scoped views.

See `DESIGN-structured-navigator.md` for full feature specification and architecture details.

## Build Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run dev

# Production build
npm run build
```

## Development Setup

1. Symlink plugin to Obsidian vault for testing:
   ```bash
   # Windows (run as admin)
   mklink /D "C:\path\to\vault\.obsidian\plugins\obsidian-structured-navigator" "C:\GitHub\toc-obsidian"

   # macOS/Linux
   ln -s /path/to/project /path/to/vault/.obsidian/plugins/obsidian-structured-navigator
   ```

2. Run `npm run dev` for watch mode
3. Enable "Structured Navigator" in Obsidian Settings → Community Plugins
4. Use Ctrl+P → "Reload app without saving" after changes

## Architecture

```
src/
├── main.ts          # Plugin entry: onload/onunload, code block processor
├── settings.ts      # PluginSettingTab for user preferences
├── types.ts         # TypeScript interfaces (NavSettings, HeadingItem)
├── parser.ts        # Extracts headings from app.metadataCache
└── renderer.ts      # Generates TOC markdown from parsed headings
```

**Data Flow:**
Document → MetadataCache → parser.ts (extract headings) → renderer.ts (generate TOC) → MarkdownRenderer

**Key Obsidian APIs:**
- `app.metadataCache.getCache(filePath).headings` — heading extraction
- `registerMarkdownCodeBlockProcessor('nav', ...)` — code block handler
- `parseYaml()` — parse nav block configuration
- `MarkdownRenderChild` — lifecycle management for rendered TOCs

## Implementation Phases

Focus on Phase 1 first:
1. **Phase 1:** Basic TOC (headings, bullet/number/inline styles, depth filtering)
2. **Phase 2:** `@[[Note]]` cross-references
3. **Phase 3:** `-- [[Note]]` quick links
4. **Phase 4:** Scoping (start_after, end_before, patterns)
5. **Phase 5:** Presets, [NAV] inline trigger

## Obsidian Plugin Requirements

For community submission:
- `manifest.json` — plugin metadata (keep version synced with package.json)
- `main.js` — compiled bundle (esbuild output)
- `styles.css` — optional styling
- `README.md` — user documentation

## Testing Notes

- Test in both Reading Mode and Live Preview
- Register `metadataCache.on('changed', ...)` for live TOC updates
- Verify settings persist across Obsidian restarts
