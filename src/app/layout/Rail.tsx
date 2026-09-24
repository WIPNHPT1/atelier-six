import { NavLink } from 'react-router-dom';
import styles from './Rail.module.css';
import { navItems } from './navItems';
import { Logo } from '../../ui/Logo';
import { useMotionEnabled } from '../settingsStore';

export function Rail() {
  const motionEnabled = useMotionEnabled();

  return (
    <nav className={styles.rail} data-focus-hide aria-label="Primary" data-testid="nav-rail">
      <div className={styles.mark}>
        <Logo variant="mark" size={28} />
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          viewTransition={motionEnabled}
          title={item.label}
          aria-label={item.label}
          className={({ isActive }) =>
            [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')
          }
        >
          <item.icon width={22} height={22} />
        </NavLink>
      ))}
    </nav>
  );
}
