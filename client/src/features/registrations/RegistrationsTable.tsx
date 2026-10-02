import { Badge } from "../../components/ui";
import { cx } from "../../lib/cx";
import { formatCurrency, formatDateTime } from "../../lib/format";
import type { Registration, RegistrationStatus } from "../../types/api";
import styles from "./RegistrationsTable.module.css";
import type { SortKey, SortOrder } from "./useRegistrationFilters";

const STATUS_TONE: Record<RegistrationStatus, "success" | "warning" | "danger"> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
};

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
};

type SortHeaderProps = {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  order: SortOrder;
  onSort: (key: SortKey) => void;
  align?: "right";
};

function SortHeader({ label, sortKey, activeKey, order, onSort, align }: SortHeaderProps) {
  const active = activeKey === sortKey;
  const ariaSort = active ? (order === "asc" ? "ascending" : "descending") : "none";
  const icon = active ? (order === "asc" ? "↑" : "↓") : "↕";

  return (
    <th scope="col" aria-sort={ariaSort} className={cx(align === "right" && styles.right)}>
      <button type="button" className={styles.sortButton} onClick={() => onSort(sortKey)}>
        {label}
        <span aria-hidden="true" className={cx(styles.sortIcon, active && styles.sortIconActive)}>
          {icon}
        </span>
      </button>
    </th>
  );
}

type RegistrationsTableProps = {
  items: Registration[];
  sortBy: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  refreshing: boolean;
};

export function RegistrationsTable({
  items,
  sortBy,
  sortOrder,
  onSort,
  refreshing,
}: RegistrationsTableProps) {
  return (
    <div className={cx(styles.wrapper, refreshing && styles.refreshing)} aria-busy={refreshing}>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortHeader
              label="Attendee"
              sortKey="attendeeName"
              activeKey={sortBy}
              order={sortOrder}
              onSort={onSort}
            />
            <th scope="col">Event</th>
            <SortHeader
              label="Amount"
              sortKey="amount"
              activeKey={sortBy}
              order={sortOrder}
              onSort={onSort}
              align="right"
            />
            <th scope="col">Status</th>
            <SortHeader
              label="Registered"
              sortKey="createdAt"
              activeKey={sortBy}
              order={sortOrder}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>
                <div className={styles.name}>{row.attendeeName}</div>
                <div className={styles.email}>{row.attendeeEmail}</div>
              </td>
              <td>{row.eventName}</td>
              <td className={styles.right}>{formatCurrency(row.amount)}</td>
              <td>
                <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
              </td>
              <td className={styles.date}>{formatDateTime(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}