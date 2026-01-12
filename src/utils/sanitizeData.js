import sanitizeHtml from 'sanitize-html';

export default function sanitizeData(data) {
  if (typeof data !== 'string') return null;

  const cleaned = sanitizeHtml(data, {
    allowedAttributes: false,
    allowedTags: false,
    exclusiveFilter: (frame) => !frame.text.trim(),
    parseStyleAttributes: true,
  })
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || null;
}
