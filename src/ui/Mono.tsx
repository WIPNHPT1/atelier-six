import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Mono.module.css';

export type MonoProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Mono({ className, children, ...rest }: MonoProps) {
  const classes = [styles.mono, className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
