import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Panel.module.css';

export type PanelProps = HTMLAttributes<HTMLDivElement> & {
  raised?: boolean;
  children: ReactNode;
};

export function Panel({ raised = false, className, children, ...rest }: PanelProps) {
  const classes = [styles.panel, raised ? styles.raised : '', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
