import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  children: ReactNode;
};

export function IconButton({
  label,
  active = false,
  className,
  children,
  ...rest
}: IconButtonProps) {
  const classes = [styles.button, active ? styles.active : '', className].filter(Boolean).join(' ');

  return (
    <button className={classes} aria-label={label} {...rest}>
      {children}
    </button>
  );
}
