# ZenDenLog

Staff check-in, weekly hours, and a shared shift board that works in the browser and as a phone home-screen app.

## What it does

- **Accounts.** Staff create a login and keep their own punch log and shifts.
- **Live check-in / check-out.** The server stamps the real time and date. Check-out is only available after a check-in. Hours between those stamps are stored on the user.
- **Weekly hours.** Totals are calculated Monday–Sunday, including an in-progress session, and shown for you and the whole team.
- **Global schedule.** Anyone can book themselves onto a shift. The week view is visible to every signed-in user.
- **Give up / claim.** A future shift can be released. It leaves that person’s schedule and appears on the open board until someone else claims it.
- **Recurring shifts.** Weekly repeats generate upcoming occurrences (give up one date, or this and future dates in the series).

## Demo login

After the first boot the database is seeded with:

- `maya@zendenlog.app`
- `jordan@zendenlog.app`
- `sam@zendenlog.app`

Password for all three: `zen-den-2026`

## Run locally

```bash
cp .env.example .env
# set NEXTAUTH_SECRET to a long random string
mkdir -p data
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On a phone, open the same URL and use **Add to Home Screen** for the installed-app layout. Times default to **America/Edmonton** (set `TZ` to change).

## Keep the database running

The app uses a **file-backed SQLite database** at `data/zendenlog.db`. It does not sleep, pause, or require a separate database server. Docker Compose mounts that file on a named volume so punches and shifts survive container rebuilds and restarts.

```bash
docker compose up --build -d
```

`restart: unless-stopped` keeps the process up. `/api/health` confirms both the app and the database. Point `NEXTAUTH_URL` at the public URL you actually serve.

### Hosted deploy

The included `render.yaml` attaches a persistent disk at `/app/data` so the same database file stays on the host. After deploy, set `NEXTAUTH_URL` to the public `https://…` origin. Any Docker host with a persistent volume (a VPS, Fly.io, Railway) works the same way: keep `/app/data` off ephemeral disk.

Do not deploy this SQLite build to a stateless serverless host (Vercel, Netlify functions) — those filesystems are wiped between requests. Use the Docker image plus a volume instead.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm test` | Hours and recurrence unit tests |
| `npm run build` / `npm start` | Production server |
| `npm run db:reset` | Recreate the database and demo data |
