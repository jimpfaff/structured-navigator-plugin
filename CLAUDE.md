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

**Test Vault:** `C:\GitHub\Obsidian-git-sync`
**Plugin Location:** `C:\GitHub\Obsidian-git-sync\.obsidian\plugins\structured-navigator`

1. Create symlink from vault to dev folder (run as admin):
   ```powershell
   # Remove existing folder if present
   Remove-Item 'C:\GitHub\Obsidian-git-sync\.obsidian\plugins\structured-navigator' -Recurse -ErrorAction SilentlyContinue

   # Create junction (symlink)
   New-Item -ItemType Junction -Path 'C:\GitHub\Obsidian-git-sync\.obsidian\plugins\structured-navigator' -Target 'C:\GitHub\toc-obsidian'
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

## TODO: Obsidian 1.11 SettingGroup API

Obsidian 1.11.0 announced a new `SettingGroup` API for organizing plugin settings into grouped cards with headers. As of December 2025, the API types have not been published to npm (still at 1.10.3).

**Current workaround:** We manually create a `setting-item-group` div in `settings.ts` and style it with hardcoded colors in `styles.css` (`#444444` dark, `#e8e8e8` light).

**When the API is available:**
1. Run `npm update obsidian` to get the new types
2. Check for `SettingGroup` class in `obsidian.d.ts`
3. Refactor `settings.ts` to use the official API
4. Remove hardcoded colors from `styles.css` in favor of native styling

**Resources to monitor:**
- https://github.com/obsidianmd/obsidian-api (for updated `obsidian.d.ts`)
- https://docs.obsidian.md/Plugins/User+interface/Settings (for official documentation)
- https://obsidian.md/changelog/ (for release notes)
