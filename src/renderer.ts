import { HeadingItem, NavSettings, NoteRef } from './types';

/**
 * Render TOC as HTML elements
 */
export function renderTOC(
	headings: HeadingItem[],
	config: NavSettings,
	containerEl: HTMLElement
): void {
	containerEl.empty();
	containerEl.addClass('structured-nav');

	if (headings.length === 0) {
		containerEl.createEl('p', {
			text: 'No headings found',
			cls: 'structured-nav-empty'
		});
		return;
	}

	// Add title if specified
	if (config.title) {
		containerEl.createEl('div', {
			text: config.title,
			cls: 'structured-nav-title'
		});
	}

	if (config.style === 'inline') {
		renderInline(headings, config, containerEl);
	} else {
		renderList(headings, config, containerEl);
	}
}

function renderList(
	headings: HeadingItem[],
	config: NavSettings,
	containerEl: HTMLElement
): void {
	const useCustomBullet = config.style === 'bullet' && config.bulletSymbol;
	const useOrderedList = config.style !== 'bullet';
	const listTag = useOrderedList ? 'ol' : 'ul';
	const minLevel = Math.min(...headings.map(h => h.level));

	// Build nested list structure with style-specific class
	const listClasses = ['structured-nav-list', `structured-nav-${config.style}`];
	if (useCustomBullet) {
		listClasses.push('structured-nav-custom-bullet');
	}
	const rootList = containerEl.createEl(listTag, { cls: listClasses.join(' ') });

	// Set custom bullet symbol as CSS variable if specified
	if (useCustomBullet) {
		rootList.style.setProperty('--bullet-symbol', `"${config.bulletSymbol} "`);
	}

	// Track: for each level, what's the current list and last li element
	const stack: { list: HTMLElement; lastLi: HTMLElement | null; level: number }[] = [
		{ list: rootList, lastLi: null, level: minLevel }
	];

	for (const heading of headings) {
		const targetLevel = heading.level;

		// Go up: pop stack until we're at the target level or above
		while (stack.length > 1 && stack[stack.length - 1].level > targetLevel) {
			stack.pop();
		}

		// Go down: create nested lists as needed
		while (stack[stack.length - 1].level < targetLevel) {
			const current = stack[stack.length - 1];
			// Need a parent li to nest under
			let parentLi = current.lastLi;
			if (!parentLi) {
				// Create an empty li if needed
				parentLi = current.list.createEl('li');
				current.lastLi = parentLi;
			}
			const nestedList = parentLi.createEl(listTag);
			stack.push({ list: nestedList, lastLi: null, level: current.level + 1 });
		}

		// Now we're at the right level - add the item
		const currentStack = stack[stack.length - 1];
		const li = currentStack.list.createEl('li');
		currentStack.lastLi = li;

		const link = li.createEl('a', {
			text: heading.heading,
			cls: 'structured-nav-link'
		});
		link.dataset.line = String(heading.line);
		link.dataset.heading = heading.heading;

		// Render refs if present and enabled
		if (config.refs === 'show' && heading.refs.length > 0) {
			renderRefs(heading.refs, li);
		}
	}
}

function renderInline(
	headings: HeadingItem[],
	config: NavSettings,
	containerEl: HTMLElement
): void {
	const minLevel = Math.min(...headings.map(h => h.level));
	const topLevel = headings.filter(h => h.level === minLevel);

	const inlineEl = containerEl.createEl('div', { cls: 'structured-nav-inline' });

	topLevel.forEach((heading, index) => {
		if (index > 0) {
			// Use textContent and CSS white-space to preserve spaces
			const delimSpan = inlineEl.createSpan({ cls: 'structured-nav-delimiter' });
			delimSpan.textContent = config.delimiter;
		}
		const link = inlineEl.createEl('a', {
			text: heading.heading,
			cls: 'structured-nav-link'
		});
		link.dataset.line = String(heading.line);
		link.dataset.heading = heading.heading;

		// Render refs inline if present and enabled
		if (config.refs === 'show' && heading.refs.length > 0) {
			renderRefs(heading.refs, inlineEl);
		}
	});
}

/**
 * Render cross-note references as small linked items
 */
function renderRefs(refs: NoteRef[], containerEl: HTMLElement): void {
	const refsContainer = containerEl.createSpan({ cls: 'structured-nav-refs' });
	refsContainer.createSpan({ text: ' → ', cls: 'structured-nav-refs-arrow' });

	refs.forEach((ref, index) => {
		if (index > 0) {
			refsContainer.createSpan({ text: ', ', cls: 'structured-nav-refs-sep' });
		}
		const refLink = refsContainer.createEl('a', {
			text: ref.display || ref.path,
			cls: 'structured-nav-ref-link'
		});
		refLink.dataset.refPath = ref.path;
	});
}
