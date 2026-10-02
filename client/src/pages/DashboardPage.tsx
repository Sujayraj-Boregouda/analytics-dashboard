import { useAuth } from "../auth/useAuth";
import { FilterBar } from "../features/dashboard/FilterBar";
import { KpiRow } from "../features/dashboard/KpiRow";
import { RegistrationsTrend } from "../features/dashboard/RegistrationsTrend";
import { RevenueByEvent } from "../features/dashboard/RevenueByEvent";
import { useDashboardFilters } from "../features/dashboard/useDashboardFilters";
import { cx } from "../lib/cx";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const { user } = useAuth();
  const { query, rangeQuery, rangeLabel, eventId } = useDashboardFilters();
  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Registrations and payments, {rangeLabel.toLowerCase()}.</p>
      </div>

      <FilterBar />
      <KpiRow query={query} rangeLabel={rangeLabel} />

      <div className={cx(styles.charts, isAdmin && styles.chartsSplit)}>
        <RegistrationsTrend query={query} rangeLabel={rangeLabel} />
        {isAdmin && (
          <RevenueByEvent query={rangeQuery} rangeLabel={rangeLabel} selectedEventId={eventId} />
        )}
      </div>
    </>
  );
}