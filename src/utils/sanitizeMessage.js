// Regex for email
const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

// Regex for phone numbers (basic, can be adjusted for your case)
const phoneRegex = /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;

function sanitizeMessage(text) {
  if (!text) return text;

  return text.replace(emailRegex, '[email hidden]').replace(phoneRegex, '[phone hidden]');
}
