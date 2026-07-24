import { Eyebrow } from "@/components/trivoxa/ui";
import { PageReveal } from "@/components/motion/PageReveal";
import { HeadingReveal } from "@/components/motion/HeadingReveal";

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
        <PageReveal as="div">
          <Eyebrow>{eyebrow}</Eyebrow>
        </PageReveal>
        <HeadingReveal as="h2" text={title} delay={0.05} />
        <div className="editorial-panel__prose">
          {paragraphs.map((p, i) => (
            <PageReveal as="p" key={i} delay={Math.min(0.1 + i * 0.05, 0.3)} className={i === 0 ? "editorial-panel__dropcap" : undefined}>
              {p}
            </PageReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
