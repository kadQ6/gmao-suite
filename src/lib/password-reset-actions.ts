"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublicAppUrl, sendEmail } from "@/lib/mailer";

const TOKEN_TTL_MINUTES = 30;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function requestPasswordResetFromForm(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    redirect("/forgot-password?status=ok");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, active: true, password: true },
  });

  if (user?.active && user.password) {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetLink = getPublicAppUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`);
    await sendEmail({
      to: user.email,
      subject: "Reinitialisation de votre mot de passe K'BIO",
      text: `Bonjour ${user.name},\n\nCliquez sur ce lien pour reinitialiser votre mot de passe:\n${resetLink}\n\nCe lien expire dans ${TOKEN_TTL_MINUTES} minutes.`,
      html: `<p>Bonjour ${user.name},</p><p>Cliquez sur ce lien pour reinitialiser votre mot de passe:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Ce lien expire dans ${TOKEN_TTL_MINUTES} minutes.</p>`,
    });
  }

  redirect("/forgot-password?status=ok");
}

export async function resetPasswordFromForm(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token || !password || password.length < 10 || password !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&err=invalid`);
  }

  const tokenHash = sha256(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { id: true, active: true } },
    },
  });

  if (!record || record.usedAt || record.expiresAt <= new Date() || !record.user.active) {
    redirect("/forgot-password?status=expired");
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=1");
}
