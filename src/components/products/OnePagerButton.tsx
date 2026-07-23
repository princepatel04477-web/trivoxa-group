"use client";

/** "Download one-pager" (spec §4) — opens the browser's print/save-as-PDF
 * dialog; print CSS reduces the page to the portfolio table + contact block,
 * so the saved PDF reads as a clean category one-pager. */
export default function OnePagerButton({ category }: { category: string }) {
  return (
    <button
      type="button"
      className="tvx-btn tvx-btn--ghost"
      onClick={() => window.print()}
      data-analytics="one-pager-download"
    >
      Download {category} one-pager (PDF) ↓
    </button>
  );
}
