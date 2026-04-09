"use server";

import { randomUUID } from "node:crypto";
import { ProjectStatus, RemarkTab, TaskStatus, WorkOrderStatus, WorkOrderType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWriteData } from "@/lib/rbac";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/portal");
  }
  return session.user.id;
}

async function requireWritableUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/portal");
  }
  if (!canWriteData(session.user.role)) {
    redirect("/portal");
  }
  return session.user.id;
}

export async function createProjectFromForm(formData: FormData) {
  const ownerId = await requireWritableUserId();
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const clientIdRaw = String(formData.get("clientId") ?? "").trim();
  const clientId = clientIdRaw || null;
  if (!code || !name) {
    redirect("/portal/projects/new?err=required");
  }
  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) {
      redirect("/portal/projects/new?err=client");
    }
  }

  const generatedCode = `KBIO-${randomUUID().slice(0, 8).toUpperCase()}`;
  let createdProjectId = "";
  try {
    const created = await prisma.project.create({
      data: { code, name, description, ownerId },
      select: { id: true },
    });
    createdProjectId = created.id;

    if (clientId) {
      await prisma.projectClient.upsert({
        where: { projectId_clientId: { projectId: createdProjectId, clientId } },
        update: {},
        create: { projectId: createdProjectId, clientId },
      });
      await prisma.clientPortalAccessCode.upsert({
        where: { clientId_projectId: { clientId, projectId: createdProjectId } },
        update: { code: generatedCode, active: true },
        create: { clientId, projectId: createdProjectId, code: generatedCode, generatedBy: ownerId },
      });
    }
  } catch {
    redirect("/portal/projects/new?err=duplicate");
  }
  revalidatePath("/portal");
  revalidatePath("/portal/projects");
  if (createdProjectId) revalidatePath(`/portal/projects/${createdProjectId}`);
  redirect(createdProjectId ? `/portal/projects/${createdProjectId}?created=1` : "/portal/projects");
}

