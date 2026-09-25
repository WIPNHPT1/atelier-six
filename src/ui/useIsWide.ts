import { useEffect, useState } from 'react';

const WIDE_QUERY = '(min-width: 720px)';

export function useIsWide(): boolean {
  const [isWide, setIsWide] = useState(() => window.matchMedia(WIDE_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    const handler = () => {
      setIsWide(mql.matches);
    };
    handler();
    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  return isWide;
}
