import styles from "./Skeleton.module.css";

type SkeletonProps = {
  height: number | string;
  width?: number | string;
};

export function Skeleton({ height, width = "100%" }: SkeletonProps) {
  return <span className={styles.skeleton} style={{ height, width }} aria-hidden="true" />;
}