/** Strip quotes and ensure mongodb+srv URIs include /zendenlog */
export function normalizeMongoUrl(raw: string): string {
  const url = raw.trim().replace(/^["']|["']$/g, "");
  if (!url.startsWith("mongodb")) return url;

  const queryIndex = url.indexOf("?");
  const base = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : url.slice(queryIndex);
  if (/mongodb(\+srv)?:\/\/[^/]+\/?$/.test(base)) {
    return `${base.replace(/\/$/, "")}/zendenlog${query}`;
  }
  return url;
}

export function applyPublicAuthUrl() {
  if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = normalizeMongoUrl(process.env.DATABASE_URL);
  }

  if (process.env.NEXTAUTH_URL) return;

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    (process.env.VERCEL === "1" ? "zen-den-log.vercel.app" : "");
  if (host) {
    process.env.NEXTAUTH_URL = host.startsWith("http") ? host : `https://${host}`;
  }
}

applyPublicAuthUrl();
