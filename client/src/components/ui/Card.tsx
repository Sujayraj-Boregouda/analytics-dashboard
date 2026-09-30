import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Card.module.css";

type CardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, description, actions, children, className }: CardProps) {
  const hasHeader = Boolean(title || actions);

  return (
    <section className={cx(styles.card, className)}>
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}