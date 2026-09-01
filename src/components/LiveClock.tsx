"use client";

import { useEffect, useState } from "react";

function formatNow(date: Date) {
  return {
    date: new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(date),
  };
}

export function LiveClock() {
  const [now, setNow] = useState(() => formatNow(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setNow(formatNow(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.18em] text-moss-800/70">{now.date}</p>
      <p className="mt-1 font-serif text-3xl leading-none text-moss-900 sm:text-4xl">{now.time}</p>
    </div>
  );
}
