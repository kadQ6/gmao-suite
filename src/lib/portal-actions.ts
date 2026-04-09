"use server";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { ProjectStatus, RemarkTab, Role, TaskStatus, WorkOrderStatus, WorkOrderType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ENTITY_CODE_PATTERN, normalizeWhitespace, toUpperCode } from "@/lib/form-validators";
import { getPublicAppUrl, sendEmail } from "@/lib/mailer";
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

function generateTemporaryPassword() {
  // Includes upper/lower/numeric/symbol characters for basic complexity.
  return `Kb!${randomUUID().slice(0, 8)}A9`;
}

export async function createProjectFromForm(formData: FormData) {
  const ownerId = await requireWritableUserId();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientContactName = String(formData.get("clientContactName") ?? "").trim();
  const clientContactEmail = String(formData.get("clientContactEmail") ?? "").trim().toLowerCase();
  const clientContactPhone = String(formData.get("clientContactPhone") ?? "").trim();
  const normalizedProjectName = name.replace(/\s+/g, " ").trim();
  const normalizedClientName = clientName.replace(/\s+/g, " ").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+()\-.\s]{7,40}$/;

  if (!code || !name) {
    redirect("/portal/projects/new?err=required");
  }
  if (!ENTITY_CODE_PATTERN.test(code)) {
    redirect("/portal/projects/new?err=project-code-format");
  }
  if (normalizedProjectName.length < 3) {
    redirect("/portal/projects/new?err=project-name-format");
  }
  const existingProject = await prisma.project.findFirst({
    where: { code, archivedAt: null },
    select: { id: true },
  });
  if (existingProject) {
    redirect("/portal/projects/new?err=project-code-used");
  }
  const existingProjectName = await prisma.project.findFirst({
    where: { name: { equals: normalizedProjectName, mode: "insensitive" }, archivedAt: null },
    select: { id: true },
  });
  if (existingProjectName) {
    redirect("/portal/projects/new?err=project-name-used");
  }
  const wantsClient = Boolean(clientName || clientContactName || clientContactEmail || clientContactPhone);
  if (wantsClient && !normalizedClientName) {
    redirect("/portal/projects/new?err=client-name-required");
  }
  if (wantsClient && (!clientContactName || !clientContactEmail)) {
    redirect("/portal/projects/new?err=client-contact-required");
  }
  if (wantsClient && !emailRegex.test(clientContactEmail)) {
    redirect("/portal/projects/new?err=client-contact-email-format");
  }
  if (wantsClient && clientContactPhone && !phoneRegex.test(clientContactPhone)) {
    redirect("/portal/projects/new?err=client-contact-phone-format");
  }
  if (wantsClient) {
    const existingClientByName = await prisma.client.findFirst({
      where: { name: { equals: normalizedClientName, mode: "insensitive" } },
      select: { id: true },
    });
    if (existingClientByName) {
      redirect("/portal/projects/new?err=client-name-used");
    }
  }

  const generatedCode = `KBIO-${randomUUID().slice(0, 8).toUpperCase()}`;
  let createdProjectId = "";
  let mailStatus: "ok" | "not-configured" | "failed" = "ok";
  try {
    const created = await prisma.project.create({
      data: { code, name, description, ownerId },
      select: { id: true },
    });
    createdProjectId = created.id;

    if (wantsClient) {
      const normalizedClientCode = `CLT-${normalizedClientName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24) || randomUUID().slice(0, 8).toUpperCase()}`;
      const client = await prisma.client.create({
        data: {
          code: `${normalizedClientCode}-${randomUUID().slice(0, 4).toUpperCase()}`,
          name: normalizedClientName,
        },
        select: { id: true, code: true },
      });

      await prisma.projectClient.upsert({
        where: { projectId_clientId: { projectId: createdProjectId, clientId: client.id } },
        update: {},
        create: { projectId: createdProjectId, clientId: client.id },
      });
      const existingUser = await prisma.user.findUnique({
        where: { email: clientContactEmail },
        select: { id: true, role: true, name: true },
      });
      if (existingUser && existingUser.role !== Role.CLIENT) {
        redirect("/portal/projects/new?err=client-contact-email-used");
      }
      const isNewClientUser = !existingUser;
      const temporaryPassword = isNewClientUser ? generateTemporaryPassword() : null;
      const temporaryHash = temporaryPassword ? await bcrypt.hash(temporaryPassword, 10) : null;
      const clientUser = existingUser
        ? await prisma.user.update({
            where: { id: existingUser.id },
            data: { active: true },
            select: { id: true, email: true, name: true },
          })
        : await prisma.user.create({
            data: {
              email: clientContactEmail,
              name: clientContactName,
              role: Role.CLIENT,
              password: temporaryHash,
              active: true,
            },
            select: { id: true, email: true, name: true },
          });
      await prisma.clientUser.upsert({
        where: { clientId_userId: { clientId: client.id, userId: clientUser.id } },
        update: {},
        create: { clientId: client.id, userId: clientUser.id },
      });
      await prisma.clientPortalAccessCode.upsert({
        where: { clientId_projectId: { clientId: client.id, projectId: createdProjectId } },
        update: { code: generatedCode, active: true },
        create: { clientId: client.id, projectId: createdProjectId, code: generatedCode, generatedBy: ownerId },
      });
      const loginUrl = getPublicAppUrl("/login");
      const forgotUrl = getPublicAppUrl("/forgot-password");
      const phoneLine = clientContactPhone ? `Telephone: ${clientContactPhone}\n` : "";
      const mailResult = await sendEmail({
        to: clientContactEmail,
        subject: `Acces portail K'BIO - Projet ${code}`,
        text:
          `Bonjour ${clientContactName},\n\n` +
          `Votre acces au portail K'BIO est actif.\n\n` +
          `Projet: ${code} - ${name}\n` +
          `Email: ${clientContactEmail}\n` +
          `${temporaryPassword ? `Mot de passe temporaire: ${temporaryPassword}\n` : ""}` +
          `Code d'acces client: ${generatedCode}\n` +
          `${phoneLine}\n` +
          `Connexion: ${loginUrl}\n` +
          `Mot de passe oublie: ${forgotUrl}\n\n` +
          `Pour reinitialiser un mot de passe perdu : saisir deux fois le meme email, puis le code projet (${code}).`,
      });
      if (!mailResult.ok) {
        mailStatus = mailResult.reason === "not_configured" ? "not-configured" : "failed";
      }
    }
  } catch {
    redirect("/portal/projects/new?err=duplicate");
  }
  revalidatePath("/portal");
  revalidatePath("/portal/projects");
  if (createdProjectId) revalidatePath(`/portal/projects/${createdProjectId}`);
  const q = new URLSearchParams();
  q.set("created", "1");
  if (mailStatus === "ok") q.set("credentials", "1");
  if (mailStatus === "not-configured") q.set("mail", "not-configured");
  else if (mailStatus === "failed") q.set("mail", "failed");
  redirect(createdProjectId ? `/portal/projects/${createdProjectId}?${q.toString()}` : "/portal/projects");
}

