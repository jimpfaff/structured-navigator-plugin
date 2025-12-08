import { CachedMetadata } from 'obsidian';
import { HeadingItem } from './types';

/**
 * Extract headings from Obsidian's metadata cache
 */
export function parseHeadings(cache: CachedMetadata | null): HeadingItem[] {
	if (!cache?.headings) {
		return [];
	}

	return cache.headings.map(h => ({
		level: h.level,
		heading: h.heading,
		line: h.position.start.line
	}));
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
