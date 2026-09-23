import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'quiet' | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  quiet: styles.quiet,
  ghost: styles.ghost,
}

const sizeClass: Record<ButtonSize, string> = {
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, variantClass[variant], sizeClass[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className={[styles.label, loading ? styles.labelHidden : ''].join(' ').trim()}>
        {children}
      </span>
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
    </button>
  )
}
