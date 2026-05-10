const CATEGORY_SLUG_OVERRIDES: Record<string, string> = {
  'co pilot': 'copilot',
};

export function slugify(input: string): string {
  const lower = input.toLowerCase().trim();
  if (lower in CATEGORY_SLUG_OVERRIDES) return CATEGORY_SLUG_OVERRIDES[lower];
  return lower
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}
