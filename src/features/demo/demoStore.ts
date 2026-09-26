import { create } from 'zustand';

type DemoStore = { active: boolean; setActive: (active: boolean) => void };

export const useDemoStore = create<DemoStore>()((set) => ({
  active: false,
  setActive: (active) => {
    set({ active });
  },
}));
