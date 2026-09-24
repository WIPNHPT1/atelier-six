// The hand-health warm-up is offered before demanding lessons and long sessions, once a day.
export const HAND_HEALTH_LESSONS = ['power-stamina'];
export const LONG_SESSION_MINUTES = 30;
export const WARMUP_SECONDS = 120;

export type HandWarmupContext = {
  lessonId?: string;
  minutesToday: number;
  lastWarmup: string;
  today: string;
};

export function offerHandWarmup({
  lessonId,
  minutesToday,
  lastWarmup,
  today,
}: HandWarmupContext): boolean {
  if (lastWarmup === today) return false;
  return (
    (lessonId !== undefined && HAND_HEALTH_LESSONS.includes(lessonId)) ||
    minutesToday > LONG_SESSION_MINUTES
  );
}

// Gentle movements, one every 20 seconds over two minutes (copy keys).
export const MOVEMENTS = ['shake', 'fists', 'spread', 'thumbs', 'wrists', 'breathe'] as const;
export type Movement = (typeof MOVEMENTS)[number];

export function movementAt(elapsedSeconds: number): Movement | null {
  if (elapsedSeconds >= WARMUP_SECONDS) return null;
  const each = WARMUP_SECONDS / MOVEMENTS.length;
  return MOVEMENTS[Math.max(0, Math.floor(elapsedSeconds / each))] as Movement;
}
