"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { ProductCategory } from "@/lib/data/industries";

export interface GridProduct extends ProductCategory {
  industry: string;
  industrySlug: string;
}

/** sessionStorage key for the RFQ basket — survives navigation into /rfq. */
const BASKET_KEY = "trivoxa-rfq-basket";

export function readBasket(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(BASKET_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeBasket(items: string[]) {
  try {
    sessionStorage.setItem(BASKET_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — selection still works in-memory */
  }
}

/**
 * Filterable, searchable product grid (spec §4 — Product Exports):
 * search across name/HS code, industry + incoterm filters, per-product spec
 * modal, and "Add to RFQ" checkboxes feeding a sticky quote bar.
 */
export default function ProductGrid({
  products,
  showIndustryFilter = false,
}: {
  products: GridProduct[];
  showIndustryFilter?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [incoterm, setIncoterm] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [specOf, setSpecOf] = useState<GridProduct | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(readBasket());
  }, []);

  const industries = useMemo(
    () => Array.from(new Set(products.map((p) => p.industry))),
    [products]
  );
  const incoterms = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.incoterms))),
    [products]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (industry !== "all" && p.industry !== industry) return false;
      if (incoterm !== "all" && !p.incoterms.includes(incoterm as never)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.hsCode.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q)
      );
    });
  }, [products, query, industry, incoterm]);

  const toggle = (name: string) => {
    setSelected((cur) => {
      const next = cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name];
      writeBasket(next);
      return next;
    });
  };

  // Spec modal: Escape closes, focus moves in on open.
  useEffect(() => {
    if (!specOf) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSpecOf(null);
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [specOf]);

  const rfqHref = `/rfq/?products=${encodeURIComponent(selected.join("|"))}`;

  return (
    <div className="pgrid">
      {/* Controls */}
      <div className="pgrid__controls">
        <input
          type="search"
          className="pgrid__search"
          placeholder="Search products or HS codes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        {showIndustryFilter && (
          <select
            className="pgrid__select"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            aria-label="Filter by industry"
          >
            <option value="all">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        )}
        <select
          className="pgrid__select"
          value={incoterm}
          onChange={(e) => setIncoterm(e.target.value)}
          aria-label="Filter by incoterm"
        >
          <option value="all">All incoterms</option>
          {incoterms.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <span className="pgrid__count" role="status">
          {visible.length} of {products.length} products
        </span>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="pgrid__empty">
          No products match — try a different term, or{" "}
          <Link href="/rfq/">send us your requirement</Link> and we&rsquo;ll source it.
        </p>
      ) : (
        <div className="pgrid__grid">
          {visible.map((p) => {
            const isSel = selected.includes(p.name);
            return (
              <article key={`${p.industrySlug}-${p.name}`} className={`pgrid__card${isSel ? " is-selected" : ""}`}>
                <header>
                  <span className="pgrid__hs">HS {p.hsCode}</span>
                  {showIndustryFilter && <span className="pgrid__industry">{p.industry}</span>}
                </header>
                <h3>{p.name}</h3>
                <dl className="pgrid__meta">
                  <div>
                    <dt>MOQ</dt>
                    <dd>{p.moq}</dd>
                  </div>
                  <div>
                    <dt>Lead time</dt>
                    <dd>{p.leadTime}</dd>
                  </div>
                  <div>
                    <dt>Incoterms</dt>
                    <dd>{p.incoterms.join(" · ")}</dd>
                  </div>
                </dl>
                <footer>
                  <button type="button" className="pgrid__spec-btn" onClick={() => setSpecOf(p)}>
                    Full specs
                  </button>
                  <label className="pgrid__add">
                    <input type="checkbox" checked={isSel} onChange={() => toggle(p.name)} />
                    <span>Add to RFQ</span>
                  </label>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {/* Sticky selection bar */}
      {selected.length > 0 && (
        <div className="pgrid__bar" role="region" aria-label="RFQ selection">
          <span>
            {selected.length} product{selected.length > 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            className="pgrid__bar-clear"
            onClick={() => {
              setSelected([]);
              writeBasket([]);
            }}
          >
            Clear
          </button>
          <Link href={rfqHref} className="pgrid__bar-cta" data-analytics="product-grid-rfq">
            Request Quote →
          </Link>
        </div>
      )}

      {/* Spec modal */}
      {specOf && (
        <div className="pgrid__overlay" onClick={() => setSpecOf(null)}>
          <div
            ref={dialogRef}
            className="pgrid__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${specOf.name} specifications`}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="pgrid__dialog-close" onClick={() => setSpecOf(null)} aria-label="Close">
              ×
            </button>
            <span className="pgrid__hs">HS {specOf.hsCode}</span>
            <h3>{specOf.name}</h3>
            <table className="pgrid__spec-table">
              <tbody>
                <tr>
                  <th scope="row">Industry</th>
                  <td>{specOf.industry}</td>
                </tr>
                <tr>
                  <th scope="row">HS Code</th>
                  <td>{specOf.hsCode}</td>
                </tr>
                <tr>
                  <th scope="row">Minimum Order</th>
                  <td>{specOf.moq}</td>
                </tr>
                <tr>
                  <th scope="row">Incoterms</th>
                  <td>{specOf.incoterms.join(", ")}</td>
                </tr>
                <tr>
                  <th scope="row">Lead Time</th>
                  <td>{specOf.leadTime}</td>
                </tr>
                <tr>
                  <th scope="row">Packaging</th>
                  <td>{specOf.packaging}</td>
                </tr>
              </tbody>
            </table>
            <div className="pgrid__dialog-actions">
              <label className="pgrid__add">
                <input
                  type="checkbox"
                  checked={selected.includes(specOf.name)}
                  onChange={() => toggle(specOf.name)}
                />
                <span>Add to RFQ</span>
              </label>
              <Link
                href={`/rfq/?products=${encodeURIComponent(specOf.name)}&category=${specOf.industrySlug}`}
                className="pgrid__bar-cta"
              >
                Quote this product →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
