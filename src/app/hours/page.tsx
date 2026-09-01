import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { addDays, formatDuration, formatHoursDecimal, startOfWeekMonday, toDateInputValue, weeklyHoursMs } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function HoursPage({
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

  const [entries, teammates] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        checkInAt: { lt: weekEnd },
        OR: [{ checkOutAt: null }, { checkOutAt: { gte: weekStart } }],
      },
      orderBy: { checkInAt: "desc" },
    }),
    prisma.user.findMany({
      include: {
        timeEntries: {
          where: {
            checkInAt: { lt: weekEnd },
            OR: [{ checkOutAt: null }, { checkOutAt: { gte: weekStart } }],
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const mine = weeklyHoursMs(entries, weekStart, now);

  return (
    <AppShell name={user.name ?? "Staff"} currentPath="/hours">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Weekly hours</h1>
          <p className="mt-1 text-sm text-ink/65">
            Week of {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/hours?week=${prev}`} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">
            Previous
          </Link>
          <Link href="/hours" className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">
            This week
          </Link>
          <Link href={`/hours?week=${next}`} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm">
            Next
          </Link>
        </div>
      </div>

      <section className="paper-card rounded-3xl p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-moss-800/70">Your total</p>
        <p className="mt-2 font-serif text-5xl text-moss-900">{formatDuration(mine)}</p>
        <p className="mt-1 text-sm text-ink/60">{formatHoursDecimal(mine)} hours from live check-in / check-out stamps.</p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Your punches</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No check-ins in this week yet.</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {entries.map((entry) => {
              const end = entry.checkOutAt ?? now;
              const ms = end.getTime() - entry.checkInAt.getTime();
              return (
                <li key={entry.id} className="paper-card rounded-2xl px-4 py-3 text-sm">
                  <p className="font-medium">
                    {format(entry.checkInAt, "EEE, MMM d")} · {formatDuration(ms)}
                    {!entry.checkOutAt ? " · live" : ""}
                  </p>
                  <p className="text-ink/65">
                    In {format(entry.checkInAt, "h:mm:ss a")}
                    {" → "}
                    {entry.checkOutAt ? `Out ${format(entry.checkOutAt, "h:mm:ss a")}` : "Still checked in"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Team this week</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {teammates.map((teammate) => {
            const ms = weeklyHoursMs(teammate.timeEntries, weekStart, now);
            return (
              <li key={teammate.id} className="paper-card rounded-2xl px-4 py-3">
                <p className="font-medium">{teammate.name}</p>
                <p className="text-sm text-ink/65">
                  {formatDuration(ms)} · {formatHoursDecimal(ms)} h
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
