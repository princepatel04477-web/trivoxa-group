"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fixed, full-viewport ambient background film (Remotion-rendered loop) that
 * sits behind page content (see .film-bg z-index). Design constraints:
 *  - Lazy: the <video> mounts only after first idle, so it never blocks paint;
 *    a baked-navy poster shows instantly meanwhile.
 *  - prefers-reduced-motion: no video at all — just the still poster.
 *  - Pauses when the tab is hidden (battery/CPU) and resumes on return.
 * The Next app ships only the rendered .webm/.mp4/.jpg; it has no Remotion dep.
 */
export default function FilmBackground({ film }: { film: string }) {
  const [reduced, setReduced] = useState(true); // assume reduced until checked (SSR-safe: poster first)
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idle = 0;
    let timer = 0;
    if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setReady(true), { timeout: 1600 });
    else timer = window.setTimeout(() => setReady(true), 700);
    return () => {
      if (idle && w.cancelIdleCallback) w.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [reduced]);

  useEffect(() => {
    const onVis = () => {
      const v = videoRef.current;
      if (!v) return;
      if (document.hidden) v.pause();
      else void v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [ready]);

  const poster = `/videos/bg-${film}.jpg`;

  return (
    <div className="film-bg" aria-hidden="true">
      {!reduced && ready ? (
        <video
          ref={videoRef}
          className="film-bg__media"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
        >
          <source src={`/videos/bg-${film}.webm`} type="video/webm" />
          <source src={`/videos/bg-${film}.mp4`} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="film-bg__media" src={poster} alt="" />
      )}
      <div className="film-bg__scrim" />
    </div>
  );
}
