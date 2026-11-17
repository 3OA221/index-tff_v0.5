import { VIEW_STORAGE_KEY } from '../../i18n/ui';

type View = 'grid' | 'list';

/** Grid / list toggle, remembered in localStorage (tff-view). */
export function initViewToggle(section: HTMLElement): void {
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('.view-toggle__btn')];

  const apply = (view: View) => {
    if (view === 'list') document.documentElement.dataset.view = 'list';
    else delete document.documentElement.dataset.view;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  };

  apply(document.documentElement.dataset.view === 'list' ? 'list' : 'grid');

  for (const b of buttons) {
    b.addEventListener('click', () => {
      const view: View = b.dataset.view === 'list' ? 'list' : 'grid';
      apply(view);
      try {
        localStorage.setItem(VIEW_STORAGE_KEY, view);
      } catch {
        // Storage unavailable: the view still changes for this page.
      }
    });
  }
}
