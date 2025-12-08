# Structured Navigator

A dynamic table of contents plugin for [Obsidian](https://obsidian.md) that generates navigable outlines from your document headings.

## Features

- **Dynamic TOC generation** from document headings
- **Nested hierarchy** matching your heading structure (H2 → H3 → H4, etc.)
- **Multiple styles**: bullet, numbered, decimal outline, traditional outline, or inline
- **Custom bullet symbols**: arrows, triangles, diamonds, stars, and more
- **Cross-note references**: link related notes from headings with `+[[Note]]` syntax
- **Depth filtering**: control which heading levels appear
- **Live updates**: TOC refreshes automatically when you edit headings or change settings
- **Click to navigate**: jump to any heading in your document

## Installation

### From Community Plugins

1. Open **Settings → Community plugins**
2. Click **Browse** and search for "Structured Navigator"
3. Click **Install**, then **Enable**

### Manual Installation

If the plugin isn't yet available in the Community Plugins browser, or you want to install a specific version:

1. Go to the [Releases](https://github.com/jimpfaff/structured-navigator-plugin/releases) page
2. Download these three files from the latest release:
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. In your vault, navigate to `.obsidian/plugins/` (create the `plugins` folder if it doesn't exist)
4. Create a new folder called `structured-navigator`
5. Copy the three downloaded files into the `structured-navigator` folder
6. Restart Obsidian (or close and reopen your vault)
7. Go to **Settings → Community plugins** and enable "Structured Navigator"

> **Note**: You may need to disable "Restricted mode" in Community plugins settings to enable third-party plugins.

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
| `refs` | `show`, `hide` | `show` | Show/hide cross-note references |

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

## Cross-Note References

Add references to other notes after your headings using the `+[[Note]]` syntax:

```markdown
## Introduction +[[Background]] +[[Related Work]]

## Methods +[[Methodology Guide|Guide]]

## Results
```

The TOC will display these references as clickable links after each heading:

```
• Introduction → Background, Related Work
• Methods → Guide
• Results
```

Clicking a reference opens that note in your vault.

### Reference Syntax

| Syntax | Description |
|--------|-------------|
| `+[[Note]]` | Link to a note, displays note name |
| `+[[Note\|Display]]` | Link to a note with custom display text |

### Configuration

Control reference display with the `refs` option:

````markdown
```nav
refs: show
```
````

| Value | Description |
|-------|-------------|
| `show` | Display cross-note references (default) |
| `hide` | Hide references in TOC |

## Settings

Configure default values in **Settings → Structured Navigator**:

| Setting | Description |
|---------|-------------|
| **Default style** | Choose the default list style for new nav blocks |
| **Minimum heading depth** | Default minimum heading level to include |
| **Maximum heading depth** | Default maximum heading level to include |
| **Inline delimiter** | Default separator for inline style |
| **Bullet symbol** | Choose from preset symbols (→, ▸, ◆, ★, ✓, ○, ▪) or use default |
| **Cross-note references** | Show or hide `+[[Note]]` references in TOC |

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

- [x] Cross-note references (`+[[Note]]` syntax)
- [ ] Quick links (`-- [[Note]]` syntax)
- [ ] Scoped TOCs (show only part of a document)
- [ ] Presets for reusable configurations
- [ ] Inline `[NAV]` trigger

## Support

If you find this plugin useful, consider supporting development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://www.paypal.com/ncp/payment/U37GNNWBVN4RY)

## License

[MIT](LICENSE)
