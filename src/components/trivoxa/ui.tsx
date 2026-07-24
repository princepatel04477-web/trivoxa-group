import Link from "next/link";
import type { ReactNode } from "react";
import ActionButtons, { type Action } from "@/components/trivoxa/ActionButtons";
import { PageReveal } from "@/components/motion/PageReveal";
import { HeadingReveal } from "@/components/motion/HeadingReveal";
import { AnimatedCard } from "@/components/motion/AnimatedCard";
import SectionGrain from "@/components/patterns/SectionGrain";

export type { Action };

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="tvx-eyebrow">{children}</span>;
}

/** Split a multi-paragraph string (\n\n separated) into <p> elements. */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  crumb,
  accent,
  grain,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: Action[];
  crumb?: { label: string; href?: string }[];
  /** Per-page hero background decoration — pass `<PageAccent variant="..." />`. */
  accent?: ReactNode;
  /** Home hero's film-grain + vignette + scroll-scale atmosphere, opt-in. */
  grain?: boolean;
}) {
  return (
    <section className="tvx-hero">
      {accent}
      {grain && <SectionGrain className="tvx-hero__grain" vignette scrollScale />}
      <div className="container">
        <div className="tvx-hero__inner">
          {crumb && (
            <PageReveal as="div" className="tvx-crumb">
              {crumb.map((c, i) => (
                <span key={i} style={{ display: "contents" }}>
                  {i > 0 && <span>/</span>}
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                </span>
              ))}
            </PageReveal>
          )}
          {eyebrow && (
            <PageReveal as="div" delay={0.05}>
              <Eyebrow>{eyebrow}</Eyebrow>
            </PageReveal>
          )}
          <HeadingReveal as="h1" text={title} delay={0.1} />
          {description && (
            <PageReveal as="div" className="tvx-hero-desc" delay={0.16}>
              <Paragraphs text={description} />
            </PageReveal>
          )}
          {actions && (
            <PageReveal as="div" delay={0.22}>
              <ActionButtons actions={actions} />
            </PageReveal>
          )}
        </div>
      </div>
    </section>
  );
}

export function Section({
  eyebrow,
  title,
  lead,
  children,
  tight,
  id,
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  children?: ReactNode;
  tight?: boolean;
  id?: string;
}) {
  return (
    <section className={`tvx-section${tight ? " tvx-section--tight" : ""}`} id={id}>
      <div className="container">
        {eyebrow && (
          <PageReveal as="div">
            <Eyebrow>{eyebrow}</Eyebrow>
          </PageReveal>
        )}
        {title && <HeadingReveal as="h2" text={title} delay={0.05} />}
        {lead && (
          <PageReveal as="div" className="tvx-lead" delay={0.1}>
            <Paragraphs text={lead} />
          </PageReveal>
        )}
        {children}
      </div>
    </section>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <div className="tvx-checklist">
      {items.map((t, i) => (
        <AnimatedCard key={i} index={i} className="tvx-check">
          {t}
        </AnimatedCard>
      ))}
    </div>
  );
}

export function Steps({ items, row }: { items: { title: string; desc?: string }[]; row?: boolean }) {
  return (
    <div className={`tvx-steps${row ? " tvx-steps--row" : ""}`}>
      {items.map((s, i) => (
        <AnimatedCard key={i} index={i} className="tvx-step" variant={row ? (i % 2 === 0 ? "left" : "right") : "up"}>
          <div className="tvx-step__n">{String(i + 1).padStart(2, "0")}</div>
          <h4>{s.title}</h4>
          {s.desc && <p>{s.desc}</p>}
        </AnimatedCard>
      ))}
    </div>
  );
}

export function Pills({ items }: { items: string[] }) {
  return (
    <div className="tvx-pills">
      {items.map((p, i) => (
        <AnimatedCard key={i} index={i} as="div" className="tvx-pill" variant="scale">
          {p}
        </AnimatedCard>
      ))}
    </div>
  );
}

export function CtaBand({
  title,
  description,
  actions,
  eagle = true,
}: {
  title: string;
  description?: string;
  actions: Action[];
  eagle?: boolean;
}) {
  return (
    <section className="tvx-cta">
      <div className="container">
        {eagle && <img className="tvx-cta__eagle" src="/images/trivoxa-eagle.png" alt="" />}
        <HeadingReveal as="h2" text={title} />
        {description && <PageReveal as="p" delay={0.06}>{description}</PageReveal>}
        <PageReveal as="div" delay={0.12}>
          <ActionButtons actions={actions} />
        </PageReveal>
      </div>
    </section>
  );
}

export function Split({ children, media }: { children: ReactNode; media?: ReactNode }) {
  return (
    <div className="tvx-split">
      <PageReveal as="div">{children}</PageReveal>
      <AnimatedCard as="div" className="tvx-split--media" variant="scale">
        {media ?? <img src="/images/trivoxa-eagle.png" alt="" />}
      </AnimatedCard>
    </div>
  );
}
