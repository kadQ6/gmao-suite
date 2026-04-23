import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "psa-data");
const FILE = path.join(DIR, "audit-data.json");

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true }).catch(() => {});
}

export async function GET() {
  try {
    await ensureDir();
    const raw = await fs.readFile(FILE, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDir();
    const body = await req.json();
    const tmp = FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(body));
    await fs.rename(tmp, FILE);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
