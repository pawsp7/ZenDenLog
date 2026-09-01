"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Enso } from "./Enso";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not create the account.");
          setBusy(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(mode === "login" ? "Email or password is incorrect." : "Account created, but sign-in failed.");
        setBusy(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-3 text-moss-800">
        <Enso className="h-12 w-12" />
        <div>
          <p className="font-serif text-3xl leading-none">ZenDenLog</p>
          <p className="mt-1 text-sm text-ink/60">Hours, check-ins, and the shared floor schedule.</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="paper-card rounded-3xl p-6">
        <h1 className="font-serif text-3xl">{mode === "login" ? "Welcome back" : "Create your log"}</h1>
        {mode === "register" ? (
          <label className="mt-5 block text-sm">
            Name
            <input name="name" required autoComplete="name" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
          </label>
        ) : null}
        <label className="mt-4 block text-sm">
          Email
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3" />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="mt-1 w-full rounded-2xl border border-ink/10 bg-white px-3"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-clay-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-moss-800 py-3 text-parchment-50 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-ink/70">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-moss-800 underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already on the floor?{" "}
            <Link href="/login" className="text-moss-800 underline">
              Sign in
            </Link>
          </>
        )}
      </p>
      {mode === "login" ? (
        <p className="mt-4 text-center text-xs text-ink/50">
          Demo: maya@zendenlog.app / zen-den-2026
        </p>
      ) : null}
    </div>
  );
}
