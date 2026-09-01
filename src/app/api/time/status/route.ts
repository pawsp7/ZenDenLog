import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { formatDuration, startOfWeekMonday, weeklyHoursMs } from "@/lib/time";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const now = new Date();
  const weekStart = startOfWeekMonday(now);
  const open = await prisma.timeEntry.findFirst({
    where: { userId: user.id, checkOutAt: null },
    orderBy: { checkInAt: "desc" },
  });
  const weekEntries = await prisma.timeEntry.findMany({
    where: {
      userId: user.id,
      checkInAt: { lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) },
      OR: [{ checkOutAt: null }, { checkOutAt: { gte: weekStart } }],
    },
  });

  const weekMs = weeklyHoursMs(weekEntries, weekStart, now);

  return NextResponse.json({
    now: now.toISOString(),
    openEntry: open,
    weekStart: weekStart.toISOString(),
    weekMs,
    weekLabel: formatDuration(weekMs),
  });
}
