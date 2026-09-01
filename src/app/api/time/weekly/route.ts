import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { addDays, formatDuration, startOfWeekMonday, weeklyHoursMs } from "@/lib/time";

export async function GET(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const url = new URL(request.url);
  const weekParam = url.searchParams.get("week");
  const now = new Date();
  const weekStart = startOfWeekMonday(weekParam ? new Date(`${weekParam}T00:00:00`) : now);
  const weekEnd = addDays(weekStart, 7);

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: user.id,
      checkInAt: { lt: weekEnd },
      OR: [{ checkOutAt: null }, { checkOutAt: { gte: weekStart } }],
    },
    orderBy: { checkInAt: "desc" },
  });

  const weekMs = weeklyHoursMs(entries, weekStart, now);

  return NextResponse.json({
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    weekMs,
    weekLabel: formatDuration(weekMs),
    entries: entries.map((entry) => ({
      ...entry,
      durationMs:
        (entry.checkOutAt ?? now).getTime() - entry.checkInAt.getTime(),
    })),
  });
}
