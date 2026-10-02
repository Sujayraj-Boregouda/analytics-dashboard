import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import { ChartCanvas } from "../../components/charts/ChartCanvas";
import { Card, EmptyState, ErrorState, Skeleton } from "../../components/ui";
import { formatCompactCurrency, formatCurrency } from "../../lib/format";
import { useApiData } from "../../lib/useApiData";
import { tooltipStyle, useChartTheme } from "../../lib/useChartTheme";
import type { RevenueRow } from "../../types/api";

type RevenueByEventProps = {
  query: string;
  rangeLabel: string;
  selectedEventId: number | null;
};

export function RevenueByEvent({ query, rangeLabel, selectedEventId }: RevenueByEventProps) {
  const { data, error, loading, reload } = useApiData<RevenueRow[]>(
    `/analytics/revenue-by-event?${query}`,
  );
  const theme = useChartTheme();

  const config = useMemo<ChartConfiguration<"bar"> | null>(() => {
    if (!data) return null;

    return {
      type: "bar",
      data: {
        labels: data.map((row) => row.name),
        datasets: [
          {
            label: "Revenue",
            data: data.map((row) => row.revenue),
            backgroundColor: data.map((row) =>
              selectedEventId === null || row.id === selectedEventId
                ? theme.primary
                : theme.primarySoft,
            ),
            borderRadius: 4,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipStyle(theme),
            callbacks: {
              label: (ctx) => formatCurrency(ctx.parsed.x ?? 0),
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: theme.grid },
            border: { display: false },
            ticks: {
              color: theme.muted,
              font: { family: theme.font, size: 12 },
              maxTicksLimit: 5,
              callback: (value) => formatCompactCurrency(Number(value)),
            },
          },
          y: {
            grid: { display: false },
            border: { color: theme.grid },
            ticks: { color: theme.text, font: { family: theme.font, size: 12 } },
          },
        },
      },
    };
  }, [data, theme, selectedEventId]);

  const isEmpty = data !== null && data.every((row) => row.revenue === 0);
  const refreshing = loading && data !== null;

  return (
    <Card
      title="Revenue by event"
      description={`Paid registrations only, ${rangeLabel.toLowerCase()}.`}
    >
      {error && !data ? (
        <ErrorState message="Couldn't load revenue." onRetry={reload} />
      ) : !config ? (
        <Skeleton height={280} />
      ) : isEmpty ? (
        <EmptyState title="No revenue in this period" message="Try a longer date range." />
      ) : (
        <div style={{ opacity: refreshing ? 0.55 : 1, transition: "opacity 150ms ease" }}>
          <ChartCanvas
            config={config}
            ariaLabel={`Bar chart of revenue by event, ${rangeLabel.toLowerCase()}.`}
          />
        </div>
      )}
    </Card>
  );
}