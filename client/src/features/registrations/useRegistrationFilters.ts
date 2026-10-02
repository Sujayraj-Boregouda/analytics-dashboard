import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { RegistrationStatus } from "../../types/api";

const STATUSES: readonly RegistrationStatus[] = ["PAID", "PENDING", "FAILED"];
const SORT_KEYS = ["createdAt", "amount", "attendeeName"] as const;

export type SortKey = (typeof SORT_KEYS)[number];
export type SortOrder = "asc" | "desc";

export const PAGE_SIZE = 20;

const DEFAULT_SORT: SortKey = "createdAt";

// The natural first direction for each column
const DEFAULT_ORDER: Record<SortKey, SortOrder> = {
  createdAt: "desc", // newest first
  amount: "desc", // biggest first
  attendeeName: "asc", // A to Z
};

function parseStatus(value: string | null): RegistrationStatus | null {
  return STATUSES.find((status) => status === value) ?? null;
}

function parseSort(value: string | null): SortKey {
  return SORT_KEYS.find((key) => key === value) ?? DEFAULT_SORT;
}

function parsePositiveInt(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n > 0 ? n : null;
}

export function useRegistrationFilters() {
  const [params, setParams] = useSearchParams();

  const search = (params.get("q") ?? "").trim().slice(0, 100);
  const status = parseStatus(params.get("status"));
  const eventId = parsePositiveInt(params.get("event"));
  const sortBy = parseSort(params.get("sort"));
  const orderParam = params.get("order");
  const sortOrder: SortOrder =
    orderParam === "asc" || orderParam === "desc" ? orderParam : DEFAULT_ORDER[sortBy];
  const page = parsePositiveInt(params.get("page")) ?? 1;

  // The query string sent to the API
  const query = useMemo(() => {
    const q = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      sortBy,
      sortOrder,
    });
    if (search) q.set("search", search);
    if (status) q.set("status", status);
    if (eventId !== null) q.set("eventId", String(eventId));
    return q.toString();
  }, [page, sortBy, sortOrder, search, status, eventId]);

  // Change one or more URL values. Unless told otherwise, go back to page 1.
  const update = useCallback(
    (changes: Record<string, string | null>, keepPage = false) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [name, value] of Object.entries(changes)) {
            if (value === null || value === "") next.delete(name);
            else next.set(name, value);
          }
          if (!keepPage) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setSearch = useCallback((value: string) => update({ q: value.trim() }), [update]);
  const setStatus = useCallback((value: string) => update({ status: parseStatus(value) }), [update]);
  const setEvent = useCallback((value: string) => update({ event: value }), [update]);

  const setPage = useCallback(
    (next: number) => update({ page: next <= 1 ? null : String(next) }, true),
    [update],
  );

  const toggleSort = useCallback(
    (key: SortKey) => {
      const nextOrder: SortOrder =
        key === sortBy ? (sortOrder === "asc" ? "desc" : "asc") : DEFAULT_ORDER[key];
      update({
        sort: key === DEFAULT_SORT ? null : key,
        order: nextOrder === DEFAULT_ORDER[key] ? null : nextOrder,
      });
    },
    [sortBy, sortOrder, update],
  );

  const reset = useCallback(() => setParams({}, { replace: true }), [setParams]);

  return {
    search,
    status,
    eventId,
    sortBy,
    sortOrder,
    page,
    query,
    isFiltered: search !== "" || status !== null || eventId !== null,
    setSearch,
    setStatus,
    setEvent,
    setPage,
    toggleSort,
    reset,
  };
}