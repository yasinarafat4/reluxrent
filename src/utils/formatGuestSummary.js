export function formatGuestSummary(guests = {}) {
  const parts = [];

  if (guests?.adults) {
    parts.push(`${guests?.adults} Adult${guests?.adults > 1 ? 's' : ''}`);
  }
  if (guests?.children) {
    parts.push(`${guests?.children} Child${guests?.children > 1 ? 'ren' : ''}`);
  }
  if (guests?.infants) {
    parts.push(`${guests?.infants} Infant${guests?.infants > 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}
