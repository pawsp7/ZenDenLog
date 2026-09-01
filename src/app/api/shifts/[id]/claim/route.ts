import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const { id } = await context.params;

  try {
    const claimed = await prisma.$transaction(async (tx) => {
      const shift = await tx.shift.findUnique({ where: { id } });
      if (!shift) {
        throw new Error("NOT_FOUND");
      }
      if (shift.status !== "OPEN") {
        throw new Error("NOT_OPEN");
      }
      if (shift.startAt.getTime() <= Date.now()) {
        throw new Error("PAST");
      }

      return tx.shift.update({
        where: { id: shift.id },
        data: {
          status: "SCHEDULED",
          ownerId: user.id,
          claimedById: user.id,
          claimedAt: new Date(),
        },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          givenUpBy: { select: { id: true, name: true } },
          claimedBy: { select: { id: true, name: true } },
        },
      });
    });

    return NextResponse.json({ shift: claimed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") {
      return NextResponse.json({ error: "Shift not found." }, { status: 404 });
    }
    if (message === "NOT_OPEN") {
      return NextResponse.json({ error: "That shift is no longer available." }, { status: 409 });
    }
    if (message === "PAST") {
      return NextResponse.json({ error: "That shift has already started." }, { status: 409 });
    }
    throw error;
  }
}
