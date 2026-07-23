"use client";

import { useState, type FormEvent } from "react";

export interface TeaserTopic {
  title: string;
  category: string;
  readingTime: string;
  description: string;
}

/** Honest pre-launch Insights (spec §4): the articles aren't written yet, so
 * instead of dead "Read Insight" links this renders the planned topics with
 * vote checkboxes + email capture. Votes ride along with the subscription to
 * the team, so what gets written first is genuinely reader-driven. */
export default function InsightsTeaser({ topics }: { topics: TeaserTopic[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const toggle = (title: string) =>
    setPicked((cur) => (cur.includes(title) ? cur.filter((t) => t !== title) : [...cur, title]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topics: picked }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="insights-teaser">
      <div className="insights-teaser__grid">
        {topics.map((t) => {
          const isPicked = picked.includes(t.title);
          return (
            <article key={t.title} className={`insights-teaser__card${isPicked ? " is-picked" : ""}`}>
              <header>
                <span className="insights-teaser__tag">{t.category}</span>
                <span className="insights-teaser__time">{t.readingTime}</span>
              </header>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <label className="insights-teaser__vote">
                <input type="checkbox" checked={isPicked} onChange={() => toggle(t.title)} />
                <span>{isPicked ? "On your reading list" : "I want to read this"}</span>
              </label>
            </article>
          );
        })}
      </div>

      {state === "done" ? (
        <p className="insights-teaser__thanks" role="status">
          Thanks — you&rsquo;re on the list{picked.length > 0 ? ` and your ${picked.length === 1 ? "vote" : "votes"} reached the team` : ""}.
          First dispatch lands in your inbox when these publish.
        </p>
      ) : (
        <form className="insights-teaser__form" onSubmit={submit}>
          <p className="insights-teaser__form-lead">
            {picked.length > 0
              ? `Get notified when ${picked.length === 1 ? "this topic publishes" : "these topics publish"}:`
              : "Get notified when the first insights publish:"}
          </p>
          <div className="insights-teaser__form-row">
            <input
              type="email"
              required
              placeholder="Your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button type="submit" disabled={state === "busy"} data-analytics="insights-teaser-subscribe">
              {state === "busy" ? "Sending…" : "Notify me"}
            </button>
          </div>
          {state === "error" && (
            <p className="insights-teaser__error" role="alert">
              Could not subscribe right now — please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
