import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config";
import { prisma } from "./lib/prisma";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  });
  
  app.use("/api/auth", authRouter);

  app.use(errorHandler);
  return app;
}