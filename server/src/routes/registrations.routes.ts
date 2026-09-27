import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const registrationsRouter = Router();
registrationsRouter.use(requireAuth, requireRole("ADMIN"));

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(["PAID", "PENDING", "FAILED"]).optional(),
  eventId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(["createdAt", "amount", "attendeeName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

registrationsRouter.get("/", async (req, res) => {
  const q = listSchema.parse(req.query);

  // 1. Build the filters, only adding the ones the user asked for
  const where: Prisma.RegistrationWhereInput = {};
  if (q.status) where.status = q.status;
  if (q.eventId) where.eventId = q.eventId;
  if (q.search) {
    where.OR = [
      { attendeeName: { contains: q.search, mode: "insensitive" } },
      { attendeeEmail: { contains: q.search, mode: "insensitive" } },
    ];
  }

  // 2. Look up the sort rule from a fixed list of allowed columns
  const sortOptions: Record<typeof q.sortBy, Prisma.RegistrationOrderByWithRelationInput> = {
    createdAt: { createdAt: q.sortOrder },
    amount: { amount: q.sortOrder },
    attendeeName: { attendeeName: q.sortOrder },
  };

  // 3. Fetch one page of rows, and the total count, together
  const [rows, total] = await prisma.$transaction([
    prisma.registration.findMany({
      where,
      orderBy: [sortOptions[q.sortBy], { id: "desc" }],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      select: {
        id: true,
        attendeeName: true,
        attendeeEmail: true,
        amount: true,
        status: true,
        createdAt: true,
        event: { select: { name: true } },
      },
    }),
    prisma.registration.count({ where }),
  ]);

  // 4. Tidy the shape for the frontend
  const items = rows.map(({ event, amount, ...rest }) => ({
    ...rest,
    amount: Number(amount),
    eventName: event.name,
  }));

  res.json({
    items,
    page: q.page,
    pageSize: q.pageSize,
    total,
    totalPages: Math.ceil(total / q.pageSize),
  });
});