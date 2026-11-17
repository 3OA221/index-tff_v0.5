/**
 * Cube logo (spec 6.1.3).
 *
 * Fitting: each word is drawn as SVG text, one <text> per letter at the
 * letter's real advance (prefix widths from canvas measureText, so kerning is
 * included and swapping a letter never moves the others). The word is
 * stretched so its ink box (actualBoundingBox metrics) fills the face, less a
 * margin of 4.5% of the width and 6% of the height. Refit on resize and after
 * the fonts load.
 *
 * Effects (one per word), off for reduced motion, paused while the pointer is
 * over the logo and while the tab is hidden; between effects the words are plain.
 *   text   decode: random lowercase letters, decoding left to right from 0.3 s,
 *          0.14 s per letter, updated every 55 ms
 *   forma  pixelate: pixel sizes 3 5 8 12 17 12 8 5 3, 80 ms each, on a canvas
 *   funkce focus pull: each letter blurs up to 3.4 px and sharpens over 1 s,
 *          80 ms lag per letter
 * First runs at 1.2 s, 3.5 s, 5.8 s; then random intervals
 * (text 6.5–10.5 s, forma 5.5–9 s, funkce 4.5–8 s).
 */
type Key = 'text' | 'forma' | 'funkce';

const FONT: Record<Key, { family: string; style: string; weight: string }> = {
  text: { family: 'Newsreader', style: 'italic', weight: '700' },
  forma: { family: 'Space Grotesk', style: 'normal', weight: '700' },
  funkce: { family: 'IBM Plex Mono', style: 'normal', weight: '700' },
};
const SIZE = 100; // font size used for measuring and drawing (user units)
const MARGIN_X = 0.045;
const MARGIN_Y = 0.06;
const SVG_NS = 'http://www.w3.org/2000/svg';

const FIRST: Record<Key, number> = { text: 1.2, forma: 3.5, funkce: 5.8 };
const INTERVAL: Record<Key, [number, number]> = {
  text: [6.5, 10.5],
  forma: [5.5, 9],
  funkce: [4.5, 8],
};
const PIXELS = [3, 5, 8, 12, 17, 12, 8, 5, 3];
const PIXEL_STEP = 0.08;
const DECODE_DELAY = 0.3;
const DECODE_PER_LETTER = 0.14;
const DECODE_TICK = 0.055;
const BLUR_MAX = 3.4;
const BLUR_DURATION = 1;
const BLUR_LAG = 0.08;

const fontString = (k: Key) => `${FONT[k].style} ${FONT[k].weight} ${SIZE}px "${FONT[k].family}"`;

interface Face {
  key: Key;
  el: HTMLElement;
  word: string;
  letters: SVGTextElement[];
  blurs: SVGFEGaussianBlurElement[];
  svg?: SVGSVGElement;
  canvas?: HTMLCanvasElement;
  edge: number;
  // Transform from font units to face pixels.
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  xs: number[];
}

const logo = document.querySelector<HTMLElement>('[data-logo]');
if (logo) init(logo);

