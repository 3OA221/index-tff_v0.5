import PhotoSwipeLightbox from 'photoswipe/lightbox';

/**
 * Work page images in PhotoSwipe, with PhotoSwipe's default buttons and layout.
 * Each gallery's links point at the full-size file, so without JavaScript they
 * still open the image. PhotoSwipe is loaded only when a page has a gallery.
 */
const galleries = document.querySelectorAll<HTMLElement>('[data-gallery]');

for (const gallery of galleries) {
  const d = gallery.dataset;
  const lightbox = new PhotoSwipeLightbox({
    gallery,
    children: 'a.media__open',
    pswpModule: () => import('photoswipe'),
    loop: true,
    wheelToZoom: true,
    bgOpacity: 0.92,
    indexIndicatorSep: ' / ',
    closeTitle: d.closeTitle,
    zoomTitle: d.zoomTitle,
    arrowPrevTitle: d.prevTitle,
    arrowNextTitle: d.nextTitle,
  });

  lightbox.on('afterInit', () => {
    lightbox.pswp?.element?.setAttribute('aria-label', d.galleryLabel ?? '');
  });

  lightbox.init();
}
