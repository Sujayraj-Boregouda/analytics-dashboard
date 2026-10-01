import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import { ChartCanvas } from "../../components/charts/ChartCanvas";
import { Card, ErrorState, Skeleton } from "../../components/ui";
import { formatNumber, formatShortDate } from "../../lib/format";
import { useApiData } from "../../lib/useApiData";
import { useChartTheme } from "../../lib/useChartTheme";
import type { DailyPoint } from "../../types/api";

export function RegistrationsTrend() {
  const { data, error, loading, reload } = useApiData<DailyPoint[]>(
    "/analytics/registrations-daily",
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
            backgroundColor: theme.surface,
            titleColor: theme.text,
            bodyColor: theme.text,
            borderColor: theme.grid,
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            titleFont: { family: theme.font, weight: 600 },
            bodyFont: { family: theme.font },
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
            ticks: {
              color: theme.muted,
              font: { family: theme.font, size: 12 },
              precision: 0,
            },
          },
        },
      },
    };
  }, [data, theme]);

  const total = data?.at(-1)?.cumulative;

  return (
    <Card
      title="Registrations per day"
      description="New sign-ups across all events, last 30 days."
      actions={
        total !== undefined ? (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            <strong style={{ color: "var(--color-text)" }}>{formatNumber(total)}</strong> in total
          </span>
        ) : undefined
      }
    >
      {error && !data ? (
        <ErrorState message="Couldn't load the chart data." onRetry={reload} />
      ) : loading && !config ? (
        <Skeleton height={280} />
      ) : config ? (
        <ChartCanvas
          config={config}
          ariaLabel={`Line chart of daily registrations over the last 30 days, ${total ?? 0} in total.`}
        />
      ) : null}
    </Card>
  );
}