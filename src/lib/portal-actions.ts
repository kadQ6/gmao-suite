"use server";

import { randomUUID } from "node:crypto";
import { TaskStatus, WorkOrderStatus, WorkOrderType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/portal");
  }
  return session.user.id;
}

export async function createProjectFromForm(formData: FormData) {
  const ownerId = await requireUserId();
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!code || !name) {
    redirect("/portal/projects/new?err=required");
  }
  try {
    await prisma.project.create({
      data: {
        code,
        name,
        description,
        ownerId,
      },
    });
  } catch {
    redirect("/portal/projects/new?err=duplicate");
  }
  revalidatePath("/portal");
  revalidatePath("/portal/projects");
  redirect("/portal/projects");
}

export async function createAssetFromForm(formData: FormData) {
  await requireUserId();
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const projectIdRaw = String(formData.get("projectId") ?? "").trim();
  const projectId = projectIdRaw || null;
  if (!code || !name || !category) {
    redirect("/portal/assets/new?err=required");
  }
  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!p) redirect("/portal/assets/new?err=project");
  }
  try {
    await prisma.asset.create({
      data: { code, name, category, location, projectId },
    });
  } catch {
    redirect("/portal/assets/new?err=duplicate");
  }
  revalidatePath("/portal");
  revalidatePath("/portal/assets");
  redirect("/portal/assets");
}

export async function createTaskFromForm(formData: FormData) {
  await requireUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priority = Number.parseInt(String(formData.get("priority") ?? "2"), 10);
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "").trim();
  const assigneeId = assigneeIdRaw || null;
  if (!projectId || !title) {
    if (projectId) {
      redirect(`/portal/projects/${projectId}/tasks/new?err=required`);
    }
    redirect("/portal/projects?err=task");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) {
    redirect("/portal/projects?err=project");
  }
  if (assigneeId) {
    const u = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!u) {
      redirect(`/portal/projects/${projectId}/tasks/new?err=assignee`);
    }
  }
  await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      priority: Number.isFinite(priority) ? Math.min(5, Math.max(1, priority)) : 2,
      assigneeId,
      status: TaskStatus.TODO,
    },
  });
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/tasks`);
  revalidatePath("/portal");
  redirect(`/portal/projects/${projectId}/tasks`);
}

export async function createWorkOrderFromForm(formData: FormData) {
  await requireUserId();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const typeStr = String(formData.get("type") ?? "CORRECTIVE");
  const type = typeStr === "PREVENTIVE" ? WorkOrderType.PREVENTIVE : WorkOrderType.CORRECTIVE;
  const assetId = String(formData.get("assetId") ?? "").trim();
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "").trim();
  const assigneeId = assigneeIdRaw || null;
  const projectIdRaw = String(formData.get("projectId") ?? "").trim();
  const projectId = projectIdRaw || null;
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/portal/work-orders";

  const woFormErr = (code: string) => {
    const q = new URLSearchParams();
    q.set("err", code);
    if (projectId) q.set("projectId", projectId);
    redirect(`/portal/work-orders/new?${q.toString()}`);
  };

  if (!title || !assetId) {
    woFormErr("required");
  }
  const asset = await prisma.asset.findUnique({ where: { id: assetId }, select: { id: true } });
  if (!asset) {
    woFormErr("asset");
  }
  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!p) {
      woFormErr("project");
    }
  }
  if (assigneeId) {
    const u = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!u) {
      woFormErr("assignee");
    }
  }

  const reference = `OT-${randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    await prisma.workOrder.create({
      data: {
        reference,
        title,
        description,
        type,
        status: WorkOrderStatus.OPEN,
        assetId,
        projectId,
        assigneeId,
      },
    });
  } catch {
    woFormErr("duplicate");
  }

  revalidatePath("/portal");
  revalidatePath("/portal/work-orders");
  if (projectId) {
    revalidatePath(`/portal/projects/${projectId}`);
    revalidatePath(`/portal/projects/${projectId}/work-orders`);
  }
  redirect(returnTo);
}
