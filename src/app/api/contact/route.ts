import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  organization: z.string().max(200).optional(),
  message: z.string().min(10).max(4000),
});

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { name, email, message } = parsed.data;
  const to = process.env.SMTP_TO ?? "contact@kbio-conseil.com";
  const from = process.env.SMTP_FROM ?? "contact@kbio-conseil.com";

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"K'BIO Site" <${from}>`,
        to,
        replyTo: email,
        subject: `[kbio-conseil.com] Message de ${name}`,
        text: `Nom : ${name}\nEmail : ${email}\n\n${message}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#003f72;padding:24px 32px;border-radius:8px 8px 0 0">
              <h2 style="color:#fff;margin:0;font-size:20px">Nouveau message — kbio-conseil.com</h2>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 8px 8px;background:#fff">
              <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
                <tr><td style="padding:8px 0;font-weight:600;width:90px">Nom</td><td style="padding:8px 0">${name}</td></tr>
                <tr><td style="padding:8px 0;font-weight:600">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#0891b2">${email}</a></td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:16px 0"/>
              <p style="font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap">${message}</p>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0"/>
              <p style="font-size:12px;color:#94a3b8">Répondre directement à cet email pour joindre ${name}.</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("[mail-error]", err);
      return NextResponse.json({ error: "mail_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
