"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import Scrollbar, { ScrollbarPlugin } from "smooth-scrollbar";
import { ScrollTrigger, BP } from "@/lib/gsap";
import { on, emit } from "@/lib/site-events";
import { setScrollbarInstance } from "@/components/ScrollTopWidget";

class ModalPlugin extends ScrollbarPlugin {
  static pluginName = "modal";
  static defaultOptions = { open: false };

  transformDelta(delta: { x: number; y: number }) {
    return (this.options as { open: boolean }).open ? { x: 0, y: 0 } : delta;
  }
}

// Called at module level before component mounts
const _registerPlugin = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  Scrollbar.use(ModalPlugin);
};
_registerPlugin();

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }

    if (window.innerWidth <= BP.desktop) return;

    const bar = Scrollbar.init(el, {
      damping: 0.05,
      delegateTo: document,
      alwaysShowTracks: true,
      plugins: { modal: { open: false } },
    });

    setScrollbarInstance(bar as unknown as Parameters<typeof setScrollbarInstance>[0]);
    emit("scrollbar:init");

    ScrollTrigger.scrollerProxy(el, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          bar.scrollTop = value;
        }
        return bar.scrollTop;
      },
    });
    bar.addListener(ScrollTrigger.update);
    ScrollTrigger.defaults({ scroller: el });

    const unsubOpen = on("modal:open", () => {
      (bar.options.plugins as Record<string, { open: boolean }>).modal.open = true;
    });
    const unsubClose = on("modal:close", () => {
      (bar.options.plugins as Record<string, { open: boolean }>).modal.open = false;
    });

    ScrollTrigger.refresh();

    return () => {
      unsubOpen();
      unsubClose();
      bar.destroy();
      setScrollbarInstance(null);
      ScrollTrigger.defaults({ scroller: undefined });
      ScrollTrigger.getAll().forEach((st) => st.kill());
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <div ref={containerRef} className="surrounding">
      <div className="scroll-content">{children}</div>
    </div>
  );
}
