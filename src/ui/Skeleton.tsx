import type { HTMLAttributes } from 'react';
import styles from './Skeleton.module.css';
import { cx } from './cx';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  height?: string | number;
};

export function Skeleton({ width, height, className, style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cx(styles.skeleton, className)}
      style={{ width, height, ...style }}
      aria-hidden
      {...rest}
    />
  );
}
