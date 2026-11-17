import type { Project } from './projects';

export type WorkImage = Project['media']['images'][number];

/** Aspect ratio above which an image counts as wide and takes a full row. */
export const WIDE_RATIO = 1.3;

export interface PlacedImage {
  image: WorkImage;
  /** Takes the full width of the media column (also in the two-column grid). */
  full: boolean;
}

/**
 * Image layout (spec 6.3.5): 1 to 4 images are stacked; 5 or more use a
 * two-column grid where a wide image spans the row and a narrow image left
 * alone in a row (before a wide one, or at the end) also takes the full width.
 */
export function placeImages(images: WorkImage[]): { grid: boolean; items: PlacedImage[] } {
  if (images.length < 5)
    return { grid: false, items: images.map((image) => ({ image, full: true })) };
  const isWide = (i: WorkImage) => i.w / i.h > WIDE_RATIO;
  const items: PlacedImage[] = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i]!;
    const next = images[i + 1];
    if (isWide(image)) {
      items.push({ image, full: true });
    } else if (next && !isWide(next)) {
      items.push({ image, full: false }, { image: next, full: false });
      i++;
    } else {
      items.push({ image, full: true });
    }
  }
  return { grid: true, items };
}

/** Paragraphs split on blank lines; single line breaks are kept by CSS (pre-line). */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n[ \t]*\n/)
    .map((p) => p.replace(/^\n+|\n+$/g, ''))
    .filter((p) => p.trim() !== '');
}
