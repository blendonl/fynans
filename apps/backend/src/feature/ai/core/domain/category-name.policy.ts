const MAX_CATEGORY_NAME_LENGTH = 40;
const MAX_CATEGORY_WORDS = 3;
const ALLOWED_CATEGORY_NAME = /^[\p{L}][\p{L} &'-]*$/u;

export function sanitizeSuggestedCategoryName(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }

  const collapsed = raw.replace(/\s+/g, ' ').trim();

  if (collapsed.length === 0 || collapsed.length > MAX_CATEGORY_NAME_LENGTH) {
    return null;
  }

  if (collapsed.split(' ').length > MAX_CATEGORY_WORDS) {
    return null;
  }

  if (!ALLOWED_CATEGORY_NAME.test(collapsed)) {
    return null;
  }

  return collapsed;
}
