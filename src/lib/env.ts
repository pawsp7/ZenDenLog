/**
 * NextAuth needs an absolute public origin. On Vercel the platform provides
 * VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL so a laptop does not have to stay online.
 */
export function applyPublicAuthUrl() {
  if (process.env.NEXTAUTH_URL) return;

  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (host) {
    process.env.NEXTAUTH_URL = host.startsWith("http") ? host : `https://${host}`;
  }
}

applyPublicAuthUrl();
