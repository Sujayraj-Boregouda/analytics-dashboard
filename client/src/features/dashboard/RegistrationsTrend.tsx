import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import { ChartCanvas } from "../../components/charts/ChartCanvas";
import { Card, EmptyState, ErrorState, Skeleton } from "../../components/ui";
import { formatNumber, formatShortDate } from "../../lib/format";
import { useApiData } from "../../lib/useApiData";
import { tooltipStyle, useChartTheme } from "../../lib/useChartTheme";
import type { DailyPoint } from "../../types/api";

type RegistrationsTrendProps = {
  query: string;
  rangeLabel: string;
};

export function RegistrationsTrend({ query, rangeLabel }: RegistrationsTrendProps) {
  const { data, error, loading, reload } = useApiData<DailyPoint[]>(
    `/analytics/registrations-daily?${query}`,
  );
  const theme = useChartTheme();

  const config = useMemo<ChartConfiguration<"line"> | null>(() => {
    if (!data) return null;

    return {
      type: "line",
      data: {
        labels: data.map((d) => formatShortDate(d.date)),
        datasets: [
          {
            label: "Registrations",
            data: data.map((d) => d.registrations),
            borderColor: theme.primary,
            backgroundColor: theme.primarySoft,
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: theme.primary,
            pointHoverBorderColor: theme.surface,
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipStyle(theme),
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed.y ?? 0;
                return `${value} registration${value === 1 ? "" : "s"}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: theme.grid },
            ticks: {
              color: theme.muted,
              font: { family: theme.font, size: 12 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: theme.grid },
            border: { display: false },
            ticks: { color: theme.muted, font: { family: theme.font, size: 12 }, precision: 0 },
          },
        },
      },
    };
  }, [data, theme]);

  const total = data?.at(-1)?.cumulative;
  const isEmpty = data !== null && data.every((d) => d.registrations === 0);
  const refreshing = loading && data !== null;

  return (
    <Card
      title="Registrations per day"
      description={`New sign-ups, ${rangeLabel.toLowerCase()}.`}
      actions={
        total !== undefined && !isEmpty ? (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            <strong style={{ color: "var(--color-text)" }}>{formatNumber(total)}</strong> in total
          </span>
        ) : undefined
      }
    >
      {error && !data ? (
        <ErrorState message="Couldn't load the chart data." onRetry={reload} />
      ) : !config ? (
        <Skeleton height={280} />
      ) : isEmpty ? (
        <EmptyState
          title="No registrations in this period"
          message="Try a longer date range or a different event."
        />
      ) : (
        <div style={{ opacity: refreshing ? 0.55 : 1, transition: "opacity 150ms ease" }}>
          <ChartCanvas
            config={config}
            ariaLabel={`Line chart of daily registrations, ${rangeLabel.toLowerCase()}, ${total ?? 0} in total.`}
          />
        </div>
      )}
    </Card>
  );
}