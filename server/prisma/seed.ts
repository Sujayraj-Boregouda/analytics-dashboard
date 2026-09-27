import { PrismaClient, RegistrationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

const events = [
  { name: "Battle of Bands", category: "Cultural", price: 300, capacity: 400 },
  { name: "Classical Dance", category: "Cultural", price: 200, capacity: 250 },
  { name: "Hackathon", category: "Technical", price: 500, capacity: 150 },
  { name: "Robo Wars", category: "Technical", price: 400, capacity: 120 },
  { name: "Cricket Tournament", category: "Sports", price: 1000, capacity: 200 },
  { name: "Chess Championship", category: "Sports", price: 150, capacity: 100 },
];

function randomStatus(): RegistrationStatus {
  const r = Math.random();
  if (r < 0.75) return "PAID";
  if (r < 0.9) return "PENDING";
  return "FAILED";
}

async function main() {
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.createMany({
    data: [
      { email: "admin@demo.com", passwordHash, role: "ADMIN" },
      { email: "viewer@demo.com", passwordHash, role: "VIEWER" },
    ],
  });

  const now = Date.now();
  let total = 0;

  for (const e of events) {
    const event = await prisma.event.create({
      data: {
        name: e.name,
        category: e.category,
        capacity: e.capacity,
        eventDate: new Date(now + 7 * DAY),
      },
    });

    const count = Math.floor(e.capacity * (0.4 + Math.random() * 0.5));
    const data = Array.from({ length: count }, (_, i) => ({
      eventId: event.id,
      attendeeName: `Attendee ${event.id}-${i + 1}`,
      attendeeEmail: `attendee${event.id}_${i + 1}@example.com`,
      amount: e.price,
      status: randomStatus(),
      createdAt: new Date(now - Math.random() * 30 * DAY),
    }));

    await prisma.registration.createMany({ data });
    total += count;
  }

  console.log(`Seeded ${events.length} events and ${total} registrations`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());