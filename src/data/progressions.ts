export type ProgressionPreset = {
  id: string;
  roman: string[];
  beatsPerChord: number[];
  loop: boolean;
};

function preset(id: string, roman: string[], beatsPerChord: number[]): ProgressionPreset {
  return { id, roman, beatsPerChord, loop: true };
}

const BEATS_PER_BAR = 4;

export const PROGRESSIONS: ProgressionPreset[] = [
  preset('I-V-vi-IV', ['I', 'V', 'vi', 'IV'], Array(4).fill(BEATS_PER_BAR) as number[]),
  preset('vi-IV-I-V', ['vi', 'IV', 'I', 'V'], Array(4).fill(BEATS_PER_BAR) as number[]),
  preset('I-IV-V', ['I', 'IV', 'V'], Array(3).fill(BEATS_PER_BAR) as number[]),
  preset('I-vi-IV-V', ['I', 'vi', 'IV', 'V'], Array(4).fill(BEATS_PER_BAR) as number[]),
  preset('ii-V-I', ['ii', 'V', 'I'], Array(3).fill(BEATS_PER_BAR) as number[]),
  preset('I-IV-vi-V', ['I', 'IV', 'vi', 'V'], Array(4).fill(BEATS_PER_BAR) as number[]),
  preset(
    '12-bar-blues',
    ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
    Array(12).fill(BEATS_PER_BAR) as number[],
  ),
];