export async function resendProjectClientCredentialsFromForm(formData: FormData) {
  await requireWritableUserId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) redirect("/portal/projects");

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { id: true, code: true, name: true },
  });
  if (!project) redirect("/portal/projects");

  const accessRows = await prisma.clientPortalAccessCode.findMany({
    where: { projectId, active: true },
    include: {
      client: {
        include: {
          users: {
            include: {
              user: {
                select: { id: true, email: true, name: true, role: true },
              },
            },
          },
        },
      },
    },
  });

  if (accessRows.length === 0) {
    redirect(`/portal/projects/${projectId}?resent=fail&resentReason=no-access`);
  }

  const loginUrl = getPublicAppUrl("/login");
  const forgotUrl = getPublicAppUrl("/forgot-password");

  let emailedAnyone = false;
  let anySent = false;
  let anyFailed = false;
  let failNotConfigured = false;
  let failSend = false;

  for (const row of accessRows) {
    const accessCode = row.code;
    for (const cu of row.client.users) {
      const u = cu.user;
      if (u.role !== Role.CLIENT) continue;
      emailedAnyone = true;
      const temporaryPassword = generateTemporaryPassword();
      const temporaryHash = await bcrypt.hash(temporaryPassword, 10);
      const mailResult = await sendEmail({
        to: u.email,
        subject: `Acces portail K'BIO - Projet ${project.code}`,
        text:
          `Bonjour ${u.name},\n\n` +
          `Voici vos identifiants d'acces au portail K'BIO (envoi ou renvoi).\n\n` +
          `Projet: ${project.code} - ${project.name}\n` +
          `Email: ${u.email}\n` +
          `Mot de passe temporaire: ${temporaryPassword}\n` +
          `Code d'acces client: ${accessCode}\n\n` +
          `Connexion: ${loginUrl}\n` +
          `Mot de passe oublie: ${forgotUrl}\n\n` +
          `Pour reinitialiser un mot de passe perdu : saisir deux fois le meme email, puis le code projet (${project.code}).`,
        html:
          `<p>Bonjour ${u.name},</p>` +
          `<p>Voici vos identifiants d&apos;acces au portail K&apos;BIO (envoi ou renvoi).</p>` +
          `<p><strong>Projet:</strong> ${project.code} - ${project.name}<br/>` +
          `<strong>Email:</strong> ${u.email}<br/>` +
          `<strong>Mot de passe temporaire:</strong> ${temporaryPassword}<br/>` +
          `<strong>Code d&apos;acces client:</strong> ${accessCode}</p>` +
          `<p><a href="${loginUrl}">Connexion</a> · <a href="${forgotUrl}">Mot de passe oublie</a></p>` +
          `<p class="small">Pour reinitialiser : deux fois le meme email + code projet (${project.code}).</p>`,
      });
      if (mailResult.ok) {
        await prisma.user.update({
          where: { id: u.id },
          data: { password: temporaryHash },
        });
        anySent = true;
      } else {
        anyFailed = true;
        if (mailResult.reason === "not_configured") failNotConfigured = true;
        else failSend = true;
      }
    }
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/projects");

  if (!emailedAnyone) {
    redirect(`/portal/projects/${projectId}?resent=fail&resentReason=no-client-user`);
  }
  if (anyFailed && !anySent) {
    if (failNotConfigured && !failSend) {
      redirect(`/portal/projects/${projectId}?resent=fail&resentReason=smtp-not-configured`);
    }
    redirect(`/portal/projects/${projectId}?resent=fail&resentReason=smtp`);
  }
  if (anyFailed && anySent) {
    redirect(`/portal/projects/${projectId}?resent=partial`);
  }
  redirect(`/portal/projects/${projectId}?resent=ok`);
}

