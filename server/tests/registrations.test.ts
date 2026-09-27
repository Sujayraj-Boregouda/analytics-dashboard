import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const app = createApp();

afterAll(async () => {
  await prisma.$disconnect();
});

async function loginAs(email: string) {
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email, password: "admin123" }).expect(200);
  return agent;
}

describe("GET /api/registrations", () => {
  it("returns one page of results with page info", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/registrations?page=1&pageSize=5");

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.totalPages).toBe(Math.ceil(res.body.total / 5));
  });

  it("never shows the same row on two different pages", async () => {
    const admin = await loginAs("admin@demo.com");
    const page1 = await admin.get("/api/registrations?sortBy=amount&page=1&pageSize=10");
    const page2 = await admin.get("/api/registrations?sortBy=amount&page=2&pageSize=10");

    const ids1 = page1.body.items.map((r: { id: number }) => r.id);
    const ids2 = page2.body.items.map((r: { id: number }) => r.id);
    const overlap = ids1.filter((id: number) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it("filters by payment status", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/registrations?status=FAILED&pageSize=50");

    expect(res.status).toBe(200);
    for (const row of res.body.items) {
      expect(row.status).toBe("FAILED");
    }
  });

  it("rejects sorting by a column that isn't allowed", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/registrations?sortBy=passwordHash");
    expect(res.status).toBe(400);
  });

  it("rejects a page size that's too large", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/registrations?pageSize=5000");
    expect(res.status).toBe(400);
  });

  it("keeps attendee data away from viewers", async () => {
    const viewer = await loginAs("viewer@demo.com");
    const res = await viewer.get("/api/registrations");
    expect(res.status).toBe(403);
  });
});