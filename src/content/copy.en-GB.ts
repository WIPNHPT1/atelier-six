export const copy = {
  brand: {
    name: 'Atelier Six',
  },
  nav: {
    today: 'Today',
    learn: 'Learn',
    practise: 'Practise',
    tuner: 'Tuner',
    you: 'You',
    search: '⌘K Search',
  },
  learn: {
    course: 'Course',
    chords: 'Chords',
  },
  you: {
    progress: 'Progress',
    settings: 'Settings',
  },
  today: {
    title: 'Today',
  },
  onboarding: {
    title: 'Welcome to the atelier',
    welcomeBody: 'A calm, focused way to learn guitar.',
    handTitle: 'Which hand do you play with',
    handLeft: 'Left-handed',
    handRight: 'Right-handed',
    levelTitle: 'Your level',
    levelNew: 'New to guitar',
    levelSomeChords: 'I know some chords',
    levelConfident: 'Confident with chords',
    tuningTitle: 'Tuning and capo',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    done: 'Start',
    stepLabel: 'Step {current} of {total}',
    restart: 'Redo onboarding',
  },
  course: {
    title: 'Course',
  },
  library: {
    title: 'Chord library',
  },
  lesson: {
    title: 'Lesson',
    keepFingers: 'Keep finger {fingers} where it is.',
  },
  practiseScreen: {
    title: 'Practise',
  },
  drills: {
    title: 'Drills',
  },
  tunerScreen: {
    title: 'Tuner',
  },
  progressScreen: {
    title: 'Progress',
  },
  settings: {
    title: 'Settings',
    mode: 'Appearance',
    modeDark: 'Dark',
    modeLight: 'Light',
    modeSystem: 'System',
    finish: 'Finish',
    motion: 'Motion',
    motionOn: 'On',
    motionOff: 'Off',
    motionSystem: 'System',
    sound: 'Sound',
    leftHanded: 'Left-handed',
    tuning: 'Tuning',
    tuningStandard: 'Standard',
    tuningHalfDown: 'Half-step down',
    tuningDropD: 'Drop D',
    capo: 'Capo',
  },
  design: {
    title: 'Design',
    colours: 'Colours',
    typeScale: 'Type scale',
    spacing: 'Spacing',
    components: 'Components',
    logo: 'Logo',
    finish: 'Finish',
    mode: 'Mode',
    motion: 'Motion',
    buttons: 'Buttons',
    loading: 'Loading',
    panels: 'Panels',
    dividers: 'Dividers',
    headings: 'Headings',
    text: 'Text',
    pills: 'Pills',
    slider: 'Slider',
    toggle: 'Toggle',
    segmented: 'Segmented control',
    dial: 'Dial',
    sheet: 'Sheet',
    openSheet: 'Open sheet',
    sheetDemo: 'Sheet demo',
    sheetBody: 'This is a bottom sheet on mobile and a side panel from 640px up.',
    typeSample: 'Aa',
    fretboard: 'Fretboard',
    transitionCard: 'Transition card',
  },
  transition: {
    keepOne: 'Keep finger {finger} where it is.',
    keepMany: 'Keep fingers {fingers} where they are.',
    lift: 'Lift finger {finger} to the {string} string, {fret} fret.',
    place: 'Place finger {finger} on the {string} string, {fret} fret.',
    release: 'Release finger {finger} from the {string} string.',
    slideOne: 'Slide fingers {fingers} together 1 fret towards the {direction}.',
    slideMany: 'Slide fingers {fingers} together {frets} frets towards the {direction}.',
    shiftOne: 'Move fingers {fingers} together across 1 string, towards the {thickness} strings.',
    shiftMany:
      'Move fingers {fingers} together across {strings} strings, towards the {thickness} strings.',
    bridge: 'bridge',
    headstock: 'headstock',
    thinner: 'thinner',
    thicker: 'thicker',
    difficultyGentle: 'Gentle',
    difficultyModerate: 'Moderate',
    difficultyDemanding: 'Demanding',
    overlayAnchor: 'Finger {finger} stays anchored.',
    overlayGuide: 'Finger {finger} guides to the {string} string, {fret} fret.',
    overlayLift: 'Finger {finger} lifts to the {string} string, {fret} fret.',
    overlayPlace: 'Finger {finger} places on the {string} string, {fret} fret.',
    overlayRelease: 'Finger {finger} releases.',
    overlayShiftGroup: 'Fingers {fingers} shift together.',
    overlaySlideGroup: 'Fingers {fingers} slide together.',
  },
  tabLane: {
    palmMute: 'P.M.',
    down: '↓',
    up: '↑',
  },
  fretboard: {
    barre: '{finger} finger barre {fromString} to {toString} string fret {fret}',
    fingerFret: '{finger} finger {string} string fret {fret}',
    openOne: '{strings} string open',
    openMany: '{strings} strings open',
    mutedOne: '{strings} string muted',
    mutedMany: '{strings} strings muted',
    and: 'and',
    thumb: 'thumb',
    startFret: '{fret}fr',
    mutedSymbol: '×',
    openSymbol: '○',
  },
  skipToContent: 'Skip to content',
  close: 'Close',
  commandPalette: {
    title: 'Command palette',
    placeholder: 'Search lessons, chords, drills, settings…',
    noResults: 'No matches',
    recent: 'Recent',
    startTuner: 'Start tuner',
    search: 'Search',
  },
};

type Copy = typeof copy;

type Path<T> = T extends string
  ? never
  : {
      [K in keyof T]: T[K] extends string ? K : `${K & string}.${Path<T[K]> & string}`;
    }[keyof T];

function resolve(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export function t(path: Path<Copy>, vars?: Record<string, string | number>): string {
  const value = resolve(copy, path);
  if (typeof value !== 'string') {
    throw new Error(`Missing copy for "${path}"`);
  }
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, key: string) => {
    const replacement = vars[key];
    return replacement === undefined ? match : String(replacement);
  });
}
