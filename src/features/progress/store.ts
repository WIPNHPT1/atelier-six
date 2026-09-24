import { get, set } from 'idb-keyval';
import { useEffect } from 'react';
import { create } from 'zustand';
import { VERSION, emptyProgress, migrate, type ProgressData } from '../../core/progress/schema';

const KEY = 'a6.progress';

type ProgressStore = {
  data: ProgressData;
  loaded: boolean;
  load: () => Promise<void>;
  update: (change: (data: ProgressData) => ProgressData) => Promise<void>;
  exportJson: () => string;
  importJson: (text: string) => Promise<boolean>;
};

async function save(data: ProgressData): Promise<void> {
  try {
    await set(KEY, data);
  } catch {
    // No IndexedDB (private mode, old browser): progress lasts for this visit only.
  }
}

let loading: Promise<void> | null = null;

export const useProgress = create<ProgressStore>((setState, getState) => ({
  data: emptyProgress(),
  loaded: false,
  load: () => {
    loading ??= (async () => {
      let raw: unknown;
      try {
        raw = await get(KEY);
      } catch {
        raw = undefined;
      }
      setState({ data: migrate(raw), loaded: true });
    })();
    return loading;
  },
  update: async (change) => {
    await getState().load();
    const data = change(getState().data);
    setState({ data });
    await save(data);
  },
  exportJson: () => JSON.stringify(getState().data, null, 2),
  importJson: async (text) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return false;
    }
    const version = (parsed as { version?: unknown } | null)?.version;
    if (version !== VERSION && version !== 1) return false;
    const data = migrate(parsed);
    setState({ data, loaded: true });
    await save(data);
    return true;
  },
}));

// Test hook: forget the cached load so a fresh store reads storage again.
export function resetProgressForTests(data: ProgressData = emptyProgress()): void {
  loading = Promise.resolve();
  useProgress.setState({ data, loaded: true });
}

export function useProgressData(): ProgressData {
  const data = useProgress((s) => s.data);
  const load = useProgress((s) => s.load);
  useEffect(() => {
    void load();
  }, [load]);
  return data;
}
