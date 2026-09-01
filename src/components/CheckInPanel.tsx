"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/time";

type OpenEntry = {
  id: string;
  checkInAt: string;
} | null;

export function CheckInPanel({
  initialOpen,
  weekLabel,
}: {
  initialOpen: OpenEntry;
  weekLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<OpenEntry>(initialOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = useMemo(() => {
    if (!open) return 0;
    return Math.max(0, now - new Date(open.checkInAt).getTime());
  }, [open, now]);

  async function act(path: "/api/time/check-in" | "/api/time/check-out") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      if (path.endsWith("check-in")) {
        setOpen({
          id: data.entry.id,
          checkInAt: data.entry.checkInAt,
        });
      } else {
        setOpen(null);
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="paper-card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-moss-800/70">This week</p>
          <p className="mt-2 font-serif text-4xl text-moss-900">{weekLabel}</p>
          {open ? (
            <p className="mt-3 text-sm text-ink/70">
              Checked in {new Date(open.checkInAt).toLocaleString()}. Live session {formatDuration(elapsed)}.
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink/70">You are checked out. Press check-in to stamp the live time.</p>
          )}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => act(open ? "/api/time/check-out" : "/api/time/check-in")}
          className={`h-36 w-36 shrink-0 rounded-full text-lg font-medium shadow-lift transition active:scale-95 disabled:opacity-60 ${
            open
              ? "bg-clay-500 text-white hover:bg-clay-600"
              : "bg-moss-800 text-parchment-50 hover:bg-moss-700"
          }`}
        >
          {busy ? "Saving…" : open ? "Check out" : "Check in"}
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-clay-600">{error}</p> : null}
    </section>
  );
}
