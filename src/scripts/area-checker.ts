/** Wires the suburb checker UI to lib/areas. Result markup comes from hidden [data-tpl] blocks in AreaChecker.astro. */
import { checkArea, type AreaLists } from '@/lib/areas';
import { track } from '@/lib/analytics';
import { sitePath } from '@/lib/paths';

document.querySelectorAll<HTMLElement>('[data-area-checker]').forEach((root) => {
  const areas = JSON.parse(root.dataset.areas ?? '{"covered":[],"nearby":[]}') as AreaLists;
  const form = root.querySelector('form');
  const input = root.querySelector<HTMLInputElement>('input');
  const output = root.querySelector<HTMLElement>('[data-area-result]');
  if (!form || !input || !output) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = checkArea(input.value, areas);
    const tpl = root.querySelector<HTMLElement>(`[data-tpl="${result.status}"]`);
    if (!tpl) return;
    track('area_check');

    const node = document.createDocumentFragment();
    tpl.childNodes.forEach((child) => node.append(child.cloneNode(true)));
    const match = result.matches[0];
    const name = result.matches.map((m) => m.suburb).join(' / ') || input.value.trim();
    node.querySelectorAll('[data-slot="name"]').forEach((el) => (el.textContent = name));

    const link = node.querySelector<HTMLAnchorElement>('[data-slot="link"]');
    if (link && match?.page) {
      link.href = sitePath(`/areas/${match.page}/`);
      link.hidden = false;
    }
    node.querySelectorAll<HTMLAnchorElement>('[data-slot="quote"]').forEach((a) => {
      a.href = sitePath(`/quote/?suburb=${encodeURIComponent(match?.suburb ?? input.value.trim())}`);
    });

    output.dataset.status = result.status;
    output.replaceChildren(node);
  });
});
