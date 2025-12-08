# Structured Navigator

A dynamic table of contents plugin for [Obsidian](https://obsidian.md) that generates navigable outlines from your document headings.

## Features

- **Dynamic TOC generation** from document headings
- **Nested hierarchy** matching your heading structure (H2 → H3 → H4, etc.)
- **Multiple styles**: bullet list, numbered list, or inline
- **Depth filtering**: control which heading levels appear
- **Live updates**: TOC refreshes automatically when you edit headings
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

The TOC will render in Reading View, showing all headings in your document.

### Configuration Options

Customize the TOC with YAML options:

````markdown
```nav
style: bullet
min_depth: 2
max_depth: 4
title: Contents
```
````

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `style` | `bullet`, `number`, `inline` | `bullet` | List style |
| `min_depth` | `1` - `6` | `1` | Minimum heading level to include |
| `max_depth` | `1` - `6` | `6` | Maximum heading level to include |
| `title` | any text | (none) | Title displayed above the TOC |
| `delimiter` | any text | ` \| ` | Separator for inline style |

### Examples

**Numbered list with title:**
````markdown
```nav
style: number
title: Table of Contents
```
````

**Only show H2 and H3:**
````markdown
```nav
min_depth: 2
max_depth: 3
```
````

**Inline style for compact display:**
````markdown
```nav
style: inline
delimiter: " • "
```
````

## Default Settings

You can change the default values in Settings → Structured Navigator. These defaults apply when options aren't specified in a nav block.

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
