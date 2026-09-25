import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';
import { Text } from '../../ui/Text';
import { copy } from '../../content/copy.en-GB';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (installed) {
    return <Text dim>{copy.settings.installed}</Text>;
  }

  if (installEvent) {
    return (
      <Button
        variant="quiet"
        onClick={() => {
          void installEvent
            .prompt()
            .then(() => installEvent.userChoice)
            .then(() => {
              setInstallEvent(null);
            });
        }}
      >
        {copy.settings.installAction}
      </Button>
    );
  }

  if (isIos()) {
    return (
      <Text dim size="small">
        {copy.settings.installIosHint}
      </Text>
    );
  }

  return null;
}
