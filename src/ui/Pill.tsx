import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Pill.module.css';

export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  accent?: boolean;
  children: ReactNode;
};

export function Pill({ accent = false, className, children, ...rest }: PillProps) {
  const classes = [styles.pill, accent ? styles.accent : '', className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
