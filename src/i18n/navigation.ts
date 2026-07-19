import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware wrappers around Next's navigation APIs. `usePathname` here
 * returns the path WITHOUT the locale prefix, which is what lets the language
 * switcher swap locale while staying on the same page. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
