import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { navItems } from './navItems'
import { copy } from '../../content/copy.en-GB'
import { Logo } from '../../ui/Logo'

export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Primary" data-testid="nav-sidebar">
      <div className={styles.wordmark}>
        <Logo variant="lockup" size={32} />
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')
          }
        >
          <item.icon width={20} height={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button type="button" className={styles.search}>
        {copy.nav.search}
      </button>
    </nav>
  )
}
