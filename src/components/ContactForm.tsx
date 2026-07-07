"use client";

import { type FormHTMLAttributes } from "react";

export default function ContactForm({
  className,
  onSubmit,
  ...rest
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      className={`contact-form ${className ?? ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...rest}
    >
      <label className="form-field">
        <input type="text" name="fullName" placeholder="Full Name" required />
      </label>
      <label className="form-field">
        <input type="text" name="companyName" placeholder="Company Name" />
      </label>
      <label className="form-field">
        <input type="email" name="email" placeholder="Your email address" required />
      </label>
      <label className="form-field">
        <textarea name="message" placeholder="How could we help you?" rows={4} />
      </label>
      <button type="submit" className="form-submit">
        Send Now
      </button>
    </form>
  );
}
