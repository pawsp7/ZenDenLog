import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return {
      user: null,
      response: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }
  return { user, response: null };
}
