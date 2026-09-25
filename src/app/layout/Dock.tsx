import { NavLink } from 'react-router-dom';
import styles from './Dock.module.css';
import { navItems } from './navItems';
import { useMotionEnabled } from '../settingsStore';

export function Dock() {
  const motionEnabled = useMotionEnabled();

  return (
    <nav className={styles.dock} data-focus-hide aria-label="Primary" data-testid="nav-dock">
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
    </nav>
  );
}
