"use client";

import { useState } from "react";
import { contactSchema } from "@/lib/validation/contact";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Please check the form and try again");
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError("Something went wrong sending your message. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`contact-form ${className ?? ""}`}>
        <p className="form-status form-status--success" role="status">
          Message sent — our team will get back to you within 24 business hours (IST).
        </p>
      </div>
    );
  }

  return (
    <form className={`contact-form ${className ?? ""}`} onSubmit={handleSubmit}>
      <label className="form-field">
        <input type="text" name="fullName" placeholder="Full Name" required minLength={2} />
      </label>
      <label className="form-field">
        <input type="text" name="companyName" placeholder="Company Name" />
      </label>
      <label className="form-field">
        <input type="email" name="email" placeholder="Your email address" required />
      </label>
      <label className="form-field">
        <textarea name="message" placeholder="How could we help you?" rows={4} required minLength={5} />
      </label>
      {status === "error" && error && (
        <p className="form-status form-status--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="form-submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send Now"}
      </button>
    </form>
  );
}
