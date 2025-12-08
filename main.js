"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => StructuredNavigatorPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  style: "bullet",
  minDepth: 1,
  maxDepth: 6,
  title: "Table of Contents",
  delimiter: " | ",
  bulletSymbol: ""
};
function mergeConfig(settings, block) {
  var _a, _b, _c, _d, _e, _f;
  return {
    style: (_a = block.style) != null ? _a : settings.style,
    minDepth: (_b = block.min_depth) != null ? _b : settings.minDepth,
    maxDepth: (_c = block.max_depth) != null ? _c : settings.maxDepth,
    title: (_d = block.title) != null ? _d : settings.title,
    delimiter: (_e = block.delimiter) != null ? _e : settings.delimiter,
    bulletSymbol: (_f = block.bullet_symbol) != null ? _f : settings.bulletSymbol
  };
}

// src/settings.ts
var import_obsidian = require("obsidian");
var SettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("p", {
      text: "Note: Changes to these settings require reloading Obsidian to take effect on existing nav blocks.",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("Default style").setDesc("How to render the table of contents").addDropdown((dropdown) => dropdown.addOption("bullet", "Bullet list").addOption("number", "Numbered (1, 2, 3)").addOption("decimal", "Decimal (1.1, 1.2.1)").addOption("outline", "Traditional (I, A, 1, a)").addOption("inline", "Inline (single line)").setValue(this.plugin.settings.style).onChange(async (value) => {
      this.plugin.settings.style = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Minimum heading depth").setDesc("Smallest heading level to include (1 = H1)").addSlider((slider) => slider.setLimits(1, 6, 1).setValue(this.plugin.settings.minDepth).setDynamicTooltip().onChange(async (value) => {
      this.plugin.settings.minDepth = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Maximum heading depth").setDesc("Largest heading level to include (6 = H6)").addSlider((slider) => slider.setLimits(1, 6, 1).setValue(this.plugin.settings.maxDepth).setDynamicTooltip().onChange(async (value) => {
      this.plugin.settings.maxDepth = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Inline delimiter").setDesc('Separator for inline style (e.g., " | " or " \u2022 ")').addText((text) => text.setValue(this.plugin.settings.delimiter).onChange(async (value) => {
      this.plugin.settings.delimiter = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Bullet symbol").setDesc("Symbol to use for bullet lists").addDropdown((dropdown) => dropdown.addOption("", "\u2022 Default").addOption("\u2192", "\u2192 Arrow").addOption("\u25B8", "\u25B8 Triangle").addOption("\u25C6", "\u25C6 Diamond").addOption("\u2605", "\u2605 Star").addOption("\u2713", "\u2713 Checkmark").addOption("\u25CB", "\u25CB Circle").addOption("\u25AA", "\u25AA Square").setValue(this.plugin.settings.bulletSymbol).onChange(async (value) => {
      this.plugin.settings.bulletSymbol = value;
      await this.plugin.saveSettings();
    }));
  }
};

// src/nav-component.ts
var import_obsidian2 = require("obsidian");

// src/parser.ts
function parseHeadings(cache) {
  if (!(cache == null ? void 0 : cache.headings)) {
    return [];
  }
  return cache.headings.map((h) => ({
    level: h.level,
    heading: h.heading,
    line: h.position.start.line
  }));
}
function filterHeadings(headings, minDepth, maxDepth) {
  return headings.filter((h) => h.level >= minDepth && h.level <= maxDepth);
}

