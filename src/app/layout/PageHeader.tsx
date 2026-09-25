import { useEffect, useState, type ReactNode } from 'react';
import styles from './PageHeader.module.css';
import { Heading } from '../../ui/Heading';

export type PageHeaderProps = {
  title: string;
  shortTitle?: string;
  breadcrumb?: string;
  children?: ReactNode;
};

export function PageHeader({ title, shortTitle, breadcrumb, children }: PageHeaderProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setCompact(window.scrollY > 24);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={[styles.header, compact ? styles.compact : ''].filter(Boolean).join(' ')}>
      {breadcrumb ? <p className={styles.breadcrumb}>{breadcrumb}</p> : null}
      {/* Heading level stays fixed at 1: the compact CSS class shrinks it visually and
          transitions smoothly, rather than swapping to a different tag on scroll. */}
      <Heading level={1} style={{ viewTransitionName: 'page-title' }}>
        {shortTitle ? (
          <>
            <span className={styles.titleShort}>{shortTitle}</span>
            <span className={styles.titleFull}>{title}</span>
          </>
        ) : (
          title
        )}
      </Heading>
      {children}
    </header>
  );
}
