export const LANGS = ['cs', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'cs';

/** localStorage key for the language the visitor chose with the switch. */
export const LANG_STORAGE_KEY = 'tff-lang';
/** localStorage key for the works view (grid or list). */
export const VIEW_STORAGE_KEY = 'tff-view';

/** Interface strings (spec section 8). Content strings come from src/content/. */
export const ui = {
  cs: {
    skip: 'Přeskočit na obsah',
    language: 'Jazyk',
    langName: 'Čeština',
    langShort: 'CZ',
    about: [
      'Grafický design zkoumáme nejen prostřednictvím obrazu a textu, ale také prostřednictvím pohyblivého obrazu, prostoru a performance. Ateliér podporuje osobitý přístup – od knižního layoutu a hudebního videoklipu po výstavní architekturu.',
      'Analogové a digitální postupy se doplňují. Studenti mají k dispozici sítotisk, 3D tisk i videotechniku a spolupracují s externími tvůrci a kulturními institucemi.',
    ],
    projects: 'Projekty',
    filter: 'Filtr projektů',
    filterName: 'Jméno',
    filterMedium: 'Médium',
    filterYear: 'Rok',
    filterStudy: 'Ročník',
    search: 'Hledat',
    searchLabel: 'Hledat v projektech',
    clearFilter: 'Zrušit filtr: {label}',
    clearSearch: 'Zrušit hledání',
    view: 'Zobrazení',
    viewGrid: 'Mřížka',
    viewList: 'Seznam',
    count: '{n} z {m} projektů',
    nothingFound: 'Nic nenalezeno.',
    study: '{n}. ročník',
    back: '← Zpět',
    previous: '← Předchozí',
    next: 'Další →',
    previousLabel: 'Předchozí',
    nextLabel: 'Další',
    projectNotFound: 'Projekt nebyl nalezen.',
  },
  en: {
    skip: 'Skip to content',
    language: 'Language',
    langName: 'English',
    langShort: 'EN',
    about: [
      'We explore graphic design beyond image and text: through moving image, space and performance. The atelier supports an individual approach, from book layout and music video to exhibition architecture.',
      'Analog and digital processes complement each other. Students have access to screen printing, 3D printing and video equipment, and work with invited practitioners and cultural institutions.',
    ],
    projects: 'Projects',
    filter: 'Filter projects',
    filterName: 'Name',
    filterMedium: 'Medium',
    filterYear: 'Year',
    filterStudy: 'Study year',
    search: 'Search',
    searchLabel: 'Search projects',
    clearFilter: 'Clear filter: {label}',
    clearSearch: 'Clear search',
    view: 'View',
    viewGrid: 'Grid',
    viewList: 'List',
    count: '{n} of {m} projects',
    nothingFound: 'Nothing found.',
    study: 'Year {n}',
    back: '← Back',
    previous: '← Previous',
    next: 'Next →',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    projectNotFound: 'Project not found.',
  },
} as const satisfies Record<Lang, Record<string, string | readonly string[]>>;

/** Fill `{name}` placeholders. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

/** "N. ročník" / "Year N". */
export function studyLabel(lang: Lang, n: number): string {
  return fmt(ui[lang].study, { n });
}
