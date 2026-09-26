import { Suspense, lazy, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styles from './AppShell.module.css';
import { Dock } from './Dock';
import { Rail } from './Rail';
import { Sidebar } from './Sidebar';
import { copy } from '../../content/copy.en-GB';
import { useApplySettings, useSettingsStore } from '../settingsStore';
import { Skeleton } from '../../ui/Skeleton';
import { IconButton } from '../../ui/IconButton';
import { SearchIcon } from '../../ui/icons';
import { CommandPalette } from '../../ui/CommandPalette/CommandPalette';
import { registerCommands } from '../../ui/CommandPalette/registerCommands';
import { defaultCommands } from '../../ui/CommandPalette/defaultCommands';
import { MiniPlayer } from '../../ui/MiniPlayer/MiniPlayer';
import { useShortcuts } from '../../ui/shortcuts/useShortcuts';
import { ShortcutsOverlay } from '../../ui/shortcuts/ShortcutsOverlay';
import { useVoiceCommands } from '../../features/voice/useVoiceCommands';
import { Pill } from '../../ui/Pill';
import { PwaToasts } from '../PwaToasts';
import { requestTiltPermission } from '../../ui/brassSheen/tiltStore';

const DemoRunner = lazy(() => import('../../features/demo/DemoRunner'));

export function AppShell() {
  const [demoRequested] = useState(
    () => new URLSearchParams(window.location.search).get('demo') === '1',
  );
  useApplySettings();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const voiceEnabled = useSettingsStore((s) => s.voiceCommands);
  const { listening } = useVoiceCommands(voiceEnabled);

  useShortcuts({
    onHelp: () => {
      setShortcutsOpen(true);
    },
    onTuner: () => {
      void navigate('/tuner');
    },
  });

  useEffect(() => registerCommands(defaultCommands), []);

  // Lessons and chords live in their own chunk so the entry bundle stays small.
  useEffect(() => {
    let unregister: (() => void) | undefined;
    let cancelled = false;
    void import('../../features/lesson/commands').then(({ courseCommands }) => {
      if (!cancelled) unregister = registerCommands(courseCommands());
    });
    return () => {
      cancelled = true;
      unregister?.();
    };
  }, []);

  // The brass sheen follows device tilt on iOS, but iOS only grants that permission from
  // inside a tap — ask once, on the app's first tap, so it's never a jarring prompt.
  useEffect(() => {
    function handleFirstPointerDown() {
      void requestTiltPermission();
      document.removeEventListener('pointerdown', handleFirstPointerDown);
    }
    document.addEventListener('pointerdown', handleFirstPointerDown, { once: true });
    return () => {
      document.removeEventListener('pointerdown', handleFirstPointerDown);
    };
  }, []);

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
      {/* Wrapper owns position/visibility: a class on IconButton itself loses to
          IconButton's own `display` depending on CSS chunk order. */}
      <div className={styles.mobileSearch} data-testid="mobile-search">
        <IconButton
          label={copy.commandPalette.search}
          onClick={() => {
            setPaletteOpen(true);
          }}
        >
          <SearchIcon />
        </IconButton>
      </div>
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
      <ShortcutsOverlay
        open={shortcutsOpen}
        onClose={() => {
          setShortcutsOpen(false);
        }}
      />
      {listening ? (
        <div className={styles.voiceIndicator} role="status">
          <Pill accent>{copy.shortcuts.listeningForCommands}</Pill>
        </div>
      ) : null}
      <PwaToasts />
      {demoRequested ? (
        <Suspense fallback={null}>
          <DemoRunner />
        </Suspense>
      ) : null}
    </>
  );
}
