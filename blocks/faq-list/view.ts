function initFaq(root: HTMLElement): void {
	const buttons = Array.from(
		root.querySelectorAll<HTMLButtonElement>('.filter-bar [data-filter]'),
	);
	const questions = Array.from(
		root.querySelectorAll<HTMLDetailsElement>('.faq-list details[data-category]'),
	);
	const count = root.querySelector<HTMLElement>('[data-faq-count]');
	const empty = root.querySelector<HTMLElement>('[data-faq-empty]');

	if (buttons.length === 0 || questions.length === 0) {
		return;
	}

	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			const selected = button.dataset.filter ?? 'all';
			let visible = 0;

			buttons.forEach((candidate) => {
				candidate.setAttribute('aria-pressed', String(candidate === button));
			});

			questions.forEach((question) => {
				const matches = selected === 'all' || question.dataset.category === selected;
				question.hidden = !matches;
				if (matches) {
					visible += 1;
				}
			});

			if (count) {
				const template = count.dataset.countTemplate ?? '%d questions';
				count.textContent = template.includes('%d')
					? template.replace('%d', String(visible))
					: `${visible} ${template}`;
			}
			if (empty) {
				empty.hidden = visible !== 0;
			}
		});
	});
}

function boot(): void {
	document.querySelectorAll<HTMLElement>('.doclap-faq-list').forEach((root) => {
		initFaq(root);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
	boot();
}

export {};
