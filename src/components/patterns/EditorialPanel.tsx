import { Eyebrow } from "@/components/trivoxa/ui";

/** Centered editorial prose, max-width 720px, with a large drop cap on the
 * first paragraph — used for founding-letter-style sections. */
export default function EditorialPanel({
  eyebrow,
  title,
  paragraphs,
  id,
}: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  id?: string;
}) {
  return (
    <section className="editorial-panel" id={id}>
      <div className="container editorial-panel__inner">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
        <div className="editorial-panel__prose">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "editorial-panel__dropcap" : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
