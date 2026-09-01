import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";

export async function POST() {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const open = await prisma.timeEntry.findFirst({
    where: { userId: user.id, checkOutAt: null },
  });
  if (open) {
    return NextResponse.json(
      { error: "You are already checked in.", entry: open },
      { status: 409 },
    );
  }

  const entry = await prisma.timeEntry.create({
    data: {
      userId: user.id,
      checkInAt: new Date(),
    },
  });

  return NextResponse.json({ entry });
}
