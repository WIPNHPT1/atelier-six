import { NavLink } from 'react-router-dom'
import styles from './Rail.module.css'
import { navItems } from './navItems'

export function Rail() {
  return (
    <nav className={styles.rail} aria-label="Primary" data-testid="nav-rail">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
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
  )
}
