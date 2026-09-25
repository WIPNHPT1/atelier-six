import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export type PwaUpdateState = {
  needRefresh: boolean;
  offlineReady: boolean;
  reload: () => void;
  dismissOfflineReady: () => void;
};

export function usePwaUpdate(): PwaUpdateState {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    updateRef.current = registerSW({
      onNeedRefresh: () => {
        setNeedRefresh(true);
      },
      onOfflineReady: () => {
        setOfflineReady(true);
      },
    });
  }, []);

  return {
    needRefresh,
    offlineReady,
    reload: () => {
      void updateRef.current?.(true);
    },
    dismissOfflineReady: () => {
      setOfflineReady(false);
    },
  };
}
