import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AddShiftForm } from "@/components/AddShiftForm";
import { GiveUpButton } from "@/components/ShiftActions";
import { LocalDate } from "@/components/LocalDate";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { addDays, startOfWeekMonday, toDateInputValue } from "@/lib/time";

export const dynamic = "force-dynamic";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const weekStart = startOfWeekMonday(params.week ? new Date(`${params.week}T00:00:00`) : now);
  const weekEnd = addDays(weekStart, 7);
  const prev = toDateInputValue(addDays(weekStart, -7));
  const next = toDateInputValue(addDays(weekStart, 7));

  const shifts = await prisma.shift.findMany({
    where: {
      status: { in: ["SCHEDULED", "OPEN"] },
      startAt: { lt: weekEnd },
      endAt: { gt: weekStart },
    },
    include: {
      owner: { select: { id: true, name: true } },
      givenUpBy: { select: { name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  const days = dayNames.map((label, index) => {
    const date = addDays(weekStart, index);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = addDays(dayStart, 1);
    return {
      label,
      date,
      shifts: shifts.filter((shift) => shift.startAt < dayEnd && shift.endAt > dayStart),
    };
  });

  return (
    <AppShell name={user.name ?? "Staff"} currentPath="/schedule">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Everyone&apos;s week</h1>
          <p className="mt-1 text-sm text-ink/65">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/schedule?week=${prev}`} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">
            Previous
          </Link>
          <Link href="/schedule" className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">
            This week
          </Link>
          <Link href={`/schedule?week=${next}`} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">
            Next
          </Link>
          <AddShiftForm />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => (
          <section key={day.label} className="paper-card min-h-40 rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-moss-800/70">{day.label}</p>
            <p className="font-serif text-xl">{format(day.date, "d")}</p>
            <ul className="mt-3 space-y-2">
              {day.shifts.length === 0 ? (
                <li className="text-xs text-ink/45">Open</li>
              ) : (
                day.shifts.map((shift) => {
                  const mine = shift.ownerId === user.id;
                  const upcoming = shift.startAt.getTime() > Date.now();
                  return (
                    <li
                      key={shift.id}
                      className={`rounded-xl px-2.5 py-2 text-sm ${
                        shift.status === "OPEN"
                          ? "bg-clay-500/10"
                          : mine
                            ? "bg-moss-800/10"
                            : "bg-white/70"
                      }`}
                    >
                      <p className="font-medium leading-tight">{shift.title}</p>
                      <p className="text-xs text-ink/65">
                        <LocalDate value={shift.startAt.toISOString()} preset="time" /> –{" "}
                        <LocalDate value={shift.endAt.toISOString()} preset="time" />
                      </p>
                      <p className="text-xs text-ink/65">
                        {shift.status === "OPEN"
                          ? `Open · from ${shift.givenUpBy?.name ?? "staff"}`
                          : shift.owner?.name}
                        {shift.recurrence === "WEEKLY" ? " · weekly" : ""}
                      </p>
                      {mine && upcoming ? (
                        <div className="mt-2">
                          <GiveUpButton shiftId={shift.id} recurring={Boolean(shift.seriesId)} />
                        </div>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
