import { ArcIcon, BracketIcon, PinIcon, SettingsIcon, TunerIcon } from '../../ui/icons';
import { copy } from '../../content/copy.en-GB';
import type { ComponentType, SVGProps } from 'react';
export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};
export const navItems: NavItem[] = [
  { to: '/', label: copy.nav.start, icon: ArcIcon },
  { to: '/course', label: copy.nav.learn, icon: PinIcon },
  { to: '/library', label: copy.nav.chords, icon: BracketIcon },
  { to: '/tuner', label: copy.nav.tuner, icon: TunerIcon },
  { to: '/settings', label: copy.nav.settings, icon: SettingsIcon },
];
