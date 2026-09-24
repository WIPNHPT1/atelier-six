export type FuzzyMatch = {
  score: number;
  indices: number[];
};

const WORD_BOUNDARY = /[\s\-_/]/;

export function fuzzyMatch(query: string, target: string): FuzzyMatch | null {
  if (query.length === 0) return { score: 0, indices: [] };

  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const indices: number[] = [];
  let queryIndex = 0;
  let score = 0;
  let previousMatchIndex = -2;

  for (let targetIndex = 0; targetIndex < t.length && queryIndex < q.length; targetIndex++) {
    if (t[targetIndex] !== q[queryIndex]) continue;

    let bonus = 1;
    if (targetIndex === previousMatchIndex + 1) bonus += 3;
    if (targetIndex === 0 || WORD_BOUNDARY.test(t.charAt(targetIndex - 1))) bonus += 2;

    score += bonus;
    indices.push(targetIndex);
    previousMatchIndex = targetIndex;
    queryIndex++;
  }

  if (queryIndex < q.length) return null;

  // indices is non-empty here: queryIndex reached q.length, which is > 0.
  const firstIndex = indices[0] as number;
  const lastIndex = indices[indices.length - 1] as number;
  score -= firstIndex * 0.1;
  score -= (t.length - lastIndex) * 0.01;

  return { score, indices };
}

export type FuzzyResult<T> = {
  item: T;
  score: number;
  indices: number[];
};

export function fuzzySearch<T>(
  query: string,
  items: T[],
  getLabel: (item: T) => string,
): FuzzyResult<T>[] {
  if (query.length === 0) {
    return items.map((item) => ({ item, score: 0, indices: [] }));
  }

  const results: FuzzyResult<T>[] = [];
  for (const item of items) {
    const match = fuzzyMatch(query, getLabel(item));
    if (match) {
      results.push({ item, score: match.score, indices: match.indices });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
