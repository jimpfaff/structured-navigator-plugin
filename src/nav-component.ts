import { MarkdownRenderChild, MarkdownView } from 'obsidian';
import type StructuredNavigatorPlugin from './main';
import { NavSettings, NavBlockConfig, mergeConfig } from './types';
import { parseHeadings, filterHeadings } from './parser';
import { renderTOC } from './renderer';

/**
 * Component that manages a single nav block's lifecycle and updates
 */
export class NavComponent extends MarkdownRenderChild {
	plugin: StructuredNavigatorPlugin;
	blockConfig: NavBlockConfig;
	sourcePath: string;

	constructor(
		containerEl: HTMLElement,
		plugin: StructuredNavigatorPlugin,
		blockConfig: NavBlockConfig,
		sourcePath: string
	) {
		super(containerEl);
		this.plugin = plugin;
		this.blockConfig = blockConfig;
		this.sourcePath = sourcePath;
	}

	onload(): void {
		this.render();

		// Listen for metadata changes to update TOC
		this.registerEvent(
			this.plugin.app.metadataCache.on('changed', (file) => {
				if (file.path === this.sourcePath) {
					this.render();
				}
			})
		);

		// Listen for settings changes to re-render with new defaults
		this.registerEvent(
			// @ts-ignore - custom event
			this.plugin.app.workspace.on('structured-navigator:settings-changed', () => {
				this.render();
			})
		);
	}

	/**
	 * Get current config by merging block overrides with current plugin settings
	 */
	private getConfig(): NavSettings {
		return mergeConfig(this.plugin.settings, this.blockConfig);
	}

	render(): void {
		const config = this.getConfig();
		const cache = this.plugin.app.metadataCache.getCache(this.sourcePath);
		const allHeadings = parseHeadings(cache);
		const filteredHeadings = filterHeadings(
			allHeadings,
			config.minDepth,
			config.maxDepth
		);

		renderTOC(filteredHeadings, config, this.containerEl);
		this.attachClickHandlers();
	}

	attachClickHandlers(): void {
		this.containerEl.querySelectorAll('.structured-nav-link').forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const line = (link as HTMLElement).dataset.line;
				if (line) {
					this.scrollToLine(parseInt(line, 10));
				}
			});
		});
	}

	scrollToLine(line: number): void {
		const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			const editor = view.editor;
			editor.setCursor({ line, ch: 0 });
			editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
		}
	}
}
