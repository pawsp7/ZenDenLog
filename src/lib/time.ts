export type TimeRange = {
  checkInAt: Date;
  checkOutAt: Date | null;
};

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getTime());
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(weekStart: Date): Date {
  const end = new Date(weekStart.getTime());
  end.setDate(end.getDate() + 7);
  return end;
}

export function overlapMs(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): number {
  const start = Math.max(aStart.getTime(), bStart.getTime());
  const end = Math.min(aEnd.getTime(), bEnd.getTime());
  return Math.max(0, end - start);
}

export function weeklyHoursMs(
  entries: TimeRange[],
  weekStart: Date,
  now: Date = new Date(),
): number {
  const weekEnd = endOfWeek(weekStart);
  let total = 0;
  for (const entry of entries) {
    const checkOut = entry.checkOutAt ?? now;
    total += overlapMs(entry.checkInAt, checkOut, weekStart, weekEnd);
  }
  return total;
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function formatHoursDecimal(ms: number): string {
  const hours = Math.max(0, ms) / 3_600_000;
  return hours.toFixed(2);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toTimeInputValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function combineLocalDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}
