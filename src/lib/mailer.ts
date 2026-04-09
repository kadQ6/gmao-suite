import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

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

export async function sendEmail(input: SendMailInput) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM || "no-reply@kbio-conseil.com";

  if (!host || !user || !pass) {
    console.log("[mail-disabled]", { to: input.to, subject: input.subject, text: input.text });
    return false;
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
    return true;
  } catch (error) {
    console.error("[mail-error]", error);
    return false;
  }
}
