/** Before/after comparison: a native range input drives the --pos custom property (works with mouse, touch and keyboard). */
document.querySelectorAll<HTMLElement>('[data-compare]').forEach((root) => {
  const range = root.querySelector<HTMLInputElement>('[data-compare-range]');
  if (!range) return;
  const update = () => root.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', update);
  update();
});
