# Obsidian Plugin Development Lessons

Lessons learned while developing the Structured Navigator plugin. Useful reference for future Obsidian plugin development.

---

## Lesson 1: Refreshing Code Block Processors When Settings Change

### Problem
When a user changes plugin settings, existing rendered code blocks don't update automatically. Users had to reload Obsidian to see changes.

### What Didn't Work

**1. `app.workspace.updateOptions()`**
```typescript
this.app.workspace.updateOptions();
```
- This only works for CodeMirror 6 extensions
- Does NOT re-render markdown code block processors
- Has performance warning: "fairly expensive, should not be called frequently"

**2. `view.previewMode?.rerender(true)`**
```typescript
this.app.workspace.getLeavesOfType('markdown').forEach(leaf => {
  const view = leaf.view;
  if (view instanceof MarkdownView) {
    view.previewMode?.rerender(true);
  }
});
```
- Didn't trigger our code block processor to re-run

### What Worked: Custom Workspace Events

**Solution:** Use custom events + store only block-level overrides in the component.

**Key Insight:** The component was storing the merged config at creation time. When settings changed, it still had the old values. Instead:
1. Store only the block-specific overrides (`blockConfig`)
2. Merge with current `plugin.settings` at render time
3. Trigger a custom event when settings change
4. Components listen for the event and re-render

**Implementation:**

```typescript
// main.ts - Trigger event when settings saved
async saveSettings(): Promise<void> {
  await this.saveData(this.settings);
  this.app.workspace.trigger('structured-navigator:settings-changed');
}

// nav-component.ts - Store only block overrides
export class NavComponent extends MarkdownRenderChild {
  plugin: StructuredNavigatorPlugin;
  blockConfig: NavBlockConfig;  // Only block-level overrides, not merged config

  constructor(containerEl, plugin, blockConfig, sourcePath) {
    super(containerEl);
    this.plugin = plugin;
    this.blockConfig = blockConfig;  // Store overrides only
  }

  onload(): void {
    this.render();

    // Listen for settings changes
    this.registerEvent(
      // @ts-ignore - custom event
      this.plugin.app.workspace.on('structured-navigator:settings-changed', () => {
        this.render();
      })
    );
  }

  // Merge with CURRENT settings at render time
  private getConfig(): NavSettings {
    return mergeConfig(this.plugin.settings, this.blockConfig);
  }

  render(): void {
    const config = this.getConfig();  // Fresh merge every render
    // ... render using config
  }
}
```

### References
- [Refresh all open Markdown views? - Obsidian Forum](https://forum.obsidian.md/t/refresh-all-open-markdown-views/38912)
- [Re-render markdown codeblock processor example - GitHub](https://github.com/Zachatoo/obsidian-rerender-markdown-codeblock-processor-example)

---

## Lesson 2: Plugin Submission Guidelines

### Manifest ID Rules
- Plugin ID **cannot contain "obsidian"** - this is a common rejection reason
- Folder name in `.obsidian/plugins/` should match the manifest `id`

### Required Files for Submission
- `manifest.json` - plugin metadata
- `main.js` - compiled bundle
- `styles.css` - if needed
- `README.md` - user documentation
- `LICENSE` - MIT recommended

### Code Guidelines
- Use `createEl()` instead of `innerHTML` for security
- No `console.log` statements in production (only errors)
- UI text should use sentence case, not title case
- No default hotkeys
- Avoid Node/Electron APIs for mobile compatibility

### References
- [Plugin Guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)

---

## Lesson 3: CSS Custom Properties for Dynamic Styling

### Problem
Needed to allow users to choose custom bullet symbols without hardcoding values in CSS.

### Solution
Use CSS custom properties (variables) set via JavaScript:

```typescript
// renderer.ts
if (useCustomBullet) {
  rootList.style.setProperty('--bullet-symbol', `"${config.bulletSymbol} "`);
}
```

```css
/* styles.css */
ul.structured-nav-custom-bullet li::before {
  content: var(--bullet-symbol, "• ");
}
```

This allows per-instance customization while keeping CSS clean.

---

## Lesson 4: Preserving Whitespace in HTML

### Problem
Spaces in delimiters (like ` | `) were being collapsed by HTML.

### Solution
Use `white-space: pre` in CSS:

```css
.structured-nav-delimiter {
  white-space: pre;
}
```

And use `textContent` instead of the `text` property:
```typescript
const delimSpan = inlineEl.createSpan({ cls: 'structured-nav-delimiter' });
delimSpan.textContent = config.delimiter;
```

---

## Lesson 5: Nested List Numbering with CSS

### Problem
Nested `<ol>` elements restart numbering at 1. For traditional outline format (I, A, 1, a), each level needed different styling.

### Solution
Use CSS descendant selectors to target each nesting level:

```css
ol.structured-nav-outline {
  list-style-type: upper-roman;
}

ol.structured-nav-outline > li > ol {
  list-style-type: upper-alpha;
}

ol.structured-nav-outline > li > ol > li > ol {
  list-style-type: decimal;
}

ol.structured-nav-outline > li > ol > li > ol > li > ol {
  list-style-type: lower-alpha;
}
```

For hierarchical decimal numbering (1.1, 1.2.1), use CSS counters:

```css
ol.structured-nav-decimal {
  counter-reset: toc-counter;
  list-style: none;
}

ol.structured-nav-decimal li {
  counter-increment: toc-counter;
}

ol.structured-nav-decimal li::before {
  content: counters(toc-counter, ".") ". ";
}
```

---

## Lesson 6: Building Nested List Structures

### Problem
When building nested lists from flat heading data, siblings at the same level were each getting their own list instead of sharing one.

### Bug
```typescript
// Wrong: pops when level >= target (pops same level too)
while (stack[stack.length - 1].level >= targetLevel) {
  stack.pop();
}
```

### Fix
```typescript
// Correct: only pop when level > target (keep same level)
while (stack[stack.length - 1].level > targetLevel) {
  stack.pop();
}
```

This ensures siblings at the same heading level are added to the same list, so numbering increments correctly (a, b, c instead of a, a, a).
