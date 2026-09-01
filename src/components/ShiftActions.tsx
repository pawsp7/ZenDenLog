"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GiveUpButton({ shiftId, recurring }: { shiftId: string; recurring: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function giveUp(scope: "this" | "future") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/shifts/${shiftId}/give-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not give up that shift.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => giveUp("this")}
          className="rounded-full border border-clay-500/40 px-3 py-1.5 text-xs text-clay-600"
        >
          Give up
        </button>
        {recurring ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => giveUp("future")}
            className="rounded-full border border-clay-500/40 px-3 py-1.5 text-xs text-clay-600"
          >
            Give up this & future
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-clay-600">{error}</p> : null}
    </div>
  );
}

export function ClaimButton({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function claim() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/shifts/${shiftId}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not claim that shift.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={claim}
        className="rounded-full bg-moss-800 px-4 py-2 text-sm text-parchment-50 disabled:opacity-60"
      >
        {busy ? "Claiming…" : "Claim shift"}
      </button>
      {error ? <p className="mt-1 text-xs text-clay-600">{error}</p> : null}
    </div>
  );
}
