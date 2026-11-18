import PhotoSwipeLightbox from 'photoswipe/lightbox';

/**
 * Work page images in PhotoSwipe (spec 6.4, replaced by PhotoSwipe). Each
 * gallery's links point at the full-size file, so without JavaScript they
 * still open the image. PhotoSwipe is loaded only when a page has a gallery.
 * Added: an "open in new tab" button for the current image (spec 6.4).
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

  lightbox.on('uiRegister', () => {
    lightbox.pswp?.ui?.registerElement({
      name: 'open-tab',
      order: 9,
      isButton: true,
      tagName: 'a',
      ariaLabel: d.openTabTitle,
      title: d.openTabTitle,
      html: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M10 5H5v14h14v-5M13 4h7v7M20 4l-9 9" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
      onInit: (el, pswp) => {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
        const update = () => {
          el.setAttribute('href', String(pswp.currSlide?.data.src ?? '#'));
        };
        pswp.on('change', update);
        update();
      },
    });
  });

  lightbox.init();
}
