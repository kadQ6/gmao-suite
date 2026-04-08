import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "gmao-suite",
    now: new Date().toISOString(),
  });
}
