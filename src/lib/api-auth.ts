import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canWriteData, isAdminRole } from "@/lib/rbac";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}

export async function requireAdminSession() {
  const auth = await requireSession();
  if (!auth.ok) return auth;

  if (!isAdminRole(auth.session.user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}

export async function requireWritableSession() {
  const auth = await requireSession();
  if (!auth.ok) return auth;

  if (!canWriteData(auth.session.user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden: read-only account" }, { status: 403 }),
    };
  }

  return auth;
}
