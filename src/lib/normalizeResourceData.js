const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const extractImageBase64 = async (input) => {
  if (!input) return null;
  if (typeof input === 'string') return input;
  if (input?.src?.startsWith('data:image')) return input.src;
  if (input?.rawFile instanceof File) return await toBase64(input.rawFile);
  return null;
};

const normalizeTranslations = async (data) => {
  const { translations, ...rest } = data;
  if (!translations) return data;

  const processed = {};
  for (const [locale, fields] of Object.entries(translations)) {
    processed[locale] = {
      ...fields,
      seoImage: await extractImageBase64(fields.seoImage),
    };
  }

  return {
    ...rest,
    translations: processed,
  };
};

const normalizeResourceData = async (data) => {
  const copy = { ...data };

  // Auto-extract main image
  if ('image' in copy) {
    copy.image = await extractImageBase64(copy.image);
  }
  if ('icon' in copy) {
    copy.icon = await extractImageBase64(copy.icon);
  }
  if ('beforeImage' in copy) {
    copy.beforeImage = await extractImageBase64(copy.beforeImage);
  }
  if ('afterImage' in copy) {
    copy.afterImage = await extractImageBase64(copy.afterImage);
  }

  // Handle translations if present
  if ('translations' in copy) {
    return await normalizeTranslations(copy);
  }

  return copy;
};

module.exports = {
  normalizeResourceData,
};
