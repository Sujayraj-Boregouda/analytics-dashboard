import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Badge.module.css";

type BadgeProps = {
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  children: ReactNode;
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={cx(styles.badge, styles[tone])}>{children}</span>;
}