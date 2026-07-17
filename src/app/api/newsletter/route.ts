import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const schema = z.object({ email: z.string().trim().email() });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email: parsed.data.email }, { onConflict: "email" });
    if (error) {
      return NextResponse.json({ error: "Could not save your subscription" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
