import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import styles from './AppShell.module.css'
import { Dock } from './Dock'
import { Rail } from './Rail'
import { Sidebar } from './Sidebar'
import { copy } from '../../content/copy.en-GB'
import { useApplySettings } from '../settingsStore'

export function AppShell() {
  useApplySettings()

  return (
    <>
      <a className={styles.skipLink} href="#main">
        {copy.skipToContent}
      </a>
      <Sidebar />
      <Rail />
      <Dock />
      <main id="main" className={styles.content}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}
