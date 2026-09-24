export type VoiceAction =
  | { type: 'play' }
  | { type: 'stop' }
  | { type: 'slower' }
  | { type: 'faster' }
  | { type: 'toggleLoop' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'tempo'; bpm: number };

const PATTERNS: [RegExp, (match: RegExpMatchArray) => VoiceAction][] = [
  [/^(play|start)$/, () => ({ type: 'play' })],
  [/^(stop|pause)$/, () => ({ type: 'stop' })],
  [/^(slower|slow down)$/, () => ({ type: 'slower' })],
  [/^(faster|speed up)$/, () => ({ type: 'faster' })],
  [/^loop$/, () => ({ type: 'toggleLoop' })],
  [/^next$/, () => ({ type: 'next' })],
  [/^(back|previous)$/, () => ({ type: 'prev' })],
  [/^tempo (\d+)$/, (match) => ({ type: 'tempo', bpm: Number(match[1]) })],
];

// Case/whitespace tolerant; a phrase this doesn't recognise is just ignored.
export function parseCommand(transcript: string): VoiceAction | null {
  const normalised = transcript.trim().toLowerCase().replace(/\s+/g, ' ');
  for (const [pattern, build] of PATTERNS) {
    const match = normalised.match(pattern);
    if (match) return build(match);
  }
  return null;
}
