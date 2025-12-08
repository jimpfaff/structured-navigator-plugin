import { CachedMetadata } from 'obsidian';
import { HeadingItem, NoteRef } from './types';

// Regex to match +[[Note]] or +[[Note|Display]] patterns
const REF_PATTERN = /\+\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Extract headings from Obsidian's metadata cache
 * Basic version without refs - use parseHeadingsWithRefs for full parsing
 */
export function parseHeadings(cache: CachedMetadata | null): HeadingItem[] {
	if (!cache?.headings) {
		return [];
	}

	return cache.headings.map(h => ({
		level: h.level,
		heading: h.heading,
		line: h.position.start.line,
		refs: []
	}));
}

/**
 * Extract headings with cross-note references from document content
 * Looks for +[[Note]] patterns after heading text
 */
export function parseHeadingsWithRefs(
	cache: CachedMetadata | null,
	fileContent: string
): HeadingItem[] {
	if (!cache?.headings) {
		return [];
	}

	const lines = fileContent.split('\n');

	return cache.headings.map(h => {
		const lineContent = lines[h.position.start.line] || '';
		const refs = parseRefsFromLine(lineContent);

		// Strip +[[...]] refs from heading text for clean display
		const cleanHeading = stripRefs(h.heading);

		return {
			level: h.level,
			heading: cleanHeading,
			line: h.position.start.line,
			refs
		};
	});
}

/**
 * Remove +[[Note]] patterns from text
 */
function stripRefs(text: string): string {
	return text.replace(REF_PATTERN, '').trim();
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
