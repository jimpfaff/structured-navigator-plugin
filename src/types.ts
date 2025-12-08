export type NavStyle =
	| 'bullet'
	| 'number'
	| 'decimal'
	| 'outline'
	| 'inline';

export type RefsDisplay = 'show' | 'hide';

export interface NavSettings {
	style: NavStyle;
	minDepth: number;
	maxDepth: number;
	title: string;
	delimiter: string;
	bulletSymbol: string;
	refs: RefsDisplay;
}

export interface NavBlockConfig {
	style?: NavStyle;
	min_depth?: number;
	max_depth?: number;
	title?: string;
	delimiter?: string;
	bullet_symbol?: string;
	refs?: RefsDisplay;
}

export interface NoteRef {
	path: string;
	display?: string;
}

export interface HeadingItem {
	level: number;
	heading: string;
	line: number;
	refs: NoteRef[];
}

export const DEFAULT_SETTINGS: NavSettings = {
	style: 'bullet',
	minDepth: 1,
	maxDepth: 6,
	title: 'Table of Contents',
	delimiter: ' | ',
	bulletSymbol: '',
	refs: 'show'
};

/**
 * Merge block config (YAML with snake_case) into settings (camelCase)
 */
export function mergeConfig(settings: NavSettings, block: NavBlockConfig): NavSettings {
	return {
		style: block.style ?? settings.style,
		minDepth: block.min_depth ?? settings.minDepth,
		maxDepth: block.max_depth ?? settings.maxDepth,
		title: block.title ?? settings.title,
		delimiter: block.delimiter ?? settings.delimiter,
		bulletSymbol: block.bullet_symbol ?? settings.bulletSymbol,
		refs: block.refs ?? settings.refs,
	};
}
