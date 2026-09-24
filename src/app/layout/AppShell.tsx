import { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';
import { Dock } from './Dock';
import { Rail } from './Rail';
import { Sidebar } from './Sidebar';
import { copy } from '../../content/copy.en-GB';
import { useApplySettings } from '../settingsStore';
import { Skeleton } from '../../ui/Skeleton';
import { IconButton } from '../../ui/IconButton';
import { SearchIcon } from '../../ui/icons';
import { CommandPalette } from '../../ui/CommandPalette/CommandPalette';
import { registerCommands } from '../../ui/CommandPalette/registerCommands';
import { defaultCommands } from '../../ui/CommandPalette/defaultCommands';
import { MiniPlayer } from '../../ui/MiniPlayer/MiniPlayer';

export function AppShell() {
  useApplySettings();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => registerCommands(defaultCommands), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <a className={styles.skipLink} href="#main">
        {copy.skipToContent}
      </a>
      <Sidebar
        onOpenPalette={() => {
          setPaletteOpen(true);
        }}
      />
      <Rail />
      <MiniPlayer />
      <Dock />
      <IconButton
        label={copy.commandPalette.search}
        className={styles.mobileSearch}
        onClick={() => {
          setPaletteOpen(true);
        }}
      >
        <SearchIcon />
      </IconButton>
      <main id="main" className={styles.content}>
        <Suspense fallback={<Skeleton width="100%" height={200} />}>
          <Outlet />
        </Suspense>
      </main>
      {paletteOpen ? (
        <CommandPalette
          onClose={() => {
            setPaletteOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
