import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ClaimButton } from "@/components/ShiftActions";
import { LocalDate } from "@/components/LocalDate";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OpenShiftsPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const shifts = await prisma.shift.findMany({
    where: {
      status: "OPEN",
      startAt: { gt: new Date() },
    },
    include: {
      givenUpBy: { select: { name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  return (
    <AppShell name={user.name ?? "Staff"} currentPath="/open">
      <h1 className="font-serif text-3xl">Open shifts</h1>
      <p className="mt-1 text-sm text-ink/65">
        Given-up shifts leave the original schedule and can be claimed by anyone in the den.
      </p>
      {shifts.length === 0 ? (
        <p className="paper-card mt-6 rounded-2xl p-6 text-sm text-ink/60">Nothing is up for grabs right now.</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {shifts.map((shift) => (
            <li key={shift.id} className="paper-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{shift.title}</p>
                <p className="text-sm text-ink/65">
                  <LocalDate value={shift.startAt.toISOString()} preset="dayTime" /> –{" "}
                  <LocalDate value={shift.endAt.toISOString()} preset="time" />
                  {shift.location ? ` · ${shift.location}` : ""}
                </p>
                <p className="text-xs text-ink/50">Released by {shift.givenUpBy?.name ?? "a teammate"}</p>
              </div>
              <ClaimButton shiftId={shift.id} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
