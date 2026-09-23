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
  },
  skipToContent: 'Skip to content',
  close: 'Close',
}

type Copy = typeof copy

type Path<T> = T extends string
  ? never
  : {
      [K in keyof T]: T[K] extends string ? K : `${K & string}.${Path<T[K]> & string}`
    }[keyof T]

function resolve(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, source)
}

export function t(path: Path<Copy>, vars?: Record<string, string | number>): string {
  const value = resolve(copy, path)
  if (typeof value !== 'string') {
    throw new Error(`Missing copy for "${path}"`)
  }
  if (!vars) return value
  return value.replace(/\{(\w+)\}/g, (match, key: string) => {
    const replacement = vars[key]
    return replacement === undefined ? match : String(replacement)
  })
}
