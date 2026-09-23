import { NavLink } from 'react-router-dom'
import styles from './Dock.module.css'
import { navItems } from './navItems'

export function Dock() {
  return (
    <nav className={styles.dock} aria-label="Primary" data-testid="nav-dock">
      {navItems.map((item) => {
        const isPractise = item.to === '/practise'
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            aria-label={isPractise ? item.label : undefined}
            className={({ isActive }) =>
              [styles.item, isPractise ? styles.play : '', isActive ? styles.active : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            <item.icon width={20} height={20} />
            {isPractise ? null : <span>{item.label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}
