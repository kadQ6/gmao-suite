import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  organization: z.string().max(200).optional(),
  message: z.string().min(10).max(4000),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Phase A: accept and acknowledge. Wire to email provider (SMTP, Resend, etc.) in a later phase.
  return NextResponse.json({ ok: true });
}
