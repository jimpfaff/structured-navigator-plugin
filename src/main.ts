import { Plugin, MarkdownPostProcessorContext, parseYaml } from 'obsidian';
import { NavSettings, NavBlockConfig, DEFAULT_SETTINGS } from './types';
import { SettingsTab } from './settings';
import { NavComponent } from './nav-component';

export default class StructuredNavigatorPlugin extends Plugin {
	settings!: NavSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

		// Register the ```nav code block processor
		this.registerMarkdownCodeBlockProcessor('nav', this.processNavBlock.bind(this));
	}

	async processNavBlock(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	): Promise<void> {
		// Parse YAML config from code block
		let blockConfig: NavBlockConfig = {};

		if (source.trim()) {
			try {
				const parsed = parseYaml(source);
				if (parsed && typeof parsed === 'object') {
					blockConfig = parsed as NavBlockConfig;
				}
			} catch (e) {
				el.createEl('p', {
					text: `Error parsing nav config: ${e}`,
					cls: 'structured-nav-error'
				});
				return;
			}
		}

		// Create component for lifecycle management
		// Pass blockConfig only - component will merge with current settings at render time
		const component = new NavComponent(el, this, blockConfig, ctx.sourcePath);
		ctx.addChild(component);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		// Trigger event for nav components to re-render
		this.app.workspace.trigger('structured-navigator:settings-changed');
	}
}
