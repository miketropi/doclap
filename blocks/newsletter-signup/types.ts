export interface NewsletterSignupAttributes extends Record<string, unknown> {
	/**
	 * Optional section colours. Each is stored as the custom property the theme
	 * reads (`--doclap-block-bg`, `--doclap-block-heading`, `--doclap-block-text`);
	 * an empty string means "theme default" and emits nothing, so a section keeps
	 * the design unless an author picks a colour.
	 */
	sectionBg: string;
	sectionHeading: string;
	sectionText: string;
	newsletterEyebrow: string;
	/**
	 * Merged rich heading. The legacy split accent (`newsletterHeadingAccent`) is
	 * folded into this value by the editor on first mount and cleared afterwards.
	 */
	newsletterHeading: string;
	newsletterHeadingAccent: string;
	newsletterText: string;
	metaPrimary: string;
	metaSecondary: string;
	/** Accessible name of the form. */
	formLabel: string;
	emailLabel: string;
	emailPlaceholder: string;
	submitLabel: string;
	consentLabel: string;
	disclosure: string;
	/** Announced when the form is idle and nothing is stored. */
	idleStatus: string;
	/** Announced after a successful write. */
	savedStatus: string;
	/** Announced when a stored signup is found on load. */
	restoredStatus: string;
	/** Announced after the stored signup is removed. */
	removedStatus: string;
	/** Announced when browser storage cannot be read or written at all. */
	unavailableStatus: string;
	/** Announced when the write failed. */
	saveFailedStatus: string;
	/** Announced when the stored value could not be removed. */
	removeFailedStatus: string;
	removeLabel: string;
}
