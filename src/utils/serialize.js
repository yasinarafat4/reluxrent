// utils/serialize.js
export function serialize(obj) {
  if (obj === undefined) return null;
  if (obj === null) return null;

  if (obj && typeof obj === 'object' && typeof obj.toNumber === 'function') {
    return obj.toNumber(); // converts Decimal → number
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serialize);
  }

  if (typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, serialize(value)]));
  }

  return obj;
}
