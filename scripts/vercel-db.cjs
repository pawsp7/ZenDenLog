if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const { execSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Skipping Atlas schema push. Add it in Vercel → Settings → Environment Variables, then Redeploy.",
  );
  process.exit(0);
}

execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
execSync("node scripts/ensure-seed.cjs", { stdio: "inherit" });
