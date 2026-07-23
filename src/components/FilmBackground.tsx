"use client";

import { useEffect, useRef, useState } from "react";

/** Bump when the rendered videos change, to bust any stale browser/CDN cache. */
const V = 3;

/**
 * Fixed, full-viewport ambient background film (Remotion-rendered loop) behind
 * page content (see .film-bg z-index). A baked navy poster shows for first
 * paint, then the small 60fps webm streams in and autoplays. Robust to blocked
 * autoplay (Brave etc.): if autoplay is refused, the first user interaction
 * starts it. Pauses when the tab is hidden. The Next app ships only the
 * rendered .webm/.mp4/.jpg — no Remotion dependency.
 */
export default function FilmBackground({ film }: { film: string }) {
  const [mode, setMode] = useState<"poster" | "video">("poster");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mount the video on the client (SSR renders the poster only).
  useEffect(() => {
    setMode("video");
  }, []);

  useEffect(() => {
    if (mode !== "video") return;
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      if (!document.hidden) return v.play().catch(() => {});
    };
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("canplay", tryPlay);

    // Autoplay may be blocked (browser policy / privacy shields). Resume on the
    // first user gesture, then stop listening.
    const resume = () => {
      void v.play().catch(() => {});
      if (!v.paused) removeGestures();
    };
    const gestures = ["pointerdown", "keydown", "scroll", "touchstart", "wheel", "mousemove"] as const;
    const removeGestures = () => gestures.forEach((g) => window.removeEventListener(g, resume));
    gestures.forEach((g) => window.addEventListener(g, resume, { passive: true }));

    const onVis = () => (document.hidden ? v.pause() : tryPlay());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
      removeGestures();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mode]);

  const poster = `/videos/bg-${film}.jpg?v=${V}`;

  return (
    <div className="film-bg" aria-hidden="true">
      {mode === "video" ? (
        <video
          ref={videoRef}
          className="film-bg__media"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
        >
          <source src={`/videos/bg-${film}.webm?v=${V}`} type="video/webm" />
          <source src={`/videos/bg-${film}.mp4?v=${V}`} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="film-bg__media" src={poster} alt="" />
      )}
      <div className="film-bg__scrim" />
    </div>
  );
}
