export interface NavSettings {
	style: 'bullet' | 'number' | 'inline';
	minDepth: number;
	maxDepth: number;
	title: string;
	delimiter: string;
}

export interface NavBlockConfig {
	style?: 'bullet' | 'number' | 'inline';
	min_depth?: number;
	max_depth?: number;
	title?: string;
	delimiter?: string;
}

export interface HeadingItem {
	level: number;
	heading: string;
	line: number;
}

export const DEFAULT_SETTINGS: NavSettings = {
	style: 'bullet',
	minDepth: 1,
	maxDepth: 6,
	title: '',
	delimiter: ' | '
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
	};
}
