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
    backLabel: 'Zpět',
    previous: '← Předchozí',
    next: 'Další →',
    previousLabel: 'Předchozí',
    nextLabel: 'Další',
    projectNotFound: 'Projekt nebyl nalezen.',
    authorOne: 'Autorství',
    authorMany: 'Autorství',
    collaboration: 'Spolupráce',
    year: 'Rok',
    studyYear: 'Ročník',
    medium: 'Médium',
    format: 'Formát',
    duration: 'Stopáž',
    draftNote: '',
    original: '',
    langCs: 'česky',
    langSk: 'slovensky',
    images: 'Obrázky',
    gallery: 'Galerie',
    close: 'Zavřít',
    openNewTab: 'Otevřít obrázek na nové kartě',
    enlarge: 'Zvětšit obrázek {n}',
    imageN: 'Obrázek {n}',
    announcements: 'Aktuality',
    footerContact: 'Kontakt',
    contactLines: [
      'Ateliér TFF, místnost 334',
      'Fakulta umění, OU',
      'Černá louka 3398',
      'Moravská Ostrava',
    ],
    footerUniversity: 'Univerzita',
    universityLines: [
      'Grafický design a vizuální komunikace',
      'Ostravská univerzita',
      'Fakulta umění',
      'Katedra grafiky a kresby',
    ],
    footerInstructors: 'Instruktoři',
    footerPast: 'Dřívější spolupráce',
    pastText: 'Galerie PLATO, sborník Oáza a kniha kolektivu Tiqqun s galerií Display.',
    draftVersion: 'Neoficiální pracovní verze {version}, build {build}',
    initiative: 'Studentská iniciativa',
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
    backLabel: 'Back',
    previous: '← Previous',
    next: 'Next →',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    projectNotFound: 'Project not found.',
    authorOne: 'Author',
    authorMany: 'Authors',
    collaboration: 'Collaboration',
    year: 'Year',
    studyYear: 'Study year',
    medium: 'Medium',
    format: 'Format',
    duration: 'Duration',
    draftNote: 'English text: draft translation, not yet reviewed by the author.',
    original: 'Original ({lang})',
    langCs: 'Czech',
    langSk: 'Slovak',
    images: 'Images',
    gallery: 'Gallery',
    close: 'Close',
    openNewTab: 'Open image in a new tab',
    enlarge: 'Enlarge image {n}',
    imageN: 'Image {n}',
    announcements: 'Announcements',
    footerContact: 'Contact',
    contactLines: [
      'TFF Atelier, Room 334',
      'Faculty of Fine Arts, OU',
      'Černá louka 3398',
      'Moravská Ostrava',
    ],
    footerUniversity: 'University',
    universityLines: [
      'Graphic Design and Visual Communication',
      'University of Ostrava',
      'Faculty of Fine Arts',
      'Department of Graphics and Drawing',
    ],
    footerInstructors: 'Instructors',
    footerPast: 'Past collaborations',
    pastText:
      'PLATO Gallery, the Oáza anthology and a book by the Tiqqun collective with the Display gallery.',
    draftVersion: 'Unofficial working draft {version}, build {build}',
    initiative: 'Student initiative',
  },
} as const satisfies Record<Lang, Record<string, string | readonly string[]>>;

/** Instructors (the same in both languages). */
export const INSTRUCTORS = [
  'doc. Justyna Szklarczyk-Lauer',
  'MgA. Matěj Doležel',
  'MgA. Jakub Adamec, Ph.D.',
];

/** Footer links (spec 6.1.7). */
export const CONTACT = {
  email: 'textformafunkce@gmail.com',
  instagram: 'https://www.instagram.com/text_forma_funkce/',
  university: 'https://fu.osu.cz/',
};

/** Fill `{name}` placeholders. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

/** "N. ročník" / "Year N". */
export function studyLabel(lang: Lang, n: number): string {
  return fmt(ui[lang].study, { n });
}
