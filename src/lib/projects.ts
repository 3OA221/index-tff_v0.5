import { getCollection, type CollectionEntry } from 'astro:content';
import { normalize } from './search';

export type Project = CollectionEntry<'projects'>['data'];
export type Medium = CollectionEntry<'mediums'>['data'];
export type StripItem = CollectionEntry<'strip'>['data'];

/** Site order: newest year first, then project id ascending. Used by the grid and Previous / Next. */
export function compareProjects(a: Project, b: Project): number {
  return b.year - a.year || a.id.localeCompare(b.id);
}

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projects');
  return entries.map((e) => e.data).sort(compareProjects);
}

export async function getMediums(): Promise<Medium[]> {
  return (await getCollection('mediums')).map((e) => e.data);
}

export async function getStripItems(): Promise<StripItem[]> {
  return (await getCollection('strip')).map((e) => e.data);
}

/** Previous and next project in site order; undefined at either end. */
export function neighbours(
  ordered: Project[],
  id: string,
): { prev: Project | undefined; next: Project | undefined } {
  const i = ordered.findIndex((p) => p.id === id);
  return { prev: i > 0 ? ordered[i - 1] : undefined, next: i >= 0 ? ordered[i + 1] : undefined };
}

/** Tab title of a work page: "Authors - Title". */
export function workTitle(p: Project): string {
  return `${p.authors.join(', ')} - ${p.title.cs}`;
}

/**
 * Normalised searchable text of a project: id, title, authors, year, study year
 * ("N. ročník" and "year N"), both descriptions, both format texts,
 * collaborator and credit names, and the Czech and English medium labels.
 */
export function searchText(p: Project, mediums: Medium[]): string {
  const labels = p.mediums.flatMap((id) => {
    const m = mediums.find((x) => x.id === id);
    return m ? [m.cs, m.en] : [];
  });
  return normalize(
    [
      p.id,
      p.title.cs,
      p.title.en,
      ...p.authors,
      String(p.year),
      `${p.study}. ročník`,
      `year ${p.study}`,
      p.description.original,
      p.description.en,
      p.format.cs,
      p.format.en,
      ...p.collaborators.map((c) => c.name),
      ...p.credits.map((c) => c.name),
      ...labels,
    ].join('\n'),
  );
}

/** Medium labels of a project in one language, in the data's order. */
export function mediumLabels(p: Project, mediums: Medium[], lang: 'cs' | 'en'): string[] {
  return p.mediums.flatMap((id) => {
    const m = mediums.find((x) => x.id === id);
    return m ? [m[lang]] : [];
  });
}
