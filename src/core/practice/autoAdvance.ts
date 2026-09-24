export type AutoAdvanceState = 'idle' | 'listening' | 'heard' | 'advanced';

export type AutoAdvanceContext = {
  state: AutoAdvanceState;
  // When the target was first heard without interruption, for the hold debounce.
  heardSince: number | null;
};

const HOLD_MS = 250;

export function initAutoAdvance(): AutoAdvanceContext {
  return { state: 'idle', heardSince: null };
}

export function startListening(): AutoAdvanceContext {
  return { state: 'listening', heardSince: null };
}

export function stopListening(): AutoAdvanceContext {
  return { state: 'idle', heardSince: null };
}

// Called on every detected-pitch frame; matched is whether it's the target root right now.
export function tickAutoAdvance(
  context: AutoAdvanceContext,
  matched: boolean,
  now: number,
): AutoAdvanceContext {
  if (context.state === 'idle' || context.state === 'advanced') return context;

  if (!matched) return { state: 'listening', heardSince: null };

  const heardSince = context.heardSince ?? now;
  if (now - heardSince >= HOLD_MS) return { state: 'advanced', heardSince };
  return { state: 'heard', heardSince };
}
