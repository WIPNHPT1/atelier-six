import type { Command } from './registerCommands';
import { copy } from '../../content/copy.en-GB';
import { openReportProblem } from '../../app/reportProblem';

export const defaultCommands: Command[] = [
  {
    id: 'nav-start',
    group: 'Actions',
    label: copy.nav.start,
    run: ({ navigate }) => {
      void navigate('/');
    },
  },
  {
    id: 'nav-today',
    group: 'Actions',
    label: copy.nav.today,
    run: ({ navigate }) => {
      void navigate('/today');
    },
  },
  {
    id: 'nav-learn',
    group: 'Actions',
    label: copy.nav.learn,
    run: ({ navigate }) => {
      void navigate('/course');
    },
  },
  {
    id: 'nav-practise',
    group: 'Actions',
    label: copy.nav.practise,
    run: ({ navigate }) => {
      void navigate('/practise');
    },
  },
  {
    id: 'nav-tuner',
    group: 'Actions',
    label: copy.commandPalette.startTuner,
    keywords: ['tuner'],
    run: ({ navigate }) => {
      void navigate('/tuner');
    },
  },
  {
    id: 'nav-progress',
    group: 'Actions',
    label: copy.progressScreen.title,
    run: ({ navigate }) => {
      void navigate('/progress');
    },
  },
  {
    id: 'nav-settings',
    group: 'Settings',
    label: copy.settings.title,
    run: ({ navigate }) => {
      void navigate('/settings');
    },
  },
  {
    id: 'nav-chords',
    group: 'Chords',
    label: copy.library.title,
    run: ({ navigate }) => {
      void navigate('/library');
    },
  },
  {
    id: 'nav-drills',
    group: 'Drills',
    label: copy.drills.title,
    run: ({ navigate }) => {
      void navigate('/drills');
    },
  },
  {
    id: 'report-problem',
    group: 'Settings',
    label: copy.commandPalette.reportProblem,
    keywords: ['bug', 'issue', 'feedback'],
    run: () => {
      openReportProblem();
    },
  },
  {
    id: 'nav-about',
    group: 'Settings',
    label: copy.commandPalette.about,
    keywords: ['about', 'privacy', 'how it works'],
    run: ({ navigate }) => {
      void navigate('/about');
    },
  },
];
