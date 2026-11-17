/**
 * The white copy of the language switch is clipped to the part of the switch
 * that the footer covers, so the colour change happens at the footer edge
 * (spec 6.1.4). Updated on scroll and resize.
 */
const wrap = document.querySelector<HTMLElement>('[data-switch]');
const copy = document.querySelector<HTMLElement>('[data-switch-copy]');
const footer = document.getElementById('footer');

if (wrap && copy && footer) {
  let queued = false;
  const update = () => {
    queued = false;
    const s = wrap.getBoundingClientRect();
    const top = footer.getBoundingClientRect().top - s.top; // footer edge inside the switch
    const clipTop = Math.min(Math.max(top, 0), s.height);
    copy.style.clipPath = `inset(${clipTop}px 0 0 0)`;
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  // The switch moves while the logo shrinks or grows: follow it every frame
  // during the zoom transition.
  let running = false;
  const follow = () => {
    update();
    if (running) requestAnimationFrame(follow);
  };
  const root = document.documentElement;
  root.addEventListener('transitionrun', (e) => {
    if (e.target !== root || running) return;
    running = true;
    requestAnimationFrame(follow);
  });
  const stop = (e: TransitionEvent) => {
    if (e.target !== root) return;
    running = false;
    queue();
  };
  root.addEventListener('transitionend', stop);
  root.addEventListener('transitioncancel', stop);
  new ResizeObserver(queue).observe(document.body);
  update();
}

export {};
