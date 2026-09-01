import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { generateOccurrences } from "@/lib/shifts";
import { addDays, combineLocalDateAndTime, startOfWeekMonday } from "@/lib/time";
import { randomBytes } from "crypto";

const createSchema = z.object({
  title: z.string().trim().min(2).max(80),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  recurrence: z.enum(["NONE", "WEEKLY"]).default("NONE"),
  recurrenceUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
});

const shiftInclude = {
  owner: { select: { id: true, name: true, email: true } },
  givenUpBy: { select: { id: true, name: true } },
  claimedBy: { select: { id: true, name: true } },
};

export async function GET(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const url = new URL(request.url);
  const weekParam = url.searchParams.get("week");
  const now = new Date();
  const weekStart = startOfWeekMonday(weekParam ? new Date(`${weekParam}T00:00:00`) : now);
  const weekEnd = addDays(weekStart, 7);

  const shifts = await prisma.shift.findMany({
    where: {
      status: { in: ["SCHEDULED", "OPEN"] },
      startAt: { lt: weekEnd },
      endAt: { gt: weekStart },
    },
    include: shiftInclude,
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    shifts,
  });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the shift details and try again." }, { status: 400 });
  }

  const startAt = parsed.data.startAt
    ? new Date(parsed.data.startAt)
    : parsed.data.date && parsed.data.startTime
      ? combineLocalDateAndTime(parsed.data.date, parsed.data.startTime)
      : null;
  const endAt = parsed.data.endAt
    ? new Date(parsed.data.endAt)
    : parsed.data.date && parsed.data.endTime
      ? combineLocalDateAndTime(parsed.data.date, parsed.data.endTime)
      : null;
  if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: "Start and end times are required." }, { status: 400 });
  }
  if (endAt.getTime() <= startAt.getTime()) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  const recurrenceUntil = parsed.data.recurrenceUntil
    ? combineLocalDateAndTime(parsed.data.recurrenceUntil, "23:59")
    : addDays(startAt, 12 * 7);

  if (parsed.data.recurrence === "WEEKLY" && recurrenceUntil < startAt) {
    return NextResponse.json({ error: "Repeat-until date must be on or after the first shift." }, { status: 400 });
  }

  const occurrences = generateOccurrences({
    startAt,
    endAt,
    recurrence: parsed.data.recurrence,
    recurrenceUntil: parsed.data.recurrence === "WEEKLY" ? recurrenceUntil : null,
  });

  if (occurrences.length === 0) {
    return NextResponse.json({ error: "Could not create that shift window." }, { status: 400 });
  }

  const seriesId = parsed.data.recurrence === "WEEKLY" ? randomBytes(12).toString("hex") : null;
  const created = await prisma.$transaction(
    occurrences.map((occurrence) =>
      prisma.shift.create({
        data: {
          title: parsed.data.title,
          location: parsed.data.location || null,
          notes: parsed.data.notes || null,
          startAt: occurrence.startAt,
          endAt: occurrence.endAt,
          status: "SCHEDULED",
          recurrence: parsed.data.recurrence,
          recurrenceUntil: parsed.data.recurrence === "WEEKLY" ? recurrenceUntil : null,
          seriesId,
          ownerId: user.id,
          createdById: user.id,
        },
        include: shiftInclude,
      }),
    ),
  );

  return NextResponse.json({ shifts: created, count: created.length }, { status: 201 });
}
