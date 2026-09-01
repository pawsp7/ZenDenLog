if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const { execSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL to your MongoDB Atlas connection string.");
  process.exit(1);
}

execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
execSync("node scripts/ensure-seed.cjs", { stdio: "inherit" });