export async function createAssetFromForm(formData: FormData) {
  await requireWritableUserId();
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
  await requireWritableUserId();
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
  await requireWritableUserId();
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

export async function cancelProjectFromForm(formData: FormData) {
  await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) redirect("/portal/projects");

  await prisma.project.update({
    where: { id: projectId },
    data: { status: ProjectStatus.CANCELLED },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/projects");
  revalidatePath(`/portal/projects/${projectId}`);
  redirect("/portal/projects");
}

export async function deleteProjectFromForm(formData: FormData) {
  await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) redirect("/portal/projects");

  await prisma.project.updateMany({
    where: { id: projectId },
    data: {
      status: ProjectStatus.CANCELLED,
      archivedAt: new Date(),
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/projects");
  redirect("/portal/projects");
}

export async function deleteTaskFromForm(formData: FormData) {
  await requireWritableUserId();
  const taskId = String(formData.get("taskId") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!taskId || !projectId) redirect("/portal/projects");

  await prisma.task.updateMany({
    where: { id: taskId, projectId },
    data: { archivedAt: new Date() },
  });
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/tasks`);
  revalidatePath("/portal/projects");
  redirect(`/portal/projects/${projectId}/tasks`);
}

export async function deleteAssetFromForm(formData: FormData) {
  await requireWritableUserId();
  const assetId = String(formData.get("assetId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/portal/assets";
  if (!assetId) redirect(returnTo);

  await prisma.asset.updateMany({
    where: { id: assetId },
    data: {
      archivedAt: new Date(),
      visibleToClient: false,
      status: "ARCHIVED",
    },
  });
  revalidatePath("/portal/assets");
  if (returnTo.includes("/portal/projects/")) revalidatePath(returnTo);
  redirect(returnTo);
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  let quoted = false;

  while (i < line.length) {
    const ch = line[i];
    if (ch === "\"") {
      if (quoted && line[i + 1] === "\"") {
        cur += "\"";
        i += 2;
        continue;
      }
      quoted = !quoted;
      i += 1;
      continue;
    }
    if (ch === "," && !quoted) {
      out.push(cur.trim());
      cur = "";
      i += 1;
      continue;
    }
    cur += ch;
    i += 1;
  }
  out.push(cur.trim());
  return out;
}

export async function importAssetsFromCsv(formData: FormData) {
  await requireWritableUserId();
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/portal/assets";
  const forcedProjectIdRaw = String(formData.get("projectId") ?? "").trim();
  const forcedProjectId = forcedProjectIdRaw || null;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}err=empty-file`);
  }

  const text = await file.text();
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rawLines.length < 2) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}err=no-data`);
  }

  const header = parseCsvLine(rawLines[0]).map((h) => h.toLowerCase());
  const idx = {
    code: header.indexOf("code"),
    name: header.indexOf("name"),
    category: header.indexOf("category"),
    location: header.indexOf("location"),
    status: header.indexOf("status"),
    projectCode: header.indexOf("projectcode"),
  };
  if (idx.code < 0 || idx.name < 0 || idx.category < 0) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}err=bad-header`);
  }

  const allowedStatuses = new Set(["OPERATIONAL", "MAINTENANCE", "OUT_OF_SERVICE", "RETIRED"]);

  const projectByCode = new Map<string, string>();
  if (!forcedProjectId) {
    const projects = await prisma.project.findMany({ select: { id: true, code: true } });
    for (const p of projects) projectByCode.set(p.code.toLowerCase(), p.id);
  }

  const inputCodes: string[] = [];
  for (let i = 1; i < rawLines.length; i += 1) {
    const row = parseCsvLine(rawLines[i]);
    const code = (row[idx.code] ?? "").trim();
    if (code) inputCodes.push(code);
  }
  const existing = await prisma.asset.findMany({
    where: { code: { in: inputCodes } },
    select: { code: true },
  });
  const existingCodes = new Set(existing.map((a) => a.code));
  const seenCodes = new Set<string>();
  let created = 0;
  let updated = 0;
  let ignored = 0;
  let invalidStatus = 0;

  for (let i = 1; i < rawLines.length; i += 1) {
    const row = parseCsvLine(rawLines[i]);
    const code = (row[idx.code] ?? "").trim();
    const name = (row[idx.name] ?? "").trim();
    const category = (row[idx.category] ?? "").trim();
    if (!code || !name || !category) {
      ignored += 1;
      continue;
    }

    const rawStatus = idx.status >= 0 ? (row[idx.status] ?? "").trim().toUpperCase() : "OPERATIONAL";
    const status = rawStatus || "OPERATIONAL";
    if (!allowedStatuses.has(status)) {
      ignored += 1;
      invalidStatus += 1;
      continue;
    }

    let projectId: string | null = forcedProjectId;
    if (!projectId && idx.projectCode >= 0) {
      const projectCode = (row[idx.projectCode] ?? "").trim().toLowerCase();
      projectId = projectCode ? projectByCode.get(projectCode) ?? null : null;
    }

    const existed = existingCodes.has(code) || seenCodes.has(code);

    await prisma.asset.upsert({
      where: { code },
      update: {
        name,
        category,
        location: idx.location >= 0 ? (row[idx.location] ?? "").trim() || null : null,
        status,
        projectId,
        archivedAt: null,
      },
      create: {
        code,
        name,
        category,
        location: idx.location >= 0 ? (row[idx.location] ?? "").trim() || null : null,
        status,
        projectId,
      },
    });
    seenCodes.add(code);
    if (existed) updated += 1;
    else created += 1;
  }

  revalidatePath("/portal");
  revalidatePath("/portal/assets");
  if (returnTo.includes("/portal/projects/")) revalidatePath(returnTo);
  const q = new URLSearchParams();
  q.set("created", String(created));
  q.set("updated", String(updated));
  q.set("ignored", String(ignored));
  q.set("invalidStatus", String(invalidStatus));
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}importReport=${encodeURIComponent(q.toString())}`);
}

const REMARK_TAB_VALUES = new Set<RemarkTab>([
  RemarkTab.OVERVIEW,
  RemarkTab.TASKS,
  RemarkTab.ASSETS,
  RemarkTab.WORK_ORDERS,
]);

export async function createProjectRemarkFromForm(formData: FormData) {
  const userId = await requireUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const tabRaw = String(formData.get("tab") ?? "").trim().toUpperCase();
  const tab = tabRaw as RemarkTab;
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/portal/projects";
  const body = String(formData.get("body") ?? "").trim();

  if (!projectId || !REMARK_TAB_VALUES.has(tab) || !body) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}remarkErr=required`);
  }
  if (body.length > 2000) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}remarkErr=too-long`);
  }

  await prisma.projectRemark.create({
    data: {
      projectId,
      tab,
      body,
      createdById: userId,
    },
  });

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/tasks`);
  revalidatePath(`/portal/projects/${projectId}/assets`);
  revalidatePath(`/portal/projects/${projectId}/work-orders`);
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}remarkOk=1`);
}
