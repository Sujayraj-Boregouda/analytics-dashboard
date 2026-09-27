import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

const DAY = 24 * 60 * 60 * 1000;

const rangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  eventId: z.coerce.number().int().positive().optional(),
});

function parseRange(query: unknown) {
  const q = rangeSchema.parse(query);
  const to = q.to ?? new Date();
  const from = q.from ?? new Date(to.getTime() - 30 * DAY);
  if (from > to) throw new HttpError(400, "'from' must be before 'to'");
  const eventFilter = q.eventId
    ? Prisma.sql`AND r.event_id = ${q.eventId}`
    : Prisma.empty;
  return { from, to, eventFilter };
}

// GET /api/analytics/events — list for the filter dropdown
analyticsRouter.get("/events", async (_req, res) => {
  const events = await prisma.event.findMany({
    select: { id: true, name: true, category: true },
    orderBy: { name: "asc" },
  });
  res.json(events);
});

// GET /api/analytics/summary — KPI cards
analyticsRouter.get("/summary", async (req, res) => {
  const { from, to, eventFilter } = parseRange(req.query);

  type Row = { total: number; paid: number; pending: number; failed: number; revenue: number };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT COUNT(*)::int                                     AS total,
           COUNT(*) FILTER (WHERE r.status = 'PAID')::int    AS paid,
           COUNT(*) FILTER (WHERE r.status = 'PENDING')::int AS pending,
           COUNT(*) FILTER (WHERE r.status = 'FAILED')::int  AS failed,
           COALESCE(SUM(r.amount) FILTER (WHERE r.status = 'PAID'), 0)::float8 AS revenue
    FROM registrations r
    WHERE r.created_at BETWEEN ${from} AND ${to} ${eventFilter}
  `;

  const row = rows[0];
  if (!row) throw new HttpError(500, "Summary query returned no rows");

  const conversionRate = row.total > 0 ? Math.round((row.paid / row.total) * 1000) / 10 : 0;
  res.json({ ...row, conversionRate });
});

// GET /api/analytics/registrations-daily — line chart with running total
analyticsRouter.get("/registrations-daily", async (req, res) => {
  const { from, to, eventFilter } = parseRange(req.query);

  type Row = { date: string; registrations: number; cumulative: number };
  const rows = await prisma.$queryRaw<Row[]>`
    WITH days AS (
      SELECT generate_series(
        date_trunc('day', ${from}::timestamp),
        date_trunc('day', ${to}::timestamp),
        interval '1 day'
      ) AS day
    ),
    counts AS (
      SELECT date_trunc('day', r.created_at) AS day, COUNT(*)::int AS registrations
      FROM registrations r
      WHERE r.created_at BETWEEN ${from} AND ${to} ${eventFilter}
      GROUP BY 1
    )
    SELECT to_char(d.day, 'YYYY-MM-DD')                              AS date,
           COALESCE(c.registrations, 0)                               AS registrations,
           SUM(COALESCE(c.registrations, 0)) OVER (ORDER BY d.day)::int AS cumulative
    FROM days d
    LEFT JOIN counts c ON c.day = d.day
    ORDER BY d.day
  `;
  res.json(rows);
});

// GET /api/analytics/revenue-by-event — bar chart (admins only)
analyticsRouter.get("/revenue-by-event", requireRole("ADMIN"), async (req, res) => {
  const { from, to } = parseRange(req.query);

  type Row = { id: number; name: string; category: string; registrations: number; revenue: number };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT e.id, e.name, e.category,
           COUNT(r.id)::int AS registrations,
           COALESCE(SUM(r.amount) FILTER (WHERE r.status = 'PAID'), 0)::float8 AS revenue
    FROM events e
    LEFT JOIN registrations r
      ON r.event_id = e.id
     AND r.created_at BETWEEN ${from} AND ${to}
    GROUP BY e.id, e.name, e.category
    ORDER BY revenue DESC
  `;
  res.json(rows);
});

// GET /api/analytics/status-breakdown — doughnut chart
analyticsRouter.get("/status-breakdown", async (req, res) => {
  const { from, to, eventFilter } = parseRange(req.query);

  type Row = { status: string; count: number };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT r.status::text AS status, COUNT(*)::int AS count
    FROM registrations r
    WHERE r.created_at BETWEEN ${from} AND ${to} ${eventFilter}
    GROUP BY r.status
    ORDER BY count DESC
  `;
  res.json(rows);
});