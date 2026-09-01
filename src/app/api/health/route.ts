import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json({
      ok: true,
      service: "zendenlog",
      database: "mongodb",
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "database unavailable" }, { status: 503 });
  }
}
