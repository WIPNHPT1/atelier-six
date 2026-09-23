export type Tuning = [number, number, number, number, number, number];

export const standard: Tuning = [40, 45, 50, 55, 59, 64];
export const halfDown: Tuning = standard.map((midi) => midi - 1) as Tuning;
export const dropD: Tuning = [38, 45, 50, 55, 59, 64];

export function openStringMidi(tuning: Tuning, capo = 0): Tuning {
  return tuning.map((midi) => midi + capo) as Tuning;
}
