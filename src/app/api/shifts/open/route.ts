import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const shifts = await prisma.shift.findMany({
    where: {
      status: "OPEN",
      startAt: { gt: new Date() },
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      givenUpBy: { select: { id: true, name: true } },
      claimedBy: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ shifts });
}
