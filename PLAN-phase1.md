# Phase 1 Implementation Plan

## Goal

Create a working Obsidian plugin that renders a basic table of contents from document headings using the ` ```nav ` code block syntax.

---

## Step 1: Project Scaffolding

Create the minimal files needed for an Obsidian plugin to load.

### Files to Create

**package.json**
```json
{
  "name": "obsidian-structured-navigator",
  "version": "0.1.0",
  "description": "Dynamic table of contents with cross-note references",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "builtin-modules": "^3.3.0",
    "esbuild": "^0.19.8",
    "obsidian": "^1.4.11",
    "typescript": "^5.3.2"
  }
}
```

**manifest.json**
```json
{
  "id": "structured-navigator",
  "name": "Structured Navigator",
  "version": "0.1.0",
  "minAppVersion": "1.0.0",
  "description": "Dynamic table of contents with cross-note references and scoped views",
  "author": "",
  "isDesktopOnly": false
}
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES2018",
    "allowJs": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strict": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "lib": ["DOM", "ES2018"]
  },
  "include": ["src/**/*.ts"]
}
```

**esbuild.config.mjs**
```javascript
import esbuild from 'esbuild';
import process from 'process';
import builtins from 'builtin-modules';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron', ...builtins],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
```

**styles.css** (empty initially)
```css
/* Structured Navigator styles */
```

### Verification
- [ ] Run `npm install` completes without errors
- [ ] Run `npm run build` produces `main.js`

---

## Step 2: Plugin Entry Point

Create minimal plugin that loads in Obsidian.

**src/main.ts**
```typescript
import { Plugin } from 'obsidian';

export default class StructuredNavigatorPlugin extends Plugin {
  async onload() {
    console.log('Structured Navigator loaded');
  }

  onunload() {
    console.log('Structured Navigator unloaded');
  }
}
```

### Verification
- [ ] Plugin appears in Obsidian Settings → Community Plugins
- [ ] Console shows "Structured Navigator loaded" on enable
- [ ] Console shows "Structured Navigator unloaded" on disable

---

## Step 3: Types Definition

Define TypeScript interfaces for settings and data structures.

**src/types.ts**
```typescript
export interface NavSettings {
  style: 'bullet' | 'number' | 'inline';
  min_depth: number;
  max_depth: number;
  title: string;
  delimiter: string;
}

export interface NavBlockConfig extends Partial<NavSettings> {
  // Per-block overrides
}

export interface HeadingItem {
  level: number;
  heading: string;
  position: number;
}

export const DEFAULT_SETTINGS: NavSettings = {
  style: 'bullet',
  min_depth: 1,
  max_depth: 6,
  title: '',
  delimiter: ' | '
};
```

---

## Step 4: Settings Tab

Add settings UI for default configuration.

**src/settings.ts**
```typescript
import { App, PluginSettingTab, Setting } from 'obsidian';
import type StructuredNavigatorPlugin from './main';
import { NavSettings } from './types';

export class SettingsTab extends PluginSettingTab {
  plugin: StructuredNavigatorPlugin;

