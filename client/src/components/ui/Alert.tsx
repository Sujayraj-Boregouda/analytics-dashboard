import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Alert.module.css";

type AlertProps = {
  tone?: "danger" | "info";
  children: ReactNode;
};

export function Alert({ tone = "danger", children }: AlertProps) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx(styles.alert, styles[tone])}>
      {children}
    </div>
  );
}