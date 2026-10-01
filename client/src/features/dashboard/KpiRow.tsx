import { Badge, ErrorState, StatCard } from "../../components/ui";
import { formatCurrency, formatNumber, formatPercent } from "../../lib/format";
import { useApiData } from "../../lib/useApiData";
import type { Summary } from "../../types/api";
import styles from "./KpiRow.module.css";

export function KpiRow() {
  const { data, error, loading, reload } = useApiData<Summary>("/analytics/summary");

  if (error && !data) {
    return <ErrorState message="Couldn't load the summary numbers." onRetry={reload} />;
  }

  const showSkeleton = loading && !data;

  return (
    <div className={styles.grid}>
      <StatCard
        label="Registrations"
        loading={showSkeleton}
        value={data ? formatNumber(data.total) : undefined}
        detail="Last 30 days"
      />
      <StatCard
        label="Revenue"
        loading={showSkeleton}
        value={data ? formatCurrency(data.revenue) : undefined}
        detail={data ? `From ${formatNumber(data.paid)} paid registrations` : undefined}
      />
      <StatCard
        label="Conversion rate"
        loading={showSkeleton}
        value={data ? formatPercent(data.conversionRate) : undefined}
        detail="Paid out of all registrations"
      />
      <StatCard
        label="Needs follow-up"
        loading={showSkeleton}
        value={data ? formatNumber(data.pending + data.failed) : undefined}
        detail={
          data ? (
            <>
              <Badge tone="warning">{data.pending} pending</Badge>
              <Badge tone="danger">{data.failed} failed</Badge>
            </>
          ) : undefined
        }
      />
    </div>
  );
}