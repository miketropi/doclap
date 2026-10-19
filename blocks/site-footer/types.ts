export interface FooterLink extends Record<string, unknown> {
  label: string;
  url: string;
}

export interface FooterNavGroup extends Record<string, unknown> {
  kicker: string;
  ariaLabel: string;
  links: FooterLink[];
}

export interface SiteFooterAttributes extends Record<string, unknown> {
  /** Section colours; an empty string keeps the theme default. */
  sectionBg?: string;
  sectionHeading?: string;
  sectionText?: string;
  kicker: string;
  heading: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  navGroups: FooterNavGroup[];
  brandText: string;
  brandMark: string;
  brandUrl: string;
  copyrightPrefix: string;
  copyrightText: string;
  signature: string;
  privacyLabel: string;
  privacyUrl: string;
  backToTopLabel: string;
  footerAriaLabel: string;
}
