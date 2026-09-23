import type { HTMLAttributes } from 'react'
import styles from './Divider.module.css'

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({ orientation = 'horizontal', className, ...rest }: DividerProps) {
  const classes = [styles.divider, orientation === 'vertical' ? styles.vertical : '', className]
    .filter(Boolean)
    .join(' ')

  return <hr className={classes} {...rest} />
}
