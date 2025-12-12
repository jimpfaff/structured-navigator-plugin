import { CachedMetadata } from 'obsidian';
import { HeadingItem, NoteRef } from './types';

// Regex to match +[[Note]] or +[[Note|Display]] patterns (cross-references)
const REF_PATTERN = /\+\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// Regex to match -- [[Note]] or -- [[Note|Display]] patterns (quick links)
// For standalone lines
const QUICK_LINK_LINE_PATTERN = /^--\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\s*$/;
// For inline quick links (on heading line or elsewhere)
const QUICK_LINK_INLINE_PATTERN = /--\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Extract headings from Obsidian's metadata cache
 * Basic version without refs or quick links - use parseHeadingsWithRefs for full parsing
 */
export function parseHeadings(cache: CachedMetadata | null): HeadingItem[] {
	if (!cache?.headings) {
		return [];
	}

	return cache.headings.map(h => ({
		level: h.level,
		heading: h.heading,
		line: h.position.start.line,
		refs: [],
		quickLinks: []
	}));
}

/**
 * Extract headings with cross-note references and quick links from document content
 * - Cross-references: +[[Note]] patterns on the heading line
 * - Quick links: -- [[Note]] patterns on lines immediately following the heading
 */
export function parseHeadingsWithRefs(
	cache: CachedMetadata | null,
	fileContent: string
): HeadingItem[] {
	if (!cache?.headings) {
		return [];
	}

	const lines = fileContent.split('\n');
	const headings = cache.headings; // Local reference for TypeScript

	return headings.map((h, index) => {
		const lineContent = lines[h.position.start.line] || '';
		const refs = parseRefsFromLine(lineContent);

		// Parse inline quick links from the heading line itself
		const inlineQuickLinks = parseInlineQuickLinks(h.heading);

		// Strip +[[...]] refs AND -- [[...]] quick links from heading text for clean display
		const cleanHeading = stripRefsAndQuickLinks(h.heading);

		// Find quick links on lines immediately following this heading
		const nextHeadingLine = index < headings.length - 1
			? headings[index + 1].position.start.line
			: lines.length;
		const lineQuickLinks = parseQuickLinks(lines, h.position.start.line + 1, nextHeadingLine);

		// Combine inline and line-based quick links
		const quickLinks = [...inlineQuickLinks, ...lineQuickLinks];

		return {
			level: h.level,
			heading: cleanHeading,
			line: h.position.start.line,
			refs,
			quickLinks
		};
	});
}

/**
 * Parse quick links (-- [[Note]]) from lines between start and end
 * Only collects consecutive quick link lines immediately after the heading
 */
function parseQuickLinks(lines: string[], startLine: number, endLine: number): NoteRef[] {
	const quickLinks: NoteRef[] = [];

	for (let i = startLine; i < endLine; i++) {
		const line = lines[i]?.trim();

		// Skip empty lines
		if (!line) continue;

		// Check if this is a quick link line
		const match = line.match(QUICK_LINK_LINE_PATTERN);
		if (match) {
			quickLinks.push({
				path: match[1].trim(),
				display: match[2]?.trim()
			});
		} else {
			// Stop collecting when we hit non-quick-link content
			break;
		}
	}

	return quickLinks;
}

/**
 * Parse inline quick links (-- [[Note]]) from a text string (e.g., heading text)
 */
function parseInlineQuickLinks(text: string): NoteRef[] {
	const quickLinks: NoteRef[] = [];
	let match;

	// Reset regex state
	QUICK_LINK_INLINE_PATTERN.lastIndex = 0;

	while ((match = QUICK_LINK_INLINE_PATTERN.exec(text)) !== null) {
		quickLinks.push({
			path: match[1].trim(),
			display: match[2]?.trim()
		});
	}

	return quickLinks;
}

/**
 * Remove +[[Note]] patterns from text
 */
function stripRefs(text: string): string {
	return text.replace(REF_PATTERN, '').trim();
}

/**
 * Remove both +[[Note]] refs and -- [[Note]] quick links from text
 */
function stripRefsAndQuickLinks(text: string): string {
	return text
		.replace(REF_PATTERN, '')
		.replace(QUICK_LINK_INLINE_PATTERN, '')
		.trim();
}

/**
 * Parse +[[Note]] references from a line of text
 */
function parseRefsFromLine(line: string): NoteRef[] {
	const refs: NoteRef[] = [];
	let match;

	// Reset regex state
	REF_PATTERN.lastIndex = 0;

	while ((match = REF_PATTERN.exec(line)) !== null) {
		refs.push({
			path: match[1].trim(),
			display: match[2]?.trim()
		});
	}

	return refs;
}

/**
 * Filter headings by depth range
 */
export function filterHeadings(
	headings: HeadingItem[],
	minDepth: number,
	maxDepth: number
): HeadingItem[] {
	return headings.filter(h => h.level >= minDepth && h.level <= maxDepth);
}
