import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import styles from './Button.module.css';
import { cx } from './cx';

// Dynamically imported: `uiSounds` pulls in Tone.js, and Button is used everywhere,
// including the always-mounted app shell — a static import would bloat the entry chunk.
function tap(): void {
  void import('../audio/uiSounds').then(({ playUiTap }) => {
    playUiTap();
  });
}

type ButtonVariant = 'primary' | 'quiet' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variantClass: Record<ButtonVariant, string | undefined> = {
  primary: styles.primary,
  quiet: styles.quiet,
  ghost: styles.ghost,
};

const sizeClass: Record<ButtonSize, string | undefined> = {
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
};

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = cx(styles.button, variantClass[variant], sizeClass[size], className);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (variant === 'primary') tap();
    onClick?.(event);
  }

  return (
    <button
      className={classes}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      <span className={[styles.label, loading ? styles.labelHidden : ''].join(' ').trim()}>
        {children}
      </span>
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
    </button>
  );
}
