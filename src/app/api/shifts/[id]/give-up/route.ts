import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";

const bodySchema = z.object({
  scope: z.enum(["this", "future"]).default("this"),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({ scope: "this" }));
  const parsed = bodySchema.safeParse(body);
  const scope = parsed.success ? parsed.data.scope : "this";

  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift) {
    return NextResponse.json({ error: "Shift not found." }, { status: 404 });
  }
  if (shift.ownerId !== user.id) {
    return NextResponse.json({ error: "You can only give up your own shifts." }, { status: 403 });
  }
  if (shift.status !== "SCHEDULED") {
    return NextResponse.json({ error: "That shift is not on your schedule." }, { status: 409 });
  }
  if (shift.startAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Past or in-progress shifts cannot be given up." }, { status: 409 });
  }

  const now = new Date();
  const where =
    scope === "future" && shift.seriesId
      ? {
          seriesId: shift.seriesId,
          ownerId: user.id,
          status: "SCHEDULED",
          startAt: { gte: shift.startAt },
        }
      : { id: shift.id };

  const result = await prisma.shift.updateMany({
    where,
    data: {
      status: "OPEN",
      ownerId: null,
      givenUpById: user.id,
      givenUpAt: now,
    },
  });

  return NextResponse.json({ ok: true, released: result.count });
}
