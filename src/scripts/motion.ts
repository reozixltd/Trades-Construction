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

export {};
