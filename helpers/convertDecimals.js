const { Prisma } = require('@prisma/client');

function convertDecimals(obj) {
  if (obj instanceof Prisma.Decimal) {
    return parseFloat(obj);
  }

  // ✅ Prevent Date from being treated as an object
  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDecimals);
  }

  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, convertDecimals(value)]));
  }

  return obj;
}

module.exports = { convertDecimals };
