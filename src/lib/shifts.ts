import { addDays } from "./time";

export type Recurrence = "NONE" | "WEEKLY";

export type Occurrence = {
  startAt: Date;
  endAt: Date;
};

export function generateOccurrences(input: {
  startAt: Date;
  endAt: Date;
  recurrence: Recurrence;
  recurrenceUntil?: Date | null;
  maxCount?: number;
}): Occurrence[] {
  const duration = input.endAt.getTime() - input.startAt.getTime();
  if (Number.isNaN(duration) || duration <= 0) {
    return [];
  }

  if (input.recurrence === "NONE") {
    return [{ startAt: new Date(input.startAt), endAt: new Date(input.endAt) }];
  }

  const until =
    input.recurrenceUntil ?? addDays(input.startAt, 12 * 7);
  const maxCount = input.maxCount ?? 52;
  const occurrences: Occurrence[] = [];
  let cursor = new Date(input.startAt);

  while (cursor.getTime() <= until.getTime() && occurrences.length < maxCount) {
    occurrences.push({
      startAt: new Date(cursor),
      endAt: new Date(cursor.getTime() + duration),
    });
    cursor = addDays(cursor, 7);
  }

  return occurrences;
}

export function isUpcoming(startAt: Date, now: Date = new Date()): boolean {
  return startAt.getTime() > now.getTime();
}
