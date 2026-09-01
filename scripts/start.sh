#!/bin/sh
set -eu

npx prisma db push --skip-generate
node scripts/ensure-seed.cjs
exec npx next start --hostname 0.0.0.0 --port "${PORT:-3000}"
