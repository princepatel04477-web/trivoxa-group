"use client";

import Link from "next/link";
import { emit } from "@/lib/site-events";

export interface Action {
  label: string;
  href?: string;
  modal?: boolean;
  variant?: "primary" | "ghost";
}

export default function ActionButtons({ actions }: { actions: Action[] }) {
  return (
    <div className="tvx-btns">
      {actions.map((a, i) => {
        const cls = `tvx-btn tvx-btn--${a.variant ?? (i === 0 ? "primary" : "ghost")}`;
        if (a.modal) {
          return (
            <button key={i} type="button" className={cls} onClick={() => emit("modal:open")}>
              {a.label}
            </button>
          );
        }
        return (
          <Link key={i} href={a.href ?? "#"} className={cls}>
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}
