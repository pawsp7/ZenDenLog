# ZenDenLog

Staff check-in, weekly hours, and a shared shift board that works in the browser and as a phone home-screen app.

Data lives in **MongoDB Atlas** (always on in the cloud). The site is meant to be hosted on **Vercel**, so you get a public `https://…vercel.app` URL and do not need to leave a laptop running.

## What it does

- **Accounts.** Staff create a login and keep their own punch log and shifts.
- **Live check-in / check-out.** The server stamps the real time and date. Check-out is only available after a check-in. Hours between those stamps are stored on the user.
- **Weekly hours.** Totals are calculated Monday–Sunday, including an in-progress session, and shown for you and the whole team.
- **Global schedule.** Anyone can book themselves onto a shift. The week view is visible to every signed-in user.
- **Give up / claim.** A future shift can be released. It leaves that person’s schedule and appears on the open board until someone else claims it.
- **Recurring shifts.** Weekly repeats generate upcoming occurrences (give up one date, or this and future dates in the series).

## Demo login

After the first successful database push the app seeds:

- `maya@zendenlog.app`
- `jordan@zendenlog.app`
- `sam@zendenlog.app`

Password for all three: `zen-den-2026`

## Host it (public URL + online database)

You need two free accounts. Neither runs on your phone or laptop.

### 1. MongoDB Atlas (the database)

1. Create a free account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Build a **free M0** cluster (any region close to Alberta is fine).
3. Create a database user (username + password). Save the password.
4. Under **Network Access**, add IP `0.0.0.0/0` so Vercel’s changing IPs can connect. Atlas still requires the username/password.
5. Click **Connect → Drivers** and copy the URI. Put the database name `zendenlog` in the path:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/zendenlog?retryWrites=true&w=majority
```

Replace `USER` and `PASSWORD` (URL-encode special characters in the password).

### 2. Vercel (the public website)

1. Sign in at [https://vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** and import `pawsp7/ZenDenLog`.
3. Set these environment variables:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | The Atlas URI from step 1 |
| `NEXTAUTH_SECRET` | A long random string (`openssl rand -base64 32`) |
| `TZ` | `America/Edmonton` |
| `NEXTAUTH_URL` | Leave blank on the first deploy, then set it to your `https://….vercel.app` URL and redeploy |

4. Deploy. The build runs `prisma db push` and seeds demo users if the database is empty.
5. Open the Vercel URL on a phone or computer. Use **Add to Home Screen** on iOS/Android.

After the first deploy, copy the URL (for example `https://zendenlog.vercel.app`), set `NEXTAUTH_URL` to that exact origin, and Redeploy.

## Run locally against Atlas

Use the **same** Atlas cluster so local work and the public site share one database.

```bash
cp .env.example .env
# paste DATABASE_URL and NEXTAUTH_SECRET
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Times default to **America/Edmonton**.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm test` | Hours and recurrence unit tests |
| `npm run build` / `npm start` | Production server |
| `npm run db:push` | Create/update Atlas collections from the Prisma schema |
| `npm run db:seed` | Load demo staff and shifts |
| `npm run db:reset` | Recreate collections and demo data |
