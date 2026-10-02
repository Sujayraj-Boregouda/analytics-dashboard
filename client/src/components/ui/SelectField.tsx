import { useId } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cx } from "../../lib/cx";
import styles from "./SelectField.module.css";

type SelectFieldProps = ComponentPropsWithoutRef<"select"> & {
  label: string;
};

export function SelectField({ label, id, className, children, ...rest }: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select id={selectId} className={styles.select} {...rest}>
        {children}
      </select>
    </div>
  );
}