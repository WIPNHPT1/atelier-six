export function smooth(prev: number, next: number, alpha: number): number {
  return prev + alpha * (next - prev);
}
