/**
 * Scroll reveals (see styles/motion.css). One IntersectionObserver for the whole page;
 * each element is revealed once and then left alone. Without this script nothing is hidden:
 * the head script only adds .has-motion when it can also be undone (see BaseLayout).
 */
declare global {
  interface Window {
    __motion?: boolean;
  }
}

window.__motion = true;

if (document.documentElement.classList.contains('has-motion')) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/* Pointer tilt: a few degrees of perspective on [data-tilt], mouse only. */
if (matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 5).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - (e.clientY - r.top) / r.height) * 5).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    });
  });
}

export {};
