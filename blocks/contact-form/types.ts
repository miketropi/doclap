export interface AsideStep {
  text: string;
}
export interface ServiceOption {
  value: string;
  label: string;
}
export interface ContactFormAttributes extends Record<string, unknown> {
	/**
	 * Optional section colours. Each is stored as the custom property the theme
	 * reads (`--doclap-block-bg`, `--doclap-block-heading`, `--doclap-block-text`);
	 * an empty string means "theme default" and emits nothing, so a section keeps
	 * the design unless an author picks a colour.
	 */
	sectionBg: string;
	sectionHeading: string;
	sectionText: string;
  asideMeta: string;
  asideHeading: string;
  asideCopy: string;
  asideSteps: string[];
  asideLinkLabel: string;
  asideLinkUrl: string;
  nameLabel: string;
  emailLabel: string;
  companyLabel: string;
  servicesLabel: string;
  services: ServiceOption[];
  messageLabel: string;
  messagePlaceholder: string;
  consentLabel: string;
  buttonLabel: string;
  sendingLabel: string;
  successMessage: string;
  errorMessage: string;
  formNote: string;
}
