import { describe, expect, it } from "vitest";
import { canAccess } from "./access";

describe("canAccess", () => {
  it("lets everyone open the overview", () => {
    expect(canAccess("/", "VIEWER")).toBe(true);
    expect(canAccess("/", "ADMIN")).toBe(true);
  });

  it("keeps viewers out of admin-only pages", () => {
    expect(canAccess("/registrations", "VIEWER")).toBe(false);
  });

  it("lets admins open admin-only pages", () => {
    expect(canAccess("/registrations", "ADMIN")).toBe(true);
  });

  it("also protects pages nested under an admin-only path", () => {
    expect(canAccess("/registrations/42", "VIEWER")).toBe(false);
  });

  it("doesn't block an unrelated page that starts with the same letters", () => {
    expect(canAccess("/registrations-help", "VIEWER")).toBe(true);
  });
});