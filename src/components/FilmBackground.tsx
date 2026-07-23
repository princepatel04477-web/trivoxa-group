"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fixed, full-viewport ambient background film (Remotion-rendered loop) behind
 * page content (see .film-bg z-index). It plays as soon as it mounts — a baked
 * navy poster shows for the first paint, then the (small, 60fps) webm streams in
 * and autoplays. prefers-reduced-motion serves the poster only (no video bytes),
 * and playback pauses when the tab is hidden. The Next app ships only the
 * rendered .webm/.mp4/.jpg — it has no Remotion dependency.
 */
export default function FilmBackground({ film }: { film: string }) {
  const [mode, setMode] = useState<"poster" | "video">("poster");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Always animate once mounted. (The poster is only the SSR/first-paint frame.)
  // These ambient loops are a deliberate brand element, so they play regardless
  // of the OS "reduce motion" setting — otherwise that setting hides the film
  // entirely and the page looks static.
  useEffect(() => {
    setMode("video");
  }, []);

  // Kick playback the moment the element exists / has data, and pause on hide.
  useEffect(() => {
    if (mode !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    const play = () => {
      if (!document.hidden) void v.play().catch(() => {});
    };
    play();
    v.addEventListener("loadeddata", play);
    v.addEventListener("canplay", play);
    const onVis = () => (document.hidden ? v.pause() : play());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      v.removeEventListener("loadeddata", play);
      v.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mode]);

  const poster = `/videos/bg-${film}.jpg`;

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
