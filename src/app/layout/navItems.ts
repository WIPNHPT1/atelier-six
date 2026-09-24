import { ArcIcon, PinIcon, PlayIcon, SettingsIcon, TunerIcon } from '../../ui/icons';
import { copy } from '../../content/copy.en-GB';
import type { ComponentType, SVGProps } from 'react';

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const navItems: NavItem[] = [
  { to: '/', label: copy.nav.today, icon: ArcIcon },
  { to: '/course', label: copy.nav.learn, icon: PinIcon },
  { to: '/practise', label: copy.nav.practise, icon: PlayIcon },
  { to: '/tuner', label: copy.nav.tuner, icon: TunerIcon },
  { to: '/progress', label: copy.nav.you, icon: SettingsIcon },
];
