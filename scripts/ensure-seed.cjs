process.env.TZ ||= "America/Edmonton";

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function startOfWeekMonday(date) {
  const d = new Date(date.getTime());
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log("Database already has users; skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash("zen-den-2026", 12);
  const maya = await prisma.user.create({
    data: { name: "Maya Chen", email: "maya@zendenlog.app", passwordHash },
  });
  const jordan = await prisma.user.create({
    data: { name: "Jordan Hale", email: "jordan@zendenlog.app", passwordHash },
  });
  const sam = await prisma.user.create({
    data: { name: "Sam Okonkwo", email: "sam@zendenlog.app", passwordHash },
  });

  const weekStart = startOfWeekMonday(new Date());
  const at = (dayOffset, hour, minute = 0) => {
    const d = addDays(weekStart, dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  await prisma.timeEntry.createMany({
    data: [
      { userId: maya.id, checkInAt: at(0, 9, 0), checkOutAt: at(0, 17, 0) },
      { userId: jordan.id, checkInAt: at(1, 10, 0), checkOutAt: at(1, 16, 0) },
    ],
  });

  const desk = [];
  for (let week = 0; week < 5; week += 1) {
    for (const day of [0, 2, 4]) {
      desk.push({
        title: "Front desk",
        location: "Lobby",
        startAt: addDays(at(day, 9), week * 7),
        endAt: addDays(at(day, 17), week * 7),
        recurrence: "WEEKLY",
        recurrenceUntil: addDays(weekStart, 7 * 5),
        seriesId: "seed-front-desk",
        ownerId: maya.id,
        createdById: maya.id,
        status: "SCHEDULED",
      });
    }
  }

  const floor = [];
  for (let week = 0; week < 5; week += 1) {
    for (const day of [1, 3]) {
      floor.push({
        title: "Treatment floor",
        location: "Studio B",
        startAt: addDays(at(day, 11), week * 7),
        endAt: addDays(at(day, 19), week * 7),
        recurrence: "WEEKLY",
        recurrenceUntil: addDays(weekStart, 7 * 5),
        seriesId: "seed-treatment-floor",
        ownerId: jordan.id,
        createdById: jordan.id,
        status: "SCHEDULED",
      });
    }
  }

  let giveUpStart = addDays(at(5, 12), 7);
  let giveUpEnd = addDays(at(5, 16), 7);
  if (giveUpStart.getTime() <= Date.now()) {
    giveUpStart = addDays(giveUpStart, 7);
    giveUpEnd = addDays(giveUpEnd, 7);
  }

  await prisma.shift.createMany({
    data: [
      ...desk,
      ...floor,
      {
        title: "Closing ritual",
        location: "Cedar room",
        startAt: at(5, 16),
        endAt: at(5, 20),
        recurrence: "NONE",
        ownerId: sam.id,
        createdById: sam.id,
        status: "SCHEDULED",
      },
      {
        title: "Weekend intake",
        location: "Lobby",
        startAt: giveUpStart,
        endAt: giveUpEnd,
        recurrence: "NONE",
        ownerId: null,
        createdById: sam.id,
        givenUpById: sam.id,
        givenUpAt: new Date(),
        status: "OPEN",
      },
    ],
  });

  console.log("Seeded demo staff. Sign in as maya@zendenlog.app / zen-den-2026");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
