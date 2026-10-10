/**
 * Background video: nothing is downloaded until the frame is near the viewport, and never
 * for visitors who asked for reduced motion or data saving. The poster stays underneath,
 * so a slow or failed load just leaves the still. One visible button pauses and resumes.
 */
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
const still = saveData || matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-video]').forEach((root) => {
  const video = root.querySelector('video');
  const toggle = root.querySelector<HTMLButtonElement>('[data-video-toggle]');
  if (!video) return;
  if (still || !('IntersectionObserver' in window)) {
    video.remove();
    toggle?.remove();
    return;
  }

  let paused = false; // paused by the visitor, as opposed to by scrolling away
  const label = toggle?.querySelector('[data-video-label]');
  const sync = () => {
    toggle?.setAttribute('aria-pressed', String(paused));
    if (label) label.textContent = paused ? 'Play background video' : 'Pause background video';
  };

  video.addEventListener('playing', () => root.classList.add('is-playing'));
  video.addEventListener('error', () => {
    video.remove();
    toggle?.remove();
  });
  toggle?.addEventListener('click', () => {
    paused = !paused;
    if (paused) video.pause();
    else void video.play().catch(() => {});
    sync();
  });

  new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return video.pause();
      if (!video.src) {
        const small = video.dataset.srcSmall;
        video.src = (small && innerWidth < 768 ? small : video.dataset.src) ?? '';
        if (toggle) toggle.hidden = false;
      }
      if (!paused) void video.play().catch(() => {});
    },
    { rootMargin: '200px 0px' },
  ).observe(root);
});
