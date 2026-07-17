import { cn } from "@/lib/utils";

/**
 * The only inline SVG on advida.com — the scroll-to-top progress ring.
 * All other icons on the site are `<img>` tags pointing at
 * /images/icons/*.svg (downloaded 1:1 into public/images/icons/).
 */
export function CircleProgressIcon({ className }: { className?: string }) {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" className={cn("circle", className)}>
      <circle
        className="circle-fill"
        cx="25"
        cy="25"
        r="24.5"
        strokeWidth="1"
        stroke="var(--foreground)"
        fill="none"
        strokeDasharray="153.93"
        strokeDashoffset="153.93"
      />
      <circle
        className="circle-bg"
        cx="25"
        cy="25"
        r="24.5"
        strokeWidth="1"
        stroke="var(--foreground)"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}

/** Paths of the downloaded advida icon files, for `<img src>` usage that matches the original DOM. */
export const iconPaths = {
  arrowRight: "/images/icons/arrow-right.svg",
  bookCall: "/images/icons/book-call.svg",
  check: "/images/icons/check.svg",
  chevronDown: "/images/icons/chevron-down.svg",
  chevronDownLg: "/images/icons/chevron-down-lg.svg",
  close: "/images/icons/close.svg",
  envelopeSend: "/images/icons/envelope-send.svg",
  facebook: "/images/icons/facebook.svg",
  linkedin: "/images/icons/linkedin.svg",
  tickCircle: "/images/icons/tick-circle.svg",
  twitter: "/images/icons/twitter.svg",
  logo: "/images/logo.svg",
} as const;
