import { Resend } from "resend";

/** Returns null (not a thrown error) when RESEND_API_KEY isn't configured yet. */
export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}
