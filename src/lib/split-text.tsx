import { Fragment } from "react";

/**
 * Server-renderable equivalents of advida.com's runtime text splitters.
 *
 * Original (inline script): `.title-anim` text is split into words, each
 * character wrapped in `<span class="word_inner">`, words joined by spaces.
 * `.p-anim` does the same with `<span class="p_inner">`.
 * `.word_inner` starts at opacity 0 + blur(4px); `.p_inner` at opacity 0
 * (see globals.css) and both are revealed by GSAP staggers.
 */
function splitChars(text: string, spanClass: string) {
  return text.split(" ").map((word, wi) => (
    <Fragment key={wi}>
      {wi > 0 && " "}
      {word.split("").map((ch, ci) => (
        <span key={ci} className={spanClass}>
          {ch}
        </span>
      ))}
    </Fragment>
  ));
}

export function TitleChars({ text }: { text: string }) {
  return <>{splitChars(text, "word_inner")}</>;
}

export function PChars({ text }: { text: string }) {
  return <>{splitChars(text, "p_inner")}</>;
}
