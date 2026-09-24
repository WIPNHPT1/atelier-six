import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { navItems } from './navItems';
import { copy } from '../../content/copy.en-GB';
import { Logo } from '../../ui/Logo';
import { useMotionEnabled } from '../settingsStore';

export type SidebarProps = {
  onOpenPalette: () => void;
};

export function Sidebar({ onOpenPalette }: SidebarProps) {
  const motionEnabled = useMotionEnabled();

  return (
    <nav className={styles.sidebar} data-focus-hide aria-label="Primary" data-testid="nav-sidebar">
      <div className={styles.wordmark}>
        <Logo variant="lockup" size={32} />
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          viewTransition={motionEnabled}
          className={({ isActive }) =>
            [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')
          }
        >
          <item.icon width={20} height={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button type="button" className={styles.search} onClick={onOpenPalette}>
        {copy.nav.search}
      </button>
    </nav>
  );
}