  constructor(app: App, plugin: StructuredNavigatorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Default style')
      .setDesc('How to render the table of contents')
      .addDropdown(dropdown => dropdown
        .addOption('bullet', 'Bullet list')
        .addOption('number', 'Numbered list')
        .addOption('inline', 'Inline (single line)')
        .setValue(this.plugin.settings.style)
        .onChange(async (value) => {
          this.plugin.settings.style = value as NavSettings['style'];
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Minimum heading depth')
      .setDesc('Smallest heading level to include (1 = H1)')
      .addSlider(slider => slider
        .setLimits(1, 6, 1)
        .setValue(this.plugin.settings.min_depth)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.min_depth = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Maximum heading depth')
      .setDesc('Largest heading level to include (6 = H6)')
      .addSlider(slider => slider
        .setLimits(1, 6, 1)
        .setValue(this.plugin.settings.max_depth)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.max_depth = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Inline delimiter')
      .setDesc('Separator for inline style (e.g., " | " or " • ")')
      .addText(text => text
        .setValue(this.plugin.settings.delimiter)
        .onChange(async (value) => {
          this.plugin.settings.delimiter = value;
          await this.plugin.saveSettings();
        }));
  }
}
```

Update **src/main.ts** to include settings:
```typescript
import { Plugin } from 'obsidian';
import { NavSettings, DEFAULT_SETTINGS } from './types';
import { SettingsTab } from './settings';

export default class StructuredNavigatorPlugin extends Plugin {
  settings: NavSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

### Verification
- [ ] Settings tab appears in Obsidian Settings
- [ ] All dropdowns and sliders work
- [ ] Settings persist after Obsidian restart

---

## Step 5: Heading Parser

Extract headings from the current document using MetadataCache.

**src/parser.ts**
```typescript
import { App, CachedMetadata } from 'obsidian';
import { HeadingItem } from './types';

export function parseHeadings(cache: CachedMetadata | null): HeadingItem[] {
  if (!cache?.headings) {
    return [];
  }

  return cache.headings.map(h => ({
    level: h.level,
    heading: h.heading,
    position: h.position.start.offset
  }));
}

export function filterHeadings(
  headings: HeadingItem[],
  minDepth: number,
  maxDepth: number
): HeadingItem[] {
  return headings.filter(h => h.level >= minDepth && h.level <= maxDepth);
}
```

---

## Step 6: TOC Renderer

Generate the TOC output as HTML elements.

**src/renderer.ts**
```typescript
import { HeadingItem, NavSettings } from './types';

export function renderTOC(
  headings: HeadingItem[],
  config: NavSettings,
  containerEl: HTMLElement
): void {
  containerEl.empty();
  containerEl.addClass('structured-nav');

  if (headings.length === 0) {
    containerEl.createEl('p', {
      text: 'No headings found',
      cls: 'structured-nav-empty'
    });
    return;
  }

  // Add title if specified
  if (config.title) {
    containerEl.createEl('div', {
      text: config.title,
      cls: 'structured-nav-title'
    });
  }

  if (config.style === 'inline') {
    renderInline(headings, config, containerEl);
  } else {
    renderList(headings, config, containerEl);
  }
}

function renderList(
  headings: HeadingItem[],
  config: NavSettings,
  containerEl: HTMLElement
): void {
  const listTag = config.style === 'number' ? 'ol' : 'ul';
  const minLevel = Math.min(...headings.map(h => h.level));

  // Build nested list structure
  const rootList = containerEl.createEl(listTag, { cls: 'structured-nav-list' });
  const listStack: HTMLElement[] = [rootList];
  let currentLevel = minLevel;

  for (const heading of headings) {
    const relativeLevel = heading.level - minLevel;

    // Adjust nesting
    while (relativeLevel > listStack.length - 1) {
      const newList = listStack[listStack.length - 1].createEl(listTag);
      listStack.push(newList);
    }
    while (relativeLevel < listStack.length - 1) {
      listStack.pop();
    }

    const li = listStack[listStack.length - 1].createEl('li');
    const link = li.createEl('a', {
      text: heading.heading,
      cls: 'structured-nav-link',
      href: `#${encodeURIComponent(heading.heading)}`
    });
    link.dataset.heading = heading.heading;
  }
}

function renderInline(
  headings: HeadingItem[],
  config: NavSettings,
  containerEl: HTMLElement
): void {
  const minLevel = Math.min(...headings.map(h => h.level));
  const topLevel = headings.filter(h => h.level === minLevel);

  const inlineEl = containerEl.createEl('div', { cls: 'structured-nav-inline' });

  topLevel.forEach((heading, index) => {
    if (index > 0) {
      inlineEl.createSpan({ text: config.delimiter });
    }
    const link = inlineEl.createEl('a', {
      text: heading.heading,
      cls: 'structured-nav-link',
      href: `#${encodeURIComponent(heading.heading)}`
    });
    link.dataset.heading = heading.heading;
  });
}
```

---

## Step 7: Code Block Processor

Register the ` ```nav ` code block handler and wire everything together.

Update **src/main.ts**:
```typescript
import { Plugin, MarkdownPostProcessorContext, parseYaml } from 'obsidian';
import { NavSettings, NavBlockConfig, DEFAULT_SETTINGS } from './types';
import { SettingsTab } from './settings';
import { parseHeadings, filterHeadings } from './parser';
import { renderTOC } from './renderer';

export default class StructuredNavigatorPlugin extends Plugin {
  settings: NavSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));

    // Register code block processor
    this.registerMarkdownCodeBlockProcessor('nav', this.processNavBlock.bind(this));
  }

  async processNavBlock(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) {
    // Parse YAML config from code block
    let blockConfig: NavBlockConfig = {};
    if (source.trim()) {
      try {
        blockConfig = parseYaml(source) || {};
      } catch (e) {
        el.createEl('p', { text: `Error parsing nav config: ${e}`, cls: 'structured-nav-error' });
        return;
      }
    }

    // Merge block config with plugin defaults
    const config: NavSettings = {
      ...this.settings,
      ...blockConfig
    };

    // Get file path from context
    const filePath = ctx.sourcePath;
    const cache = this.app.metadataCache.getCache(filePath);

    // Parse and filter headings
    const allHeadings = parseHeadings(cache);
    const filteredHeadings = filterHeadings(allHeadings, config.min_depth, config.max_depth);

    // Render TOC
    renderTOC(filteredHeadings, config, el);

    // Set up click handlers for heading links
    el.querySelectorAll('.structured-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const heading = (link as HTMLElement).dataset.heading;
        if (heading) {
          // Scroll to heading
          const view = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
          if (view) {
            const editor = view.editor;
            const headingCache = cache?.headings?.find(h => h.heading === heading);
            if (headingCache) {
              editor.setCursor({ line: headingCache.position.start.line, ch: 0 });
              editor.scrollIntoView({ from: editor.getCursor(), to: editor.getCursor() }, true);
            }
          }
        }
      });
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

### Verification
- [ ] ` ```nav ``` ` code block renders TOC
- [ ] ` ```nav\nstyle: number\n``` ` renders numbered list
- [ ] ` ```nav\nstyle: inline\n``` ` renders inline
- [ ] ` ```nav\nmin_depth: 2\nmax_depth: 3\n``` ` filters correctly
- [ ] ` ```nav\ntitle: Contents\n``` ` shows title
- [ ] Clicking a TOC item scrolls to heading

---

## Step 8: Live Updates

Make the TOC update when document headings change.

This requires using `MarkdownRenderChild` for lifecycle management. Update the code block processor:

**src/nav-component.ts** (new file)
```typescript
import { MarkdownRenderChild, MarkdownPostProcessorContext } from 'obsidian';
import type StructuredNavigatorPlugin from './main';
import { NavSettings } from './types';
import { parseHeadings, filterHeadings } from './parser';
import { renderTOC } from './renderer';

export class NavComponent extends MarkdownRenderChild {
  plugin: StructuredNavigatorPlugin;
  config: NavSettings;
  sourcePath: string;

  constructor(
    containerEl: HTMLElement,
    plugin: StructuredNavigatorPlugin,
    config: NavSettings,
    sourcePath: string
  ) {
    super(containerEl);
    this.plugin = plugin;
    this.config = config;
    this.sourcePath = sourcePath;
  }

  onload() {
    this.render();

    // Listen for metadata changes
    this.registerEvent(
      this.plugin.app.metadataCache.on('changed', (file) => {
        if (file.path === this.sourcePath) {
          this.render();
        }
      })
    );
  }

  render() {
    const cache = this.plugin.app.metadataCache.getCache(this.sourcePath);
    const allHeadings = parseHeadings(cache);
    const filteredHeadings = filterHeadings(allHeadings, this.config.min_depth, this.config.max_depth);
    renderTOC(filteredHeadings, this.config, this.containerEl);
    this.attachClickHandlers();
  }

  attachClickHandlers() {
    const cache = this.plugin.app.metadataCache.getCache(this.sourcePath);
    this.containerEl.querySelectorAll('.structured-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const heading = (link as HTMLElement).dataset.heading;
        if (heading) {
          const headingCache = cache?.headings?.find(h => h.heading === heading);
          if (headingCache) {
            const leaf = this.plugin.app.workspace.getLeaf();
            const view = leaf.view;
            if ('editor' in view && view.editor) {
              view.editor.setCursor({ line: headingCache.position.start.line, ch: 0 });
              view.editor.scrollIntoView({ from: view.editor.getCursor(), to: view.editor.getCursor() }, true);
            }
          }
        }
      });
    });
  }
}
```

Update **src/main.ts** to use NavComponent:
```typescript
// In processNavBlock:
const component = new NavComponent(el, this, config, ctx.sourcePath);
ctx.addChild(component);
```

### Verification
- [ ] Add a new heading → TOC updates automatically
- [ ] Remove a heading → TOC updates automatically
- [ ] Rename a heading → TOC updates automatically
- [ ] Works in both Reading Mode and Live Preview

---

## Step 9: Basic Styling

Add minimal CSS for the TOC.

**styles.css**
```css
.structured-nav {
  margin: 1em 0;
}

