// Step 1: English number words
const numberWords = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  oh: '0',
};

// Step 2: Bangla number words
const banglaNumberWords = {
  শূন্য: '0',
  এক: '1',
  দুই: '2',
  দুইবার: '2',
  তিন: '3',
  তিনবার: '3',
  চার: '4',
  পাঁচ: '5',
  ছয়: '6',
  সাত: '7',
  আট: '8',
  নয়: '9',
};

// Step 3: Bangla digits → English digits
const banglaDigitsMap = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const romanDigits = {
  I: '1',
  II: '2',
  III: '3',
  IV: '4',
  V: '5',
  VI: '6',
  VII: '7',
  VIII: '8',
  IX: '9',
  X: '10', // (rare, but include)
};

// Helper: convert number words (EN + BN) to digits
function wordsToDigits(text) {
  // English words
  text = text.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|oh)\b/gi, (m) => numberWords[m.toLowerCase()] || m);

  // Bangla words
  text = text.replace(/(শূন্য|এক|দুই|তিন|চার|পাঁচ|ছয়|সাত|আট|নয়)/g, (m) => banglaNumberWords[m] || m);

  // Bangla digits
  text = text.replace(/[০-৯]/g, (d) => banglaDigitsMap[d] || d);

  // Roman numerals (I–X)
  text = text.replace(/\b(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/gi, (m) => romanDigits[m.toUpperCase()] || m);

  return text;
}

// Regex
const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const bdPhoneRegex = /(\+?880|0)1[3-9][0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{3}/g;
const intlPhoneRegex = /(\+?\d[\s-]?){6,15}/g;

// Main sanitizer
function sanitizeMessage(text) {
  if (!text) return text;

  // Normalize: convert BN/EN words & digits → English digits
  let normalized = wordsToDigits(text);

  return normalized.replace(emailRegex, '[***]').replace(bdPhoneRegex, '[****]').replace(intlPhoneRegex, '[****]');
}

module.exports = { sanitizeMessage };
