"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toDateInputValue } from "@/lib/time";

export function AddShiftForm() {
  const router = useRouter();
  const today = toDateInputValue(new Date());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recurrence, setRecurrence] = useState("NONE");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date") ?? "");
    const startTime = String(form.get("startTime") ?? "");
    const endTime = String(form.get("endTime") ?? "");
    const payload = {
      title: String(form.get("title") ?? ""),
      location: String(form.get("location") ?? ""),
      notes: String(form.get("notes") ?? ""),
      date,
      startTime,
      endTime,
      startAt: new Date(`${date}T${startTime}:00`).toISOString(),
      endAt: new Date(`${date}T${endTime}:00`).toISOString(),
      recurrence: String(form.get("recurrence") ?? "NONE"),
      recurrenceUntil: String(form.get("recurrenceUntil") ?? ""),
    };
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the shift.");
        return;
      }
      event.currentTarget.reset();
      setRecurrence("NONE");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-moss-800 px-4 py-2 text-sm text-parchment-50 hover:bg-moss-700"
      >
        Add a shift
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="paper-card w-full rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl">Schedule yourself</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/60">
          Close
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          Title
          <input name="title" required placeholder="Front desk" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
        </label>
        <label className="text-sm">
          Date
          <input name="date" type="date" required defaultValue={today} className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
        </label>
        <label className="text-sm">
          Location
          <input name="location" placeholder="Lobby" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
        </label>
        <label className="text-sm">
          Start
          <input name="startTime" type="time" required defaultValue="09:00" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
        </label>
        <label className="text-sm">
          End
          <input name="endTime" type="time" required defaultValue="17:00" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
        </label>
        <label className="text-sm">
          Repeat
          <select
            name="recurrence"
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3"
          >
            <option value="NONE">Does not repeat</option>
            <option value="WEEKLY">Every week</option>
          </select>
        </label>
        {recurrence === "WEEKLY" ? (
          <label className="text-sm">
            Until
            <input name="recurrenceUntil" type="date" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
          </label>
        ) : null}
        <label className="text-sm sm:col-span-2">
          Notes
          <textarea name="notes" rows={2} className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3 py-2" />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-clay-600">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-full bg-moss-800 py-2 text-parchment-50 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Add to the global schedule"}
      </button>
    </form>
  );
}