// src/renderer.ts
function renderTOC(headings, config, containerEl) {
  containerEl.empty();
  containerEl.addClass("structured-nav");
  if (headings.length === 0) {
    containerEl.createEl("p", {
      text: "No headings found",
      cls: "structured-nav-empty"
    });
    return;
  }
  if (config.title) {
    containerEl.createEl("div", {
      text: config.title,
      cls: "structured-nav-title"
    });
  }
  if (config.style === "inline") {
    renderInline(headings, config, containerEl);
  } else {
    renderList(headings, config, containerEl);
  }
}
function renderList(headings, config, containerEl) {
  const useCustomBullet = config.style === "bullet" && config.bulletSymbol;
  const useOrderedList = config.style !== "bullet";
  const listTag = useOrderedList ? "ol" : "ul";
  const minLevel = Math.min(...headings.map((h) => h.level));
  const listClasses = ["structured-nav-list", `structured-nav-${config.style}`];
  if (useCustomBullet) {
    listClasses.push("structured-nav-custom-bullet");
  }
  const rootList = containerEl.createEl(listTag, { cls: listClasses.join(" ") });
  if (useCustomBullet) {
    rootList.style.setProperty("--bullet-symbol", `"${config.bulletSymbol} "`);
  }
  const stack = [
    { list: rootList, lastLi: null, level: minLevel }
  ];
  for (const heading of headings) {
    const targetLevel = heading.level;
    while (stack.length > 1 && stack[stack.length - 1].level > targetLevel) {
      stack.pop();
    }
    while (stack[stack.length - 1].level < targetLevel) {
      const current = stack[stack.length - 1];
      let parentLi = current.lastLi;
      if (!parentLi) {
        parentLi = current.list.createEl("li");
        current.lastLi = parentLi;
      }
      const nestedList = parentLi.createEl(listTag);
      stack.push({ list: nestedList, lastLi: null, level: current.level + 1 });
    }
    const currentStack = stack[stack.length - 1];
    const li = currentStack.list.createEl("li");
    currentStack.lastLi = li;
    const link = li.createEl("a", {
      text: heading.heading,
      cls: "structured-nav-link"
    });
    link.dataset.line = String(heading.line);
    link.dataset.heading = heading.heading;
  }
}
function renderInline(headings, config, containerEl) {
  const minLevel = Math.min(...headings.map((h) => h.level));
  const topLevel = headings.filter((h) => h.level === minLevel);
  const inlineEl = containerEl.createEl("div", { cls: "structured-nav-inline" });
  topLevel.forEach((heading, index) => {
    if (index > 0) {
      const delimSpan = inlineEl.createSpan({ cls: "structured-nav-delimiter" });
      delimSpan.textContent = config.delimiter;
    }
    const link = inlineEl.createEl("a", {
      text: heading.heading,
      cls: "structured-nav-link"
    });
    link.dataset.line = String(heading.line);
    link.dataset.heading = heading.heading;
  });
}

// src/nav-component.ts
var NavComponent = class extends import_obsidian2.MarkdownRenderChild {
  constructor(containerEl, plugin, config, sourcePath) {
    super(containerEl);
    this.plugin = plugin;
    this.config = config;
    this.sourcePath = sourcePath;
  }
  onload() {
    this.render();
    this.registerEvent(
      this.plugin.app.metadataCache.on("changed", (file) => {
        if (file.path === this.sourcePath) {
          this.render();
        }
      })
    );
  }
  render() {
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
  attachClickHandlers() {
    this.containerEl.querySelectorAll(".structured-nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const line = link.dataset.line;
        if (line) {
          this.scrollToLine(parseInt(line, 10));
        }
      });
    });
  }
  scrollToLine(line) {
    const view = this.plugin.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    if (view) {
      const editor = view.editor;
      editor.setCursor({ line, ch: 0 });
      editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
    }
  }
};

// src/main.ts
var StructuredNavigatorPlugin = class extends import_obsidian3.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor("nav", this.processNavBlock.bind(this));
  }
  async processNavBlock(source, el, ctx) {
    let blockConfig = {};
    if (source.trim()) {
      try {
        const parsed = (0, import_obsidian3.parseYaml)(source);
        if (parsed && typeof parsed === "object") {
          blockConfig = parsed;
        }
      } catch (e) {
        el.createEl("p", {
          text: `Error parsing nav config: ${e}`,
          cls: "structured-nav-error"
        });
        return;
      }
    }
    const config = mergeConfig(this.settings, blockConfig);
    const component = new NavComponent(el, this, config, ctx.sourcePath);
    ctx.addChild(component);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
