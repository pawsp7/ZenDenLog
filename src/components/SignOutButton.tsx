"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-parchment-100/90 hover:bg-white/10"
    >
      Sign out
    </button>
  );
}
