/**
 * Announcement strip loop (spec 6.1.1). The items are repeated until one set
 * is wider than the strip; the set is shown twice so the loop has no seam.
 * Constant speed (55 px/s), so the duration follows the set width. Pauses on
 * hover. Reduced motion: static, first item only (CSS). Rebuilt on resize
 * (debounced) and when the fonts finish loading. Repeats are aria-hidden.
 */
const SPEED = 55; // px per second

const strip = document.querySelector<HTMLElement>('[data-strip]');
if (strip) init(strip);

function init(strip: HTMLElement): void {
  const track = strip.querySelector<HTMLElement>('[data-strip-track]')!;
  const original = strip.querySelector<HTMLElement>('[data-strip-set]')!;
  const items = [...original.children].map((li) => li.cloneNode(true) as HTMLElement);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation: Animation | undefined;
  let hovered = false;
  let builtFor = ''; // strip width and item widths of the current loop

  function reset(): void {
    animation?.cancel();
    animation = undefined;
    strip.classList.remove('is-looping');
    original.replaceChildren(...items.map((li) => li.cloneNode(true)));
    for (const extra of [...track.children].slice(1)) extra.remove();
  }

  /** Strip width and item widths: the loop is rebuilt only when these change. */
  function signature(): string {
    const widths = [...original.children]
      .slice(0, items.length)
      .map((li) => li.getBoundingClientRect().width.toFixed(1));
    return `${strip.clientWidth}|${widths.join(',')}|${reduce.matches}`;
  }

  function build(): void {
    const sig = signature();
    if (sig === builtFor) return;
    reset();
    builtFor = signature();
    if (reduce.matches || !items.length) return;
    strip.classList.add('is-looping');
    const width = strip.clientWidth;
    // Fill the first set until it is wider than the strip; added items are decorative.
    let guard = 0;
    while (original.scrollWidth <= width && guard++ < 200) {
      for (const li of items) {
        const copy = li.cloneNode(true) as HTMLElement;
        copy.setAttribute('aria-hidden', 'true');
        original.append(copy);
      }
    }
    const second = original.cloneNode(true) as HTMLElement;
    second.setAttribute('aria-hidden', 'true');
    second.removeAttribute('data-strip-set');
    track.append(second);

    const setWidth = original.getBoundingClientRect().width;
    animation = track.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(${-setWidth}px)` }],
      {
        duration: (setWidth / SPEED) * 1000,
        iterations: Infinity,
        easing: 'linear',
      },
    );
    if (hovered) animation.pause();
  }

  strip.addEventListener('pointerover', () => {
    hovered = true;
    animation?.pause();
  });
  strip.addEventListener('pointerleave', () => {
    hovered = false;
    animation?.play();
  });

  let timer: number | undefined;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    window.clearTimeout(timer);
    timer = window.setTimeout(build, 200);
  });
  reduce.addEventListener('change', build);
  build();
  document.fonts.ready.then(build).catch(() => {});
}

export {};
