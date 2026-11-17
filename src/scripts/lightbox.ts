/**
 * Lightbox (spec 6.4): a modal <dialog> over the whole screen. Previous / Next
 * buttons and the Left / Right keys wrap around; clicking the backdrop closes;
 * Escape closes (native). Focus returns to the image that opened it.
 */
const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
const openers = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox-index]')];
if (dialog && openers.length) init(dialog, openers);

function init(dialog: HTMLDialogElement, openers: HTMLButtonElement[]): void {
  const q = <T extends Element>(sel: string) => dialog.querySelector<T>(sel);
  const img = q<HTMLImageElement>('[data-lightbox-img]')!;
  const stage = q<HTMLElement>('[data-lightbox-stage]')!;
  const status = q<HTMLElement>('[data-lightbox-status]')!;
  const newTab = q<HTMLAnchorElement>('[data-lightbox-newtab]')!;
  const segments = [...dialog.querySelectorAll<HTMLButtonElement>('[data-lightbox-seg]')];
  const total = openers.length;
  let current = 0;
  let opener: HTMLElement | null = null;

  function show(index: number): void {
    current = (index + total) % total;
    const button = openers[current]!;
    const thumb = button.querySelector('img');
    img.src = button.dataset.full ?? '';
    img.width = Number(button.dataset.w);
    img.height = Number(button.dataset.h);
    img.alt = thumb?.alt ?? '';
    newTab.href = button.dataset.full ?? '#';
    segments.forEach((s, i) => {
      s.classList.toggle('is-filled', i <= current);
      s.classList.toggle('is-current', i === current);
      if (i === current) s.setAttribute('aria-current', 'true');
      else s.removeAttribute('aria-current');
    });
    status.textContent = `${current + 1} / ${total}`;
  }

  function open(index: number, from: HTMLElement): void {
    opener = from;
    show(index);
    dialog.showModal();
  }

  openers.forEach((b, i) => b.addEventListener('click', () => open(i, b)));
  q('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  q('[data-lightbox-prev]')?.addEventListener('click', () => show(current - 1));
  q('[data-lightbox-next]')?.addEventListener('click', () => show(current + 1));
  segments.forEach((s, i) => s.addEventListener('click', () => show(i)));

  dialog.addEventListener('keydown', (e) => {
    if (total < 2) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(current - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(current + 1);
    }
  });
  // Clicks outside the image and the controls land on the dialog or the stage.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target === stage) dialog.close();
  });
  dialog.addEventListener('close', () => {
    status.textContent = '';
    opener?.focus();
  });
}
