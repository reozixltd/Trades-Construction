/** Service id → title map, embedded by the console page as JSON (keeps content the single source). */
let cache: Record<string, string> | null = null;

export function getCollectionTitles(): Record<string, string> {
  if (cache) return cache;
  try {
    cache = JSON.parse(document.querySelector('#service-titles')?.textContent ?? '{}') as Record<string, string>;
  } catch {
    cache = {};
  }
  return cache;
}
