import { fmt } from '../../i18n/ui';
import { MAX_QUERY_LENGTH, matchesWords, queryWords } from '../../lib/search';
import { Combobox } from './combobox';
import { initPreviews } from './preview';
import { initViewToggle } from './view';

/**
 * Works filters: search plus four comboboxes, combined with AND. State lives in
 * the URL (?q=&name=&medium=&year=&study=), written with replaceState.
 */
const KEYS = ['name', 'medium', 'year', 'study'] as const;
type Key = (typeof KEYS)[number];

const section = document.getElementById('works');
if (section) init(section);

function init(section: HTMLElement): void {
  const grid = section.querySelector<HTMLElement>('[data-grid]')!;
  const tiles = [...grid.querySelectorAll<HTMLElement>('.tile')];
  const status = section.querySelector<HTMLElement>('[data-status]')!;
  const empty = section.querySelector<HTMLElement>('[data-empty]')!;
  const searchField = section.querySelector<HTMLElement>('[data-search-field]')!;
  const input = searchField.querySelector<HTMLInputElement>('input')!;
  const clearSearch = searchField.querySelector<HTMLButtonElement>('[data-clear]')!;
  const langLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]')];
  const langBase = langLinks.map((a) => a.getAttribute('href') ?? '');

  const combos = new Map<Key, Combobox>();
  for (const root of section.querySelectorAll<HTMLElement>('[data-combo]')) {
    const combo = new Combobox(root, () => update());
    combos.set(combo.key as Key, combo);
  }

  // Read the URL; invalid values are ignored.
  const params = new URLSearchParams(location.search);
  input.value = (params.get('q') ?? '').slice(0, MAX_QUERY_LENGTH);
  for (const key of KEYS) combos.get(key)?.set(params.get(key), false);

  let statusTimer: number | undefined;

  function update(announce = true): void {
    const words = queryWords(input.value);
    const v = (k: Key) => combos.get(k)?.value ?? null;
    const name = v('name');
    const medium = v('medium');
    const year = v('year');
    const study = v('study');

    let shown = 0;
    for (const tile of tiles) {
      const d = tile.dataset;
      const ok =
        matchesWords(d.search ?? '', words) &&
        (!name || (d.authors ?? '').split('\n').includes(name)) &&
        (!medium || (d.mediums ?? '').split(' ').includes(medium)) &&
        (!year || d.year === year) &&
        (!study || d.study === study);
      tile.hidden = !ok;
      tile.classList.toggle('is-first', ok && shown === 0);
      if (ok) shown++;
    }

    const active = input.value.trim() !== '';
    searchField.classList.toggle('is-active', active);
    clearSearch.hidden = !active;
    empty.hidden = shown > 0;
    grid.hidden = shown === 0;

    const text = fmt(status.dataset.template ?? '', { n: shown, m: tiles.length });
    window.clearTimeout(statusTimer);
    if (announce) statusTimer = window.setTimeout(() => (status.textContent = text), 400);
    else status.textContent = text;

    writeUrl();
  }

  function writeUrl(): void {
    const out = new URLSearchParams();
    const q = input.value.trim();
    if (q) out.set('q', q);
    for (const key of KEYS) {
      const value = combos.get(key)?.value;
      if (value) out.set(key, value);
    }
    const search = out.toString() ? `?${out.toString()}` : '';
    if (search !== location.search) {
      history.replaceState(history.state, '', `${location.pathname}${search}${location.hash}`);
    }
    // The language switch keeps the current filters.
    langLinks.forEach((a, i) => a.setAttribute('href', `${langBase[i]}${search}`));
  }

  input.addEventListener('input', () => update());
  input.addEventListener('search', () => update()); // Escape in some browsers
  clearSearch.addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });

  update(false);
  initViewToggle(section);
  initPreviews(grid);
}
