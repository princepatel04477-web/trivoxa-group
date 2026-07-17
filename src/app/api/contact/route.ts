import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getResend } from "@/lib/email/resend";
import { contactSchema } from "@/lib/validation/contact";

const SALES_EMAIL = "sales@trivoxagroup.com";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;
  const reference = `TVX-MSG-${randomUUID().split("-")[0].toUpperCase()}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("contact_submissions").insert({
      reference,
      full_name: data.fullName,
      company_name: data.companyName || null,
      email: data.email,
      message: data.message,
    });
    if (error) {
      return NextResponse.json({ error: "Could not save your message" }, { status: 500 });
    }
  }

  const resend = getResend();
  if (resend) {
    await resend.emails.send({
      from: "Trivoxa Group <no-reply@trivoxagroup.com>",
      to: SALES_EMAIL,
      subject: `New contact form message — ${reference}`,
      html: `<p><strong>${data.fullName}</strong> (${data.email})${data.companyName ? ` — ${data.companyName}` : ""}</p><p>${data.message}</p>`,
    });
  }

  return NextResponse.json({ reference });
}
