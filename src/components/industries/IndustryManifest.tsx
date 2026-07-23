import Link from "next/link";

export interface ManifestRow {
  name: string;
  description: string;
  href: string;
}

/** Editorial manifest: numbered rows with hairline dividers. */
export default function IndustryManifest({ rows }: { rows: ManifestRow[] }) {
  return (
    <div className="industry-list">
      {rows.map((item, i) => (
        <Link key={item.name} href={item.href} className="industry-row">
          <span className="industry-row__index">{String(i + 1).padStart(2, "0")}</span>
          <span className="industry-row__name">{item.name}</span>
          <span className="industry-row__desc">{item.description}</span>
        </Link>
      ))}
    </div>
  );
}
