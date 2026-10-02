/** Filters project cards by service. Every card is visible without JS. */
document.querySelectorAll<HTMLElement>('[data-project-grid]').forEach((root) => {
  const buttons = root.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const cards = root.querySelectorAll<HTMLElement>('[data-service]');
  const status = root.querySelector<HTMLElement>('[data-filter-status]');

  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter ?? 'all';
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let shown = 0;
      cards.forEach((card) => {
        const match = filter === 'all' || card.dataset.service === filter;
        card.hidden = !match;
        if (match) shown++;
      });
      if (status) status.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}`;
    }),
  );
});
