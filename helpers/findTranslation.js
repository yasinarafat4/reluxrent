function findTranslation(items, lang) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const preferred = items.find((t) => t.locale === lang) || {};
  const fallback = items.find((t) => t.locale === 'en') || {};

  // treat null, undefined, and empty string as missing
  const hasValue = (v) => v !== null && v !== undefined && !(typeof v === 'string' && v.trim() === '');

  const merged = {};
  for (const key of Object.keys({ ...fallback, ...preferred })) {
    merged[key] = hasValue(preferred[key]) ? preferred[key] : (fallback[key] ?? null);
  }

  merged.locale = preferred.locale || 'en';
  return merged;
}

function groupTranslationsByLocale(translations) {
  const result = {};

  if (Array.isArray(translations)) {
    translations.forEach((t) => {
      const { locale, amenitiesId, id, ...rest } = t;
      result[locale] = rest;
    });
  }

  return result;
}

module.exports = { findTranslation, groupTranslationsByLocale };
