export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface MegaMenuColumn {
  title: string;
  href: string;
  links: NavItem[];
}

export interface CaseStudy {
  title: string;
  description: string;
  image: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  href: string;
}

export interface StatItem {
  /** odometer start value, e.g. "1" */
  from: string;
  /** odometer end value, e.g. "4" */
  to: string;
  prefix?: string;
  suffix: string;
  label: string;
}

export interface ServiceRow {
  title: string;
  intro: string;
  checks: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface BrandLogo {
  name: string;
  image: string;
  width: number;
  height: number;
}

export interface FooterColumn {
  title: string;
  href: string;
  links: NavItem[];
  /** links hidden behind the "and much more..." toggle */
  moreLinks?: NavItem[];
}
