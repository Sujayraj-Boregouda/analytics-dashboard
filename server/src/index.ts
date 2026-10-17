import { createApp } from "./app";
import { env } from "./config";
import { prisma } from "./lib/prisma";

const server = createApp().listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});

let shuttingDown = false;

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully`);

  // Safety net: if something hangs, exit anyway after 10 seconds
  const forceExit = setTimeout(() => {
    console.error("Shutdown took too long, forcing exit");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  // 1. Stop accepting new requests, and let the ones in progress finish
  server.close(() => {
    // 2. Then close the database connections
    void prisma.$disconnect().finally(() => {
      console.log("Shutdown complete");
      process.exit(0);
    });
  });

  // Close connections that are open but not doing anything
  server.closeIdleConnections();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));