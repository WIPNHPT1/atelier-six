import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Heading.module.css'
import { cx } from './cx'

type Level = 1 | 2 | 3 | 4

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: Level
  children: ReactNode
}

const levelClass: Record<Level, string | undefined> = {
  1: styles.level1,
  2: styles.level2,
  3: styles.level3,
  4: styles.level4,
}

const levelTag = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const

export function Heading({ level = 1, className, children, ...rest }: HeadingProps) {
  const Tag = levelTag[level]
  const classes = cx(styles.heading, levelClass[level], className)

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}
