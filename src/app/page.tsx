import { format } from "date-fns";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CheckInPanel } from "@/components/CheckInPanel";
import { LiveClock } from "@/components/LiveClock";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDuration, startOfWeekMonday, weeklyHoursMs } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const now = new Date();
  const weekStart = startOfWeekMonday(now);
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [open, weekEntries, todayShifts] = await Promise.all([
    prisma.timeEntry.findFirst({
      where: { userId: user.id, checkOutAt: null },
      orderBy: { checkInAt: "desc" },
    }),
    prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        checkInAt: { lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) },
        OR: [{ checkOutAt: null }, { checkOutAt: { gte: weekStart } }],
      },
    }),
    prisma.shift.findMany({
      where: {
        ownerId: user.id,
        status: "SCHEDULED",
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
      },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const weekMs = weeklyHoursMs(weekEntries, weekStart, now);

  return (
    <AppShell name={user.name ?? "Staff"} currentPath="/">
      <div className="mb-6">
        <p className="text-sm text-ink/60">Hello, {user.name}</p>
        <LiveClock />
      </div>
      <CheckInPanel
        initialOpen={open ? { id: open.id, checkInAt: open.checkInAt.toISOString() } : null}
        weekLabel={formatDuration(weekMs)}
      />
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Today on your floor</h2>
        {todayShifts.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No shifts assigned to you today. Open the schedule to add one.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {todayShifts.map((shift) => (
              <li key={shift.id} className="paper-card rounded-2xl px-4 py-3">
                <p className="font-medium">{shift.title}</p>
                <p className="text-sm text-ink/65">
                  {format(shift.startAt, "h:mm a")} – {format(shift.endAt, "h:mm a")}
                  {shift.location ? ` · ${shift.location}` : ""}
                  {shift.recurrence === "WEEKLY" ? " · weekly" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
