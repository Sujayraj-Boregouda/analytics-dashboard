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
  await agent
    .post("/api/auth/login")
    .send({ email, password: "admin123" })
    .expect(200);
  return agent;
}

describe("Analytics API", () => {
  it("refuses requests from someone who isn't logged in", async () => {
    const res = await request(app).get("/api/analytics/summary");
    expect(res.status).toBe(401);
  });

  it("returns summary numbers that add up", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/analytics/summary");

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.paid + res.body.pending + res.body.failed).toBe(res.body.total);
  });

  it("returns one row for every day, even days with no registrations", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/analytics/registrations-daily?from=2026-09-01&to=2026-09-07");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    expect(res.body[0].date).toBe("2026-09-01");
    expect(res.body[6].date).toBe("2026-09-07");
  });

  it("blocks viewers from revenue data", async () => {
    const viewer = await loginAs("viewer@demo.com");
    const res = await viewer.get("/api/analytics/revenue-by-event");
    expect(res.status).toBe(403);
  });

  it("rejects a date range that goes backwards", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/analytics/summary?from=2026-09-10&to=2026-09-01");
    expect(res.status).toBe(400);
  });

  it("rejects an eventId that isn't a number", async () => {
    const admin = await loginAs("admin@demo.com");
    const res = await admin.get("/api/analytics/summary?eventId=abc");
    expect(res.status).toBe(400);
  });
});