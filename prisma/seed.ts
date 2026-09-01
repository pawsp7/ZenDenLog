process.env.TZ ||= "America/Edmonton";

import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { addDays, startOfWeekMonday } from "../src/lib/time";

async function main() {
  const passwordHash = await bcrypt.hash("zen-den-2026", 12);
  const people = [
    { name: "Maya Chen", email: "maya@zendenlog.app" },
    { name: "Jordan Hale", email: "jordan@zendenlog.app" },
    { name: "Sam Okonkwo", email: "sam@zendenlog.app" },
  ];

  const users = [];
  for (const person of people) {
    const user = await prisma.user.upsert({
      where: { email: person.email },
      update: { name: person.name, passwordHash },
      create: { ...person, passwordHash },
    });
    users.push(user);
  }

  const [maya, jordan, sam] = users;
  const weekStart = startOfWeekMonday(new Date());

  await prisma.shift.deleteMany();
  await prisma.timeEntry.deleteMany();

  const at = (dayOffset: number, hour: number, minute = 0) => {
    const d = addDays(weekStart, dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  await prisma.timeEntry.createMany({
    data: [
      {
        userId: maya.id,
        checkInAt: at(0, 9, 0),
        checkOutAt: at(0, 17, 0),
      },
      {
        userId: jordan.id,
        checkInAt: at(1, 10, 0),
        checkOutAt: at(1, 16, 0),
      },
    ],
  });

  const deskSeries = "seed-front-desk";
  const floorSeries = "seed-treatment-floor";

  const weeklyDesk = [0, 1, 2, 3, 4].flatMap((week) =>
    [0, 2, 4].map((day) => ({
      title: "Front desk",
      location: "Lobby",
      startAt: addDays(at(day, 9), week * 7),
      endAt: addDays(at(day, 17), week * 7),
      recurrence: "WEEKLY",
      recurrenceUntil: addDays(weekStart, 7 * 5),
      seriesId: deskSeries,
      ownerId: maya.id,
      createdById: maya.id,
      status: "SCHEDULED",
    })),
  );

  const weeklyFloor = [0, 1, 2, 3, 4].flatMap((week) =>
    [1, 3].map((day) => ({
      title: "Treatment floor",
      location: "Studio B",
      startAt: addDays(at(day, 11), week * 7),
      endAt: addDays(at(day, 19), week * 7),
      recurrence: "WEEKLY",
      recurrenceUntil: addDays(weekStart, 7 * 5),
      seriesId: floorSeries,
      ownerId: jordan.id,
      createdById: jordan.id,
      status: "SCHEDULED",
    })),
  );

  const giveUpStart = addDays(at(5, 12), 7);
  const giveUpEnd = addDays(at(5, 16), 7);
  if (giveUpStart.getTime() <= Date.now()) {
    giveUpStart.setDate(giveUpStart.getDate() + 7);
    giveUpEnd.setDate(giveUpEnd.getDate() + 7);
  }

  await prisma.shift.createMany({
    data: [
      ...weeklyDesk,
      ...weeklyFloor,
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

  console.log("Seeded ZenDenLog demo users and this week's shifts.");
  console.log("Log in with maya@zendenlog.app / zen-den-2026");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
