import { describe, expect, it } from "vitest";
import {
  formatDuration,
  overlapMs,
  startOfWeekMonday,
  weeklyHoursMs,
} from "./time";
import { generateOccurrences } from "./shifts";

describe("startOfWeekMonday", () => {
  it("returns Monday for a Wednesday", () => {
    const wed = new Date(2026, 8, 2, 15, 30, 0);
    const start = startOfWeekMonday(wed);
    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(31);
    expect(start.getMonth()).toBe(7);
    expect(start.getHours()).toBe(0);
  });

  it("keeps Monday as the start of its own week", () => {
    const monday = new Date(2026, 7, 31, 9, 0, 0);
    const start = startOfWeekMonday(monday);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(7);
    expect(start.getDate()).toBe(31);
  });
});

describe("weeklyHoursMs", () => {
  it("sums completed entries inside the week", () => {
    const weekStart = new Date(2026, 7, 31, 0, 0, 0, 0);
    const entries = [
      {
        checkInAt: new Date(2026, 7, 31, 9, 0, 0),
        checkOutAt: new Date(2026, 7, 31, 17, 0, 0),
      },
      {
        checkInAt: new Date(2026, 8, 1, 10, 0, 0),
        checkOutAt: new Date(2026, 8, 1, 14, 30, 0),
      },
    ];
    const ms = weeklyHoursMs(entries, weekStart, new Date(2026, 8, 2));
    expect(ms).toBe((8 + 4.5) * 3_600_000);
    expect(formatDuration(ms)).toBe("12h 30m");
  });

  it("counts an open check-in up to now", () => {
    const weekStart = new Date(2026, 7, 31, 0, 0, 0, 0);
    const now = new Date(2026, 7, 31, 11, 0, 0);
    const ms = weeklyHoursMs(
      [{ checkInAt: new Date(2026, 7, 31, 9, 0, 0), checkOutAt: null }],
      weekStart,
      now,
    );
    expect(ms).toBe(2 * 3_600_000);
  });

  it("clips entries that spill outside the week", () => {
    const weekStart = new Date(2026, 7, 31, 0, 0, 0, 0);
    const ms = weeklyHoursMs(
      [
        {
          checkInAt: new Date(2026, 7, 30, 22, 0, 0),
          checkOutAt: new Date(2026, 7, 31, 2, 0, 0),
        },
      ],
      weekStart,
      new Date(2026, 8, 1),
    );
    expect(ms).toBe(2 * 3_600_000);
  });
});

describe("overlapMs", () => {
  it("returns 0 for non-overlapping ranges", () => {
    expect(
      overlapMs(
        new Date(2026, 0, 1, 9),
        new Date(2026, 0, 1, 10),
        new Date(2026, 0, 1, 11),
        new Date(2026, 0, 1, 12),
      ),
    ).toBe(0);
  });
});

describe("generateOccurrences", () => {
  it("returns a single shift when recurrence is NONE", () => {
    const startAt = new Date(2026, 8, 1, 9, 0, 0);
    const endAt = new Date(2026, 8, 1, 17, 0, 0);
    expect(generateOccurrences({ startAt, endAt, recurrence: "NONE" })).toHaveLength(1);
  });

  it("expands weekly shifts until the until date", () => {
    const startAt = new Date(2026, 8, 1, 9, 0, 0);
    const endAt = new Date(2026, 8, 1, 13, 0, 0);
    const recurrenceUntil = new Date(2026, 8, 22, 23, 59, 0);
    const occurrences = generateOccurrences({
      startAt,
      endAt,
      recurrence: "WEEKLY",
      recurrenceUntil,
    });
    expect(occurrences).toHaveLength(4);
    expect(occurrences[1].startAt.getDate()).toBe(8);
    expect(occurrences[1].endAt.getHours()).toBe(13);
  });

  it("rejects inverted time ranges", () => {
    const startAt = new Date(2026, 8, 1, 17, 0, 0);
    const endAt = new Date(2026, 8, 1, 9, 0, 0);
    expect(generateOccurrences({ startAt, endAt, recurrence: "WEEKLY" })).toEqual([]);
  });
});
