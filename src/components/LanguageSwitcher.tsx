"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeMeta, type Locale } from "@/i18n/routing";

/** Navbar language selector. Switching keeps the reader on the same page —
 * usePathname() from next-intl returns the locale-less path, so we just
 * re-navigate to it under the new locale. */
export default function LanguageSwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const t = useTranslations("language");
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (next: Locale) => {
    setOpen(false);
    if (next === active) return;
    startTransition(() => {
      // params carries any dynamic segments ([category], [slug]) for the
      // current route, so the equivalent page is resolved in the new locale.
      router.replace(
        // @ts-expect-error -- pathname is a validated route at runtime
        { pathname, params },
        { locale: next }
      );
    });
  };

  return (
    <div
      ref={rootRef}
      className={`lang-switch lang-switch--${variant}${open ? " is-open" : ""}`}
      data-pending={isPending ? "" : undefined}
    >
      <button
        type="button"
        className="lang-switch__toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("select")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="lang-switch__globe" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
          </svg>
        </span>
        <span className="lang-switch__current">{localeMeta[active].short}</span>
        <span className="lang-switch__caret" aria-hidden="true">
          <svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M1 1.5 6 6.5l5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <ul className="lang-switch__menu" role="listbox" aria-label={t("label")}>
        {locales.map((loc) => (
          <li key={loc}>
            <button
              type="button"
              role="option"
              aria-selected={loc === active}
              lang={loc}
              className={`lang-switch__option${loc === active ? " is-active" : ""}`}
              onClick={() => select(loc)}
            >
              <span className="lang-switch__name">{localeMeta[loc].label}</span>
              <span className="lang-switch__code">{localeMeta[loc].short}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
