import { formatNumber } from "../../lib/format";
import { Button } from "./Button";
import styles from "./Pagination.module.css";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, totalPages, onPageChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>
        Showing{" "}
        <strong>
          {formatNumber(first)}–{formatNumber(last)}
        </strong>{" "}
        of <strong>{formatNumber(total)}</strong>
      </p>
      <div className={styles.controls}>
        <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <span className={styles.pageInfo}>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}