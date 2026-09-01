if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const { execSync } = require("child_process");

function normalizeMongoUrl(raw) {
  const url = String(raw).trim().replace(/^["']|["']$/g, "");
  if (!url.startsWith("mongodb")) return url;
  const queryIndex = url.indexOf("?");
  const base = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : url.slice(queryIndex);
  if (/mongodb(\+srv)?:\/\/[^/]+\/?$/.test(base)) {
    return `${base.replace(/\/$/, "")}/zendenlog${query}`;
  }
  return url;
}

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Skipping Atlas schema push. Add it in Vercel → Settings → Environment Variables, then Redeploy.",
  );
  process.exit(0);
}

process.env.DATABASE_URL = normalizeMongoUrl(process.env.DATABASE_URL);

try {
  execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: process.env });
  execSync("node scripts/ensure-seed.cjs", { stdio: "inherit", env: process.env });
} catch (error) {
  console.warn("Could not reach MongoDB Atlas during this build. The site will still deploy.");
  console.warn("Check DATABASE_URL, Atlas database user password, and Network Access 0.0.0.0/0.");
  if (error && error.message) {
    console.warn(String(error.message).replace(/:\/\/[^@]+@/g, "://***:***@"));
  }
}
