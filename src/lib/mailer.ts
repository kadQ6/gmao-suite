import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/** SMTP is usable only when these three are non-empty in the process environment. */
export type SendEmailResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "send_failed" };

export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(host && user && pass);
}

function getBaseUrl() {
  return (
    process.env.APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

export function getPublicAppUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}

export async function sendEmail(input: SendMailInput): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM?.trim() || "no-reply@kbio-conseil.com";

  if (!host || !user || !pass) {
    console.log("[mail-disabled] SMTP_HOST / SMTP_USER / SMTP_PASS manquants — email non envoye", {
      to: input.to,
      subject: input.subject,
    });
    return { ok: false, reason: "not_configured" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { ok: true };
  } catch (error) {
    console.error("[mail-error] echec SMTP (verifiez identifiants, port 587/465, pare-feu)", error);
    return { ok: false, reason: "send_failed" };
  }
}
