import { App, PluginSettingTab, Setting } from 'obsidian';
import type StructuredNavigatorPlugin from './main';
import type { NavSettings } from './types';

export class SettingsTab extends PluginSettingTab {
	plugin: StructuredNavigatorPlugin;

	constructor(app: App, plugin: StructuredNavigatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Header with links
		containerEl.createEl('p', {
			text: 'Generate dynamic tables of contents from your document headings.',
			cls: 'setting-item-description'
		});

		const linksDiv = containerEl.createDiv({ cls: 'structured-nav-settings-links' });

		const docLink = linksDiv.createEl('a', {
			text: 'Documentation',
			href: 'https://github.com/jimpfaff/structured-navigator'
		});
		docLink.setAttr('target', '_blank');

		linksDiv.createSpan({ text: ' • ' });

		const supportLink = linksDiv.createEl('a', {
			text: 'Support this plugin',
			href: 'https://www.paypal.com/ncp/payment/U37GNNWBVN4RY'
		});
		supportLink.setAttr('target', '_blank');

		containerEl.createEl('hr');

		new Setting(containerEl)
			.setName('Default style')
			.setDesc('How to render the table of contents')
			.addDropdown(dropdown => dropdown
				.addOption('bullet', 'Bullet list')
				.addOption('number', 'Numbered (1, 2, 3)')
				.addOption('decimal', 'Decimal (1.1, 1.2.1)')
				.addOption('outline', 'Traditional (I, A, 1, a)')
				.addOption('inline', 'Inline (single line)')
				.setValue(this.plugin.settings.style)
				.onChange(async (value) => {
					this.plugin.settings.style = value as NavSettings['style'];
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Minimum heading depth')
			.setDesc('Smallest heading level to include (1 = H1)')
			.addSlider(slider => slider
				.setLimits(1, 6, 1)
				.setValue(this.plugin.settings.minDepth)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.minDepth = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Maximum heading depth')
			.setDesc('Largest heading level to include (6 = H6)')
			.addSlider(slider => slider
				.setLimits(1, 6, 1)
				.setValue(this.plugin.settings.maxDepth)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxDepth = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Inline delimiter')
			.setDesc('Separator for inline style (e.g., " | " or " • ")')
			.addText(text => text
				.setValue(this.plugin.settings.delimiter)
				.onChange(async (value) => {
					this.plugin.settings.delimiter = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Bullet symbol')
			.setDesc('Symbol to use for bullet lists')
			.addDropdown(dropdown => dropdown
				.addOption('', '• Default')
				.addOption('→', '→ Arrow')
				.addOption('▸', '▸ Triangle')
				.addOption('◆', '◆ Diamond')
				.addOption('★', '★ Star')
				.addOption('✓', '✓ Checkmark')
				.addOption('○', '○ Circle')
				.addOption('▪', '▪ Square')
				.setValue(this.plugin.settings.bulletSymbol)
				.onChange(async (value) => {
					this.plugin.settings.bulletSymbol = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Cross-note references')
			.setDesc('Show +[[Note]] references after headings in the TOC')
			.addDropdown(dropdown => dropdown
				.addOption('show', 'Show references')
				.addOption('hide', 'Hide references')
				.setValue(this.plugin.settings.refs)
				.onChange(async (value) => {
					this.plugin.settings.refs = value as NavSettings['refs'];
					await this.plugin.saveSettings();
				}));
	}
}
