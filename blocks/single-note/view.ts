((): void => {
	const roots = document.querySelectorAll<HTMLElement>('.doclap-single-note');

	roots.forEach((root) => {
		const save = root.querySelector<HTMLButtonElement>('[data-doclap-save]');
		const copy = root.querySelector<HTMLButtonElement>('[data-doclap-copy]');
		const status = root.querySelector<HTMLElement>('[data-doclap-article-status]');
		const permalink = copy?.dataset.permalink ?? window.location.href;
		const storageKey = `doclap-saved:${permalink}`;
		const report = (message: string): void => {
			if (status) {
				status.textContent = message;
			}
		};

		if (save) {
			let saved = false;
			try {
				saved = window.localStorage.getItem(storageKey) === '1';
			} catch {
				saved = false;
			}
			save.setAttribute('aria-pressed', String(saved));
			save.addEventListener('click', () => {
				saved = save.getAttribute('aria-pressed') !== 'true';
				save.setAttribute('aria-pressed', String(saved));
				try {
					if (saved) {
						window.localStorage.setItem(storageKey, '1');
					} else {
						window.localStorage.removeItem(storageKey);
					}
				} catch {
					// The toggle remains usable when storage is unavailable.
				}
				report(saved ? 'Article saved.' : 'Article removed from saved items.');
			});
		}

		copy?.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(permalink);
				report('Link copied.');
			} catch {
				const field = document.createElement('textarea');
				field.value = permalink;
				field.style.position = 'fixed';
				field.style.opacity = '0';
				document.body.appendChild(field);
				field.select();
				const copied = document.execCommand('copy');
				field.remove();
				report(copied ? 'Link copied.' : 'Unable to copy the link.');
			}
		});
	});
})();

export {};
