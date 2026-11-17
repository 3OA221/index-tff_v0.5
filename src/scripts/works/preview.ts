/**
 * Animated preview on hover or focus: swaps the tile image to the preview and
 * back. Only on devices with hover and without reduced motion.
 */
export function initPreviews(grid: HTMLElement): void {
  const allowed = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');

  for (const img of grid.querySelectorAll<HTMLImageElement>('img[data-preview]')) {
    const link = img.closest('a');
    const still = img.getAttribute('src') ?? '';
    const preview = img.dataset.preview ?? '';
    if (!link || !preview) continue;

    const show = () => {
      if (allowed.matches) img.src = preview;
    };
    const hide = () => {
      if (img.getAttribute('src') !== still) img.src = still;
    };
    link.addEventListener('pointerenter', show);
    link.addEventListener('focus', show);
    link.addEventListener('pointerleave', () => {
      if (document.activeElement !== link) hide();
    });
    link.addEventListener('blur', hide);
  }
}
