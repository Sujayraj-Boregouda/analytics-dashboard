import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const app = createApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  it("logs in with the right password and sets a secure cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@demo.com", password: "admin123" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("ADMIN");

    const cookie = String(res.headers["set-cookie"]);
    expect(cookie).toContain("access_token=");
    expect(cookie).toContain("HttpOnly");
  });

  it("rejects a wrong password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@demo.com", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("rejects a badly formatted email with 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "admin123" });

    expect(res.status).toBe(400);
  });
});