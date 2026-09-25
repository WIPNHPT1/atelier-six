import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorMode = 'dark' | 'light' | 'system';
export type Finish = 'nitro' | 'xerox' | 'sunburst' | 'faded' | 'stencil';
export type MotionSetting = 'on' | 'off' | 'system';
export type Tuning = 'standard' | 'halfDown' | 'dropD';
export type Level = 'new' | 'someChords' | 'confident';

export type Settings = {
  mode: ColorMode;
  finish: Finish;
  motion: MotionSetting;
  sound: boolean;
  leftHanded: boolean;
  tuning: Tuning;
  capo: number;
  a4: number;
  level: Level;
  onboardingComplete: boolean;
  robotMode: boolean;
  voiceCommands: boolean;
  pinnedFinish: boolean;
  haptics: boolean;
};

export type SettingsStore = Settings & {
  setMode: (mode: ColorMode) => void;
  setFinish: (finish: Finish) => void;
  setMotion: (motion: MotionSetting) => void;
  setSound: (sound: boolean) => void;
  setLeftHanded: (leftHanded: boolean) => void;
  setTuning: (tuning: Tuning) => void;
  setCapo: (capo: number) => void;
  setA4: (a4: number) => void;
  setLevel: (level: Level) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setRobotMode: (robotMode: boolean) => void;
  setVoiceCommands: (voiceCommands: boolean) => void;
  setPinnedFinish: (pinnedFinish: boolean) => void;
  setHaptics: (haptics: boolean) => void;
};

const defaultSettings: Settings = {
  mode: 'dark',
  finish: 'nitro',
  motion: 'system',
  sound: true,
  leftHanded: false,
  tuning: 'standard',
  capo: 0,
  a4: 440,
  level: 'new',
  onboardingComplete: false,
  robotMode: false,
  voiceCommands: false,
  pinnedFinish: false,
  haptics: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setMode: (mode) => {
        set({ mode });
      },
      setFinish: (finish) => {
        set({ finish });
      },
      setMotion: (motion) => {
        set({ motion });
      },
      setSound: (sound) => {
        set({ sound });
      },
      setLeftHanded: (leftHanded) => {
        set({ leftHanded });
      },
      setTuning: (tuning) => {
        set({ tuning });
      },
      setCapo: (capo) => {
        set({ capo: Math.min(7, Math.max(0, capo)) });
      },
      setA4: (a4) => {
        set({ a4: Math.min(450, Math.max(430, a4)) });
      },
      setLevel: (level) => {
        set({ level });
      },
      setOnboardingComplete: (onboardingComplete) => {
        set({ onboardingComplete });
      },
      setRobotMode: (robotMode) => {
        set({ robotMode });
      },
      setVoiceCommands: (voiceCommands) => {
        set({ voiceCommands });
      },
      setPinnedFinish: (pinnedFinish) => {
        set({ pinnedFinish });
      },
      setHaptics: (haptics) => {
        set({ haptics });
      },
    }),
    { name: 'a6.settings' },
  ),
);

function resolveMode(mode: ColorMode): 'dark' | 'light' {
  if (mode !== 'system') return mode;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveMotion(motion: MotionSetting): 'on' | 'off' {
  if (motion !== 'system') return motion;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
}

export function useMotionEnabled(): boolean {
  const motion = useSettingsStore((s) => s.motion);
  return resolveMotion(motion) === 'on';
}

export function useApplySettings(): void {
  const mode = useSettingsStore((s) => s.mode);
  const finish = useSettingsStore((s) => s.finish);
  const motion = useSettingsStore((s) => s.motion);
  const leftHanded = useSettingsStore((s) => s.leftHanded);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', resolveMode(mode));
    root.setAttribute('data-finish', finish);
    root.setAttribute('data-motion', resolveMotion(motion));
    root.setAttribute('data-hand', leftHanded ? 'left' : 'right');
  }, [mode, finish, motion, leftHanded]);
}
