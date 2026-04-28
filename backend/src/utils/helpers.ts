/**
 * Shared helper utilities for the Hone Instrumental Store
 */

/**
 * Converts a string into a URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

/**
 * Safely parses a price value into a number.
 * Handles "🤙 Birr", "35,000", and other formatted strings.
 */
export const normalizePrice = (raw: string | number): number => {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const digits = raw.replace(/[^0-9.]/g, '');
    return digits ? parseFloat(digits) : 0;
  }
  return 0;
};

/**
 * Builds a unique slug from a model name + sku to avoid conflicts.
 */
export const makeProductSlug = (model: string, sku?: string): string => {
  const base = slugify(model);
  const suffix = sku 
    ? slugify(sku) 
    : Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
};
