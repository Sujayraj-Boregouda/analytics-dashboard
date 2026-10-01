import { KpiRow } from "../features/dashboard/KpiRow";
import { RegistrationsTrend } from "../features/dashboard/RegistrationsTrend";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Registrations and payments for the last 30 days.</p>
      </div>

      <KpiRow />
      <RegistrationsTrend />
    </>
  );
}