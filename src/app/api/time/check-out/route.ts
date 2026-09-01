import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";

export async function POST() {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const open = await prisma.timeEntry.findFirst({
    where: { userId: user.id, checkOutAt: null },
    orderBy: { checkInAt: "desc" },
  });
  if (!open) {
    return NextResponse.json({ error: "You are not checked in." }, { status: 409 });
  }

  const checkOutAt = new Date();
  if (checkOutAt.getTime() < open.checkInAt.getTime()) {
    return NextResponse.json({ error: "Check-out cannot be before check-in." }, { status: 400 });
  }

  const entry = await prisma.timeEntry.update({
    where: { id: open.id },
    data: { checkOutAt },
  });

  return NextResponse.json({
    entry,
    durationMs: checkOutAt.getTime() - open.checkInAt.getTime(),
  });
}
