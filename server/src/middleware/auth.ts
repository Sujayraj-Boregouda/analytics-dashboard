import type { RequestHandler } from "express";
import type { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config";
import { HttpError } from "./errorHandler";

export const AUTH_COOKIE = "access_token";

const tokenPayloadSchema = z.object({
  sub: z.coerce.number(),
  role: z.enum(["ADMIN", "VIEWER"]),
});

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token: unknown = req.cookies?.[AUTH_COOKIE];
  if (typeof token !== "string") throw new HttpError(401, "Not authenticated");

  try {
    const payload = tokenPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw new HttpError(401, "Not authenticated");
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Forbidden");
    next();
  };
}