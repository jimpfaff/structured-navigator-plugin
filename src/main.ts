import { Plugin, MarkdownPostProcessorContext, parseYaml } from 'obsidian';
import { NavSettings, NavBlockConfig, DEFAULT_SETTINGS, mergeConfig } from './types';
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

		// Merge block config with plugin defaults
		const config = mergeConfig(this.settings, blockConfig);

		// Create component for lifecycle management
		const component = new NavComponent(el, this, config, ctx.sourcePath);
		ctx.addChild(component);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
