import { useEffect, useState, type ReactNode } from 'react'
import styles from './PageHeader.module.css'
import { Heading } from '../../ui/Heading'

export type PageHeaderProps = {
  title: string
  breadcrumb?: string
  children?: ReactNode
}

export function PageHeader({ title, breadcrumb, children }: PageHeaderProps) {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setCompact(window.scrollY > 24)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header className={[styles.header, compact ? styles.compact : ''].filter(Boolean).join(' ')}>
      {breadcrumb ? <p className={styles.breadcrumb}>{breadcrumb}</p> : null}
      <Heading level={compact ? 3 : 1}>{title}</Heading>
      {children}
    </header>
  )
}
