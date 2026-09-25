import { useEffect } from 'react';
import { usePwaUpdate } from './usePwaUpdate';
import { Toast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { copy } from '../content/copy.en-GB';

const OFFLINE_READY_TIMEOUT_MS = 4000;

export function PwaToasts() {
  const { needRefresh, offlineReady, reload, dismissOfflineReady } = usePwaUpdate();

  useEffect(() => {
    if (!offlineReady) return;
    const timer = window.setTimeout(dismissOfflineReady, OFFLINE_READY_TIMEOUT_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [offlineReady, dismissOfflineReady]);

  if (needRefresh) {
    return (
      <Toast
        action={
          <Button size="small" variant="quiet" onClick={reload}>
            {copy.pwa.reload}
          </Button>
        }
      >
        {copy.pwa.updateAvailable}
      </Toast>
    );
  }

  if (offlineReady) {
    return <Toast>{copy.pwa.offlineReady}</Toast>;
  }

  return null;
}
