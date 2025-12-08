import { MarkdownRenderChild, MarkdownView } from 'obsidian';
import type StructuredNavigatorPlugin from './main';
import { NavSettings } from './types';
import { parseHeadings, filterHeadings } from './parser';
import { renderTOC } from './renderer';

/**
 * Component that manages a single nav block's lifecycle and updates
 */
export class NavComponent extends MarkdownRenderChild {
	plugin: StructuredNavigatorPlugin;
	config: NavSettings;
	sourcePath: string;

	constructor(
		containerEl: HTMLElement,
		plugin: StructuredNavigatorPlugin,
		config: NavSettings,
		sourcePath: string
	) {
		super(containerEl);
		this.plugin = plugin;
		this.config = config;
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
	}

	render(): void {
		const cache = this.plugin.app.metadataCache.getCache(this.sourcePath);
		const allHeadings = parseHeadings(cache);
		const filteredHeadings = filterHeadings(
			allHeadings,
			this.config.minDepth,
			this.config.maxDepth
		);

		renderTOC(filteredHeadings, this.config, this.containerEl);
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
