import { defineRouting } from "next-intl/routing";

/** Every locale the site ships in. `en` is the default and is NOT prefixed in
 * the URL (trivoxagroup.com/businesses), every other locale is
 * (trivoxagroup.com/de/businesses) so each language is separately indexable. */
export const locales = [
  "en",
  "de",
  "fr",
  "es",
  "ar",
  "it",
  "pt",
  "nl",
  "tr",
  "ru",
  "pl",
  "hi",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Right-to-left locales — drives <html dir> and the RTL stylesheet. */
export const rtlLocales: Locale[] = ["ar"];

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

/** Display metadata for the navbar language switcher. `label` is the language's
 * own endonym — a German speaker looks for "Deutsch", not "German". */
export const localeMeta: Record<Locale, { label: string; short: string }> = {
  en: { label: "English", short: "EN" },
  de: { label: "Deutsch", short: "DE" },
  fr: { label: "Français", short: "FR" },
  es: { label: "Español", short: "ES" },
  ar: { label: "العربية", short: "AR" },
  it: { label: "Italiano", short: "IT" },
  pt: { label: "Português", short: "PT" },
  nl: { label: "Nederlands", short: "NL" },
  tr: { label: "Türkçe", short: "TR" },
  ru: { label: "Русский", short: "RU" },
  pl: { label: "Polski", short: "PL" },
  hi: { label: "हिन्दी", short: "HI" },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Keep English on bare paths; prefix all other locales.
  localePrefix: "as-needed",
});
