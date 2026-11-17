/**
 * Search normalisation, shared by the build (searchable text of each project)
 * and the browser (the visitor's query): NFD, combining marks removed, lower case.
 */
export const MAX_QUERY_LENGTH = 100;

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** The query split into normalised words; every word must be found. */
export function queryWords(query: string): string[] {
  return normalize(query.slice(0, MAX_QUERY_LENGTH)).split(/\s+/).filter(Boolean);
}

export function matchesWords(haystack: string, words: readonly string[]): boolean {
  return words.every((w) => haystack.includes(w));
}
