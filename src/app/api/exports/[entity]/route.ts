import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getAssetScopeWhere, getProjectScopeWhere, getWorkOrderScopeWhere } from "@/lib/portal-scope";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ entity: string }> };

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replaceAll("\"", "\"\"")}"`;
  }
  return s;
}

function asCsv(headers: string[], rows: Array<Array<unknown>>) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  return `${lines.join("\n")}\n`;
}

export async function GET(request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { entity } = await params;
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  const ctx = {
    userId: auth.session.user.id,
    role: auth.session.user.role,
    canWrite: true,
  };

  if (entity === "assets-template") {
    const csv = asCsv(
      ["code", "name", "category", "location", "status", "projectCode"],
      [
        ["EQ-001", "Autoclave Bloc A", "Sterilisation", "Bloc A", "OPERATIONAL", "PRJ-001"],
        ["EQ-002", "Moniteur Patient 12", "Monitoring", "Reanimation", "MAINTENANCE", "PRJ-001"],
      ]
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="modele-import-equipements.csv"',
      },
    });
  }

  if (entity === "assets") {
    const where = getAssetScopeWhere(ctx);
    const assets = await prisma.asset.findMany({
      where: projectId ? { ...where, projectId } : where,
      orderBy: { createdAt: "desc" },
      include: { project: { select: { code: true } } },
    });
    const csv = asCsv(
      ["Code", "Nom", "Categorie", "Localisation", "Projet", "Statut"],
      assets.map((a) => [a.code, a.name, a.category, a.location ?? "", a.project?.code ?? "", a.status])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="equipements${projectId ? `-${projectId}` : ""}.csv"`,
      },
    });
  }

  if (entity === "tasks") {
    const projectWhere = getProjectScopeWhere(ctx);
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId, archivedAt: null, project: projectWhere } : { archivedAt: null, project: projectWhere },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { code: true } }, assignee: { select: { name: true } } },
    });
    const csv = asCsv(
      ["Projet", "Titre", "Statut", "Priorite", "Assigne", "Echeance"],
      tasks.map((t) => [t.project.code, t.title, t.status, t.priority, t.assignee?.name ?? "", t.dueDate ?? ""])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="actions${projectId ? `-${projectId}` : ""}.csv"`,
      },
    });
  }

  if (entity === "projects") {
    const where = getProjectScopeWhere(ctx);
    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { name: true } } },
    });
    const csv = asCsv(
      ["Code", "Nom", "Statut", "Priorite", "Progression", "Responsable"],
      projects.map((p) => [p.code, p.name, p.status, p.priority, p.progress, p.owner.name])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="projets.csv"',
      },
    });
  }

  if (entity === "work-orders") {
    const where = getWorkOrderScopeWhere(ctx);
    const rows = await prisma.workOrder.findMany({
      where: projectId ? { ...where, projectId } : where,
      orderBy: { createdAt: "desc" },
      include: { project: { select: { code: true } }, asset: { select: { code: true, name: true } } },
    });
    const csv = asCsv(
      ["Reference", "Titre", "Type", "Statut", "Equipement", "Projet"],
      rows.map((w) => [w.reference, w.title, w.type, w.status, `${w.asset.code} ${w.asset.name}`, w.project?.code ?? ""])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ordres-travail${projectId ? `-${projectId}` : ""}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported export entity" }, { status: 404 });
}
