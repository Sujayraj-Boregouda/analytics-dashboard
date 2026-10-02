import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export const RANGE_OPTIONS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
] as const;

type RangeDays = (typeof RANGE_OPTIONS)[number]["days"];
const DEFAULT_DAYS: RangeDays = 30;

function parseDays(value: string | null): RangeDays {
  const match = RANGE_OPTIONS.find((option) => String(option.days) === value);
  return match ? match.days : DEFAULT_DAYS;
}

function parseEventId(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}

// The local date N days ago, as "YYYY-MM-DD"
function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function useDashboardFilters() {
  const [params, setParams] = useSearchParams();

  const days = parseDays(params.get("range"));
  const eventId = parseEventId(params.get("event"));

  // Only the date range (for the revenue chart, which compares all events)
  const rangeQuery = useMemo(
    () => new URLSearchParams({ from: isoDateDaysAgo(days - 1) }).toString(),
    [days],
  );

  // Date range + event (for the cards and the daily chart)
  const query = useMemo(() => {
    const q = new URLSearchParams(rangeQuery);
    if (eventId !== null) q.set("eventId", String(eventId));
    return q.toString();
  }, [rangeQuery, eventId]);

  const rangeLabel = RANGE_OPTIONS.find((option) => option.days === days)?.label ?? "";

  const updateParam = useCallback(
    (name: string, value: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === null) next.delete(name);
          else next.set(name, value);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setRange = useCallback(
    (value: string) => {
      const next = parseDays(value);
      updateParam("range", next === DEFAULT_DAYS ? null : String(next));
    },
    [updateParam],
  );

  const setEvent = useCallback(
    (value: string) => {
      const next = parseEventId(value);
      updateParam("event", next === null ? null : String(next));
    },
    [updateParam],
  );

  const reset = useCallback(() => setParams({}, { replace: true }), [setParams]);

  return {
    days,
    eventId,
    query,
    rangeQuery,
    rangeLabel,
    isFiltered: days !== DEFAULT_DAYS || eventId !== null,
    setRange,
    setEvent,
    reset,
  };
}