export interface AsideStep {
  text: string;
}
export interface ServiceOption {
  value: string;
  label: string;
}
export interface ContactFormAttributes extends Record<string, unknown> {
  breadcrumbHomeLabel: string;
  breadcrumbLabel: string;
  heading: string;
  headingAccent: string;
  lead: string;
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
  adminEmail: string;
  adminEmailSubject: string;
  userEmailSubject: string;
  enableRecaptcha: boolean;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
}