function init(logo: HTMLElement): void {
  const faces: Face[] = [...logo.querySelectorAll<HTMLElement>('[data-face]')].map((el) => ({
    key: el.dataset.face as Key,
    el,
    word: el.dataset.face ?? '',
    letters: [],
    blurs: [],
    edge: 0,
    sx: 1,
    sy: 1,
    tx: 0,
    ty: 0,
    xs: [],
  }));
  const measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) return;
  const ctx: CanvasRenderingContext2D = measureCtx;

  /* ---------- Fitting ---------- */

  function fit(face: Face): void {
    const edge = face.el.clientWidth;
    if (!edge) return;
    ctx.font = fontString(face.key);
    const m = ctx.measureText(face.word);
    const x0 = -m.actualBoundingBoxLeft;
    const x1 = m.actualBoundingBoxRight;
    const y0 = -m.actualBoundingBoxAscent;
    const y1 = m.actualBoundingBoxDescent;
    face.edge = edge;
    face.xs = [...face.word].map((_, i) => ctx.measureText(face.word.slice(0, i)).width);
    face.sx = (edge * (1 - 2 * MARGIN_X)) / (x1 - x0);
    face.sy = (edge * (1 - 2 * MARGIN_Y)) / (y1 - y0);
    face.tx = edge * MARGIN_X - x0 * face.sx;
    face.ty = edge * MARGIN_Y - y0 * face.sy;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'face__svg');
    svg.setAttribute('viewBox', `0 0 ${edge} ${edge}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const defs = document.createElementNS(SVG_NS, 'defs');
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('transform', `matrix(${face.sx} 0 0 ${face.sy} ${face.tx} ${face.ty})`);
    g.setAttribute('fill', 'currentColor');
    g.setAttribute('font-family', FONT[face.key].family);
    g.setAttribute('font-style', FONT[face.key].style);
    g.setAttribute('font-weight', FONT[face.key].weight);
    g.setAttribute('font-size', String(SIZE));
    face.letters = [];
    face.blurs = [];
    [...face.word].forEach((ch, i) => {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', String(face.xs[i]));
      t.setAttribute('y', '0');
      t.textContent = ch;
      if (face.key === 'funkce') {
        const id = `logo-blur-${i}`;
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.setAttribute('id', id);
        filter.setAttribute('x', '-100%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '300%');
        filter.setAttribute('height', '200%');
        const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
        blur.setAttribute('stdDeviation', '0');
        filter.append(blur);
        defs.append(filter);
        face.blurs.push(blur);
        t.setAttribute('filter', `url(#${id})`);
      }
      g.append(t);
      face.letters.push(t);
    });
    svg.append(defs, g);
    face.svg?.remove();
    face.svg = svg;
    face.el.append(svg);

    if (face.key === 'forma') {
      face.canvas?.remove();
      const canvas = document.createElement('canvas');
      canvas.className = 'face__canvas';
      canvas.width = Math.ceil(edge);
      canvas.height = Math.ceil(edge);
      canvas.hidden = true;
      canvas.setAttribute('aria-hidden', 'true');
      face.canvas = canvas;
      face.el.append(canvas);
    }
    face.el.classList.add('is-fitted');
  }

  function fitAll(): void {
    stopEffects();
    faces.forEach(fit);
  }

  /* ---------- Effects ---------- */

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let hovered = false;
  let clock = 0; // seconds of effect time; advances only while effects may run
  let last = 0;
  let frame = 0;
  const next: Record<Key, number> = { ...FIRST };
  const running: Partial<Record<Key, number>> = {}; // start time of a running effect
  let lastDecodeStep = -1;
  let lastPixelStep = -1;

  const random = ([a, b]: [number, number]) => a + Math.random() * (b - a);
  const face = (k: Key) => faces.find((f) => f.key === k);
  const active = () => !reduce.matches && !hovered && !document.hidden;

  function plain(k: Key): void {
    const f = face(k);
    if (!f) return;
    f.letters.forEach((t, i) => (t.textContent = f.word[i] ?? ''));
    f.blurs.forEach((b) => b.setAttribute('stdDeviation', '0'));
    if (f.canvas) f.canvas.hidden = true;
    if (f.svg) f.svg.style.visibility = '';
    delete running[k];
  }

  function stopEffects(): void {
    (Object.keys(running) as Key[]).forEach(plain);
    lastDecodeStep = -1;
    lastPixelStep = -1;
  }

  function decode(f: Face, t: number): boolean {
    const end = DECODE_DELAY + DECODE_PER_LETTER * f.word.length;
    if (t >= end) return false;
    const step = Math.floor(t / DECODE_TICK);
    if (step !== lastDecodeStep) {
      lastDecodeStep = step;
      f.letters.forEach((el, i) => {
        const settled = t >= DECODE_DELAY + DECODE_PER_LETTER * (i + 1);
        el.textContent = settled
          ? (f.word[i] ?? '')
          : String.fromCharCode(97 + Math.floor(Math.random() * 26));
      });
    }
    return true;
  }

  function drawPixels(f: Face, size: number): void {
    const canvas = f.canvas;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const full = document.createElement('canvas');
    full.width = w;
    full.height = h;
    const fc = full.getContext('2d');
    const small = document.createElement('canvas');
    small.width = Math.max(1, Math.ceil(w / size));
    small.height = Math.max(1, Math.ceil(h / size));
    const sc = small.getContext('2d');
    const out = canvas.getContext('2d');
    if (!fc || !sc || !out) return;
    fc.fillStyle = getComputedStyle(f.el).color;
    fc.font = fontString(f.key);
    fc.setTransform(
      f.sx * (w / f.edge),
      0,
      0,
      f.sy * (h / f.edge),
      f.tx * (w / f.edge),
      f.ty * (h / f.edge),
    );
    [...f.word].forEach((ch, i) => fc.fillText(ch, f.xs[i] ?? 0, 0));
    sc.imageSmoothingEnabled = true;
    sc.drawImage(full, 0, 0, small.width, small.height);
    out.clearRect(0, 0, w, h);
    out.imageSmoothingEnabled = false;
    out.drawImage(small, 0, 0, small.width * size, small.height * size);
  }

  function pixelate(f: Face, t: number): boolean {
    const step = Math.floor(t / PIXEL_STEP);
    if (step >= PIXELS.length || !f.canvas) return false;
    if (step !== lastPixelStep) {
      lastPixelStep = step;
      drawPixels(f, PIXELS[step] ?? 3);
      f.canvas.hidden = false;
      if (f.svg) f.svg.style.visibility = 'hidden';
    }
    return true;
  }

  function focusPull(f: Face, t: number): boolean {
    const end = BLUR_DURATION + BLUR_LAG * (f.word.length - 1);
    if (t >= end) return false;
    f.blurs.forEach((b, i) => {
      const local = (t - BLUR_LAG * i) / BLUR_DURATION;
      const px = local > 0 && local < 1 ? BLUR_MAX * Math.sin(Math.PI * local) : 0;
      b.setAttribute('stdDeviation', `${(px / f.sx).toFixed(3)} ${(px / f.sy).toFixed(3)}`);
    });
    return true;
  }

  const RUN: Record<Key, (f: Face, t: number) => boolean> = {
    text: decode,
    forma: pixelate,
    funkce: focusPull,
  };

  function tick(now: number): void {
    frame = 0;
    if (!active()) return;
    clock += Math.min((now - last) / 1000, 0.1);
    last = now;
    for (const k of Object.keys(RUN) as Key[]) {
      const f = face(k);
      if (!f || !f.letters.length) continue;
      if (running[k] === undefined && clock >= next[k]) {
        running[k] = next[k];
        next[k] = next[k] + random(INTERVAL[k]);
        if (k === 'text') lastDecodeStep = -1;
        if (k === 'forma') lastPixelStep = -1;
      }
      const start = running[k];
      if (start !== undefined && !RUN[k](f, clock - start)) plain(k);
    }
    frame = requestAnimationFrame(tick);
  }

  function resume(): void {
    if (frame || !active()) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function pause(): void {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    stopEffects();
  }
  const update = () => (active() ? resume() : pause());

  logo.addEventListener('pointerover', () => {
    hovered = true;
    update();
  });
  logo.addEventListener('pointerleave', () => {
    hovered = false;
    update();
  });
  document.addEventListener('visibilitychange', update);
  reduce.addEventListener('change', update);

  /* ---------- Start ---------- */

  let edgeSeen = 0;
  const ro = new ResizeObserver(() => {
    const e = faces[0]?.el.clientWidth ?? 0;
    if (e && Math.abs(e - edgeSeen) > 0.5) {
      edgeSeen = e;
      fitAll();
    }
  });

  const loads = faces.map((f) => document.fonts.load(fontString(f.key), f.word).catch(() => []));
  Promise.all(loads).then(() => {
    edgeSeen = faces[0]?.el.clientWidth ?? 0;
    fitAll();
    ro.observe(faces[0]!.el);
    document.fonts.addEventListener('loadingdone', fitAll);
    update();
  });
}

export {};
