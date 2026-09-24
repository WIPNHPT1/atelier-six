import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Text.module.css';
import { cx } from './cx';

type TextSize = 'small' | 'medium' | 'large';

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  dim?: boolean;
  size?: TextSize;
  children: ReactNode;
};

const sizeClass: Record<TextSize, string | undefined> = {
  small: styles.sizeSmall,
  medium: undefined,
  large: styles.sizeLarge,
};

export function Text({ dim = false, size = 'medium', className, children, ...rest }: TextProps) {
  const classes = cx(styles.text, dim ? styles.dim : undefined, sizeClass[size], className);

  return (
    <p className={classes} {...rest}>
      {children}
    </p>
  );
}
