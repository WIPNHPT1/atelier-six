import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Text.module.css'

type TextSize = 'small' | 'medium' | 'large'

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  dim?: boolean
  size?: TextSize
  children: ReactNode
}

const sizeClass: Partial<Record<TextSize, string>> = {
  small: styles.sizeSmall,
  large: styles.sizeLarge,
}

export function Text({ dim = false, size = 'medium', className, children, ...rest }: TextProps) {
  const classes = [styles.text, dim ? styles.dim : '', sizeClass[size] ?? '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <p className={classes} {...rest}>
      {children}
    </p>
  )
}
