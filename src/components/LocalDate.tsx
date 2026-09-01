"use client";

type Preset = "time" | "timeSeconds" | "dayTime" | "weekTime";

const presets: Record<Preset, Intl.DateTimeFormatOptions> = {
  time: { hour: "numeric", minute: "2-digit" },
  timeSeconds: { hour: "numeric", minute: "2-digit", second: "2-digit" },
  dayTime: { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
  weekTime: { weekday: "short", month: "short", day: "numeric" },
};

export function LocalDate({
  value,
  preset = "time",
}: {
  value: string | Date;
  preset?: Preset;
}) {
  const date = typeof value === "string" ? new Date(value) : value;
  return <time dateTime={date.toISOString()}>{date.toLocaleString(undefined, presets[preset])}</time>;
}