.structured-nav-title {
  font-weight: 600;
  margin-bottom: 0.5em;
}

.structured-nav-list {
  margin: 0;
  padding-left: 1.5em;
}

.structured-nav-list li {
  margin: 0.2em 0;
}

.structured-nav-link {
  cursor: pointer;
  text-decoration: none;
}

.structured-nav-link:hover {
  text-decoration: underline;
}

.structured-nav-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em;
}

.structured-nav-empty {
  color: var(--text-muted);
  font-style: italic;
}

.structured-nav-error {
  color: var(--text-error);
}
```

---

## Step 10: Final Verification

Complete integration test checklist.

### Core Functionality
- [ ] Plugin loads without console errors
- [ ] ` ```nav``` ` renders bullet list TOC
- [ ] ` ```nav\nstyle: number``` ` renders numbered list
- [ ] ` ```nav\nstyle: inline``` ` renders inline links
- [ ] ` ```nav\nmin_depth: 2``` ` excludes H1
- [ ] ` ```nav\nmax_depth: 3``` ` excludes H4-H6
- [ ] ` ```nav\ntitle: "Table of Contents"``` ` shows title
- [ ] ` ```nav\ndelimiter: " • "``` ` uses custom delimiter for inline

### Navigation
- [ ] Clicking TOC item scrolls to heading in editor
- [ ] Works in Reading Mode
- [ ] Works in Live Preview

### Live Updates
- [ ] Adding heading updates TOC
- [ ] Removing heading updates TOC
- [ ] Changing heading text updates TOC

### Settings
- [ ] Settings tab shows all options
- [ ] Changing settings affects new nav blocks
- [ ] Settings persist after restart

### Edge Cases
- [ ] Empty document shows "No headings found"
- [ ] Invalid YAML shows error message
- [ ] Document with only H1 + min_depth:2 shows empty message

---

## File Creation Order

1. `package.json`
2. `manifest.json`
3. `tsconfig.json`
4. `esbuild.config.mjs`
5. `styles.css`
6. `src/types.ts`
7. `src/parser.ts`
8. `src/renderer.ts`
9. `src/settings.ts`
10. `src/nav-component.ts`
11. `src/main.ts`

Then: `npm install && npm run build`

---

## Next Steps After Phase 1

Once Phase 1 is complete and stable:

1. **Phase 2:** Add `@[[Note]]` reference parsing to headings
2. **Phase 3:** Add `-- [[Note]]` quick link syntax
3. **Phase 4:** Add scoping (start_after, end_before)
4. **Phase 5:** Presets, [NAV] inline trigger, polish

---

## Future Enhancements (Noted During Development)

- **Configurable default title in settings**: Allow users to set their own default title (e.g., "Contents", "Outline", etc.) instead of hardcoded "Table of Contents". Can also add option to hide title by default.
- **Custom bullet symbols**: Add fun symbol options beyond standard bullets (→, ▸, ◆, ★, ✓, ●, ○) or let users define their own via `bullet_symbol: "→"` option.

---

## Technical Notes

### Settings Refresh Behavior

Using custom workspace events to refresh nav blocks when settings change:

```typescript
// In saveSettings():
this.app.workspace.trigger('structured-navigator:settings-changed');

// In NavComponent.onload():
this.registerEvent(
  this.plugin.app.workspace.on('structured-navigator:settings-changed', () => {
    this.render();
  })
);
```

**Key insight:** NavComponent stores only the block-specific overrides (`blockConfig`), not the merged config. At render time, it merges with current `plugin.settings`. This allows settings changes to take effect immediately.

**References:**
- [Refresh all open Markdown views? - Obsidian Forum](https://forum.obsidian.md/t/refresh-all-open-markdown-views/38912)
- [Re-render markdown codeblock processor example - GitHub](https://github.com/Zachatoo/obsidian-rerender-markdown-codeblock-processor-example)

**What didn't work:**
- `app.workspace.updateOptions()` - only for CodeMirror extensions, doesn't re-render code block processors
- `view.previewMode?.rerender(true)` - didn't trigger our code block processor
