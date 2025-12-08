# Structured Navigator

A dynamic table of contents plugin for [Obsidian](https://obsidian.md) that generates navigable outlines from your document headings.

## Features

- **Dynamic TOC generation** from document headings
- **Nested hierarchy** matching your heading structure (H2 → H3 → H4, etc.)
- **Multiple styles**: bullet, numbered, decimal outline, traditional outline, or inline
- **Custom bullet symbols**: arrows, triangles, diamonds, stars, and more
- **Depth filtering**: control which heading levels appear
- **Live updates**: TOC refreshes automatically when you edit headings or change settings
- **Click to navigate**: jump to any heading in your document

## Installation

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder called `structured-navigator` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into that folder
4. Reload Obsidian
5. Enable "Structured Navigator" in Settings → Community plugins

### From Community Plugins (Coming Soon)

Once published, you'll be able to install directly from Obsidian's Community Plugins browser.

## Usage

Add a `nav` code block anywhere in your note:

````markdown
```nav
```
````

The TOC will render in Reading View, showing all headings in your document with a "Table of Contents" header.

### Configuration Options

Customize the TOC with YAML options inside the code block:

````markdown
```nav
style: outline
min_depth: 2
max_depth: 4
title: Contents
```
````

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `style` | `bullet`, `number`, `decimal`, `outline`, `inline` | `bullet` | List style (see below) |
| `min_depth` | `1` - `6` | `1` | Minimum heading level to include (1 = H1) |
| `max_depth` | `1` - `6` | `6` | Maximum heading level to include (6 = H6) |
| `title` | any text | `Table of Contents` | Title displayed above the TOC |
| `delimiter` | any text | ` \| ` | Separator for inline style |
| `bullet_symbol` | any symbol | (default bullet) | Custom bullet symbol for bullet style |

### List Styles

| Style | Description | Example |
|-------|-------------|---------|
| `bullet` | Standard bullet points | • Item |
| `number` | Simple numbered list (restarts at each level) | 1. Item |
| `decimal` | Hierarchical decimal numbering | 1.1.1. Item |
| `outline` | Traditional outline format | I. A. 1. a. |
| `inline` | Single-line horizontal list | Item \| Item \| Item |

### Examples

**Traditional outline style:**
````markdown
```nav
style: outline
```
````
Renders as:
```
I. First Section
   A. Subsection
      1. Detail
         a. Sub-detail
II. Second Section
```

**Decimal outline style:**
````markdown
```nav
style: decimal
```
````
Renders as:
```
1. First Section
   1.1. Subsection
      1.1.1. Detail
2. Second Section
```

**Custom bullet symbols:**
````markdown
```nav
style: bullet
bullet_symbol: "→"
```
````
Renders as:
```
→ First Section
   → Subsection
      → Detail
```

**Only show H2 and H3 headings:**
````markdown
```nav
min_depth: 2
max_depth: 3
```
````

**Inline style for compact navigation:**
````markdown
```nav
style: inline
delimiter: " • "
```
````
Renders as: `Section 1 • Section 2 • Section 3`

**Custom title:**
````markdown
```nav
title: "In This Article"
```
````

**Hide the title:**
````markdown
```nav
title: ""
```
````

## Settings

Configure default values in **Settings → Structured Navigator**:

| Setting | Description |
|---------|-------------|
| **Default style** | Choose the default list style for new nav blocks |
| **Minimum heading depth** | Default minimum heading level to include |
| **Maximum heading depth** | Default maximum heading level to include |
| **Inline delimiter** | Default separator for inline style |
| **Bullet symbol** | Choose from preset symbols (→, ▸, ◆, ★, ✓, ○, ▪) or use default |

Settings changes take effect immediately on all nav blocks—no need to reload Obsidian.

## How It Works

1. The plugin registers a code block processor for ` ```nav ` blocks
2. When Obsidian renders your note, the plugin reads headings from Obsidian's metadata cache
3. Headings are filtered by depth and rendered as a clickable list
4. Clicking a TOC item scrolls to that heading in your document
5. The TOC updates automatically when you add, remove, or rename headings

## Tips

- **Place the nav block at the top** of your document for easy navigation
- **Use `min_depth: 2`** to exclude the document title (H1) from the TOC
- **Use inline style** for a compact navigation bar in shorter documents
- **Use outline style** for formal documents that need traditional numbering
- **Combine with templates** to automatically include a nav block in new notes

## Roadmap

- [ ] Cross-note references (`@[[Note]]` syntax)
- [ ] Quick links (`-- [[Note]]` syntax)
- [ ] Scoped TOCs (show only part of a document)
- [ ] Presets for reusable configurations
- [ ] Inline `[NAV]` trigger

## Support

If you find this plugin useful, consider supporting development:

[![PayPal](https://img.shields.io/badge/PayPal-Support-blue)](https://www.paypal.com/ncp/payment/U37GNNWBVN4RY)

## License

[MIT](LICENSE)