export async function createAssetFromForm(formData: FormData) {
  await requireWritableUserId();
  const code = toUpperCode(String(formData.get("code") ?? ""));
  const name = normalizeWhitespace(String(formData.get("name") ?? ""));
  const category = normalizeWhitespace(String(formData.get("category") ?? ""));
  const locationRaw = String(formData.get("location") ?? "").trim();
  const location = locationRaw ? normalizeWhitespace(locationRaw) : null;
  const projectIdRaw = String(formData.get("projectId") ?? "").trim();
  const projectId = projectIdRaw || null;
  if (!code || !name || !category) {
    redirect("/portal/assets/new?err=required");
  }
  if (!ENTITY_CODE_PATTERN.test(code)) {
    redirect("/portal/assets/new?err=asset-code-format");
  }
  if (name.length < 3) {
    redirect("/portal/assets/new?err=asset-name-format");
  }
  if (category.length < 2 || category.length > 120) {
    redirect("/portal/assets/new?err=asset-category-format");
  }
  if (location && location.length > 200) {
    redirect("/portal/assets/new?err=asset-location-format");
  }
  if (projectId) {
    const p = await prisma.project.findFirst({
      where: { id: projectId, archivedAt: null },
      select: { id: true },
    });
    if (!p) redirect("/portal/assets/new?err=project");
  }
  const codeTaken = await prisma.asset.findFirst({
    where: { code, archivedAt: null },
    select: { id: true },
  });
  if (codeTaken) {
    redirect("/portal/assets/new?err=asset-code-used");
  }
  if (projectId) {
    const nameTaken = await prisma.asset.findFirst({
      where: {
        projectId,
        archivedAt: null,
        name: { equals: name, mode: "insensitive" },
      },
      select: { id: true },
    });
    if (nameTaken) {
      redirect("/portal/assets/new?err=asset-name-used");
    }
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
  const title = normalizeWhitespace(String(formData.get("title") ?? ""));
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw ? descriptionRaw.slice(0, 4000) : null;
  const priority = Number.parseInt(String(formData.get("priority") ?? "2"), 10);
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "").trim();
  const assigneeId = assigneeIdRaw || null;
  if (!projectId || !title) {
    if (projectId) {
      redirect(`/portal/projects/${projectId}/tasks/new?err=required`);
    }
    redirect("/portal/projects?err=task");
  }
  if (title.length < 3) {
    redirect(`/portal/projects/${projectId}/tasks/new?err=task-title-format`);
  }
  if (title.length > 500) {
    redirect(`/portal/projects/${projectId}/tasks/new?err=task-title-format`);
  }
  const project = await prisma.project.findFirst({
    where: { id: projectId, archivedAt: null },
    select: { id: true },
  });
  if (!project) {
    redirect("/portal/projects?err=project");
  }
  const duplicateTitle = await prisma.task.findFirst({
    where: {
      projectId,
      archivedAt: null,
      title: { equals: title, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (duplicateTitle) {
    redirect(`/portal/projects/${projectId}/tasks/new?err=task-title-used`);
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
  const title = normalizeWhitespace(String(formData.get("title") ?? ""));
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw ? descriptionRaw.slice(0, 4000) : null;
  const typeStr = String(formData.get("type") ?? "CORRECTIVE");
  const type = typeStr === "PREVENTIVE" ? WorkOrderType.PREVENTIVE : WorkOrderType.CORRECTIVE;
  const assetId = String(formData.get("assetId") ?? "").trim();
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "").trim();
  const assigneeId = assigneeIdRaw || null;
  const projectIdRaw = String(formData.get("projectId") ?? "").trim();
  const projectId = projectIdRaw || null;
  const returnTo = String(formData.get("returnTo") ?? "").trim() || "/portal/work-orders";

  const woFormErr = (code: string): never => {
    const q = new URLSearchParams();
    q.set("err", code);
    if (projectId) q.set("projectId", projectId);
    redirect(`/portal/work-orders/new?${q.toString()}`);
  };

  if (!title || !assetId) {
    woFormErr("required");
  }
  if (title.length < 3 || title.length > 300) {
    woFormErr("wo-title-format");
  }
  const assetRow = await prisma.asset.findFirst({
    where: { id: assetId, archivedAt: null },
    select: { id: true, projectId: true },
  });
  if (!assetRow) {
    woFormErr("asset-inactive");
  }
  const asset = assetRow as NonNullable<typeof assetRow>;
  if (projectId) {
    const p = await prisma.project.findFirst({
      where: { id: projectId, archivedAt: null },
      select: { id: true },
    });
    if (!p) {
      woFormErr("project");
    }
    if (asset.projectId && asset.projectId !== projectId) {
      woFormErr("asset-project-mismatch");
    }
  }
  if (assigneeId) {
    const u = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!u) {
      woFormErr("assignee");
    }
  }
  const duplicateWo = await prisma.workOrder.findFirst({
    where: projectId
      ? { projectId, assetId, title: { equals: title, mode: "insensitive" } }
      : { projectId: null, assetId, title: { equals: title, mode: "insensitive" } },
    select: { id: true },
  });
  if (duplicateWo) {
    woFormErr("wo-title-used");
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

  try {
    await prisma.$transaction(async (tx) => {
      const clientIds = [
        ...new Set(
          (await tx.projectClient.findMany({ where: { projectId }, select: { clientId: true } })).map(
            (r) => r.clientId,
          ),
        ),
      ];

      const assetIds = (
        await tx.asset.findMany({ where: { projectId }, select: { id: true } })
      ).map((a) => a.id);

      await tx.workOrder.deleteMany({
        where:
          assetIds.length > 0
            ? { OR: [{ projectId }, { assetId: { in: assetIds } }] }
            : { projectId },
      });

      await tx.asset.deleteMany({ where: { projectId } });
      await tx.project.delete({ where: { id: projectId } });

      for (const clientId of clientIds) {
        const stillLinked = await tx.projectClient.count({ where: { clientId } });
        if (stillLinked > 0) continue;
        await tx.client.delete({ where: { id: clientId } });
      }
    });
  } catch {
    redirect("/portal/projects?err=delete-failed");
  }

  revalidatePath("/portal");
  revalidatePath("/portal/projects");
  redirect("/portal/projects?deleted=1");
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
