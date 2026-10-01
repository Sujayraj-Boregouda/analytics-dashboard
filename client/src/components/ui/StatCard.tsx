import type { ReactNode } from "react";
import { Skeleton } from "./Skeleton";
import styles from "./StatCard.module.css";

type StatCardProps = {
  label: string;
  value?: string;
  detail?: ReactNode;
  loading?: boolean;
};

export function StatCard({ label, value, detail, loading = false }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      {loading || value === undefined ? (
        <Skeleton height={34} width="60%" />
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {loading ? (
        <Skeleton height={14} width="80%" />
      ) : (
        detail && <span className={styles.detail}>{detail}</span>
      )}
    </div>
  );
}