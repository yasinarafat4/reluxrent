export const normalizeMixedDigits = (text) => {
  if (!text) return '';

  // ensure string
  text = String(text);

  let normalized = text;

  // 1️⃣ Bangla digits → English digits
  const banglaDigits = '০১২৩৪৫৬৭৮৯';
  const engDigits = '0123456789';
  normalized = normalized.replace(/[০-৯]/g, (d) => engDigits[banglaDigits.indexOf(d)]);

  // 2️⃣ Number words (Bangla + English)
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
    শূন্য: '0',
    এক: '1',
    দুই: '2',
    তিন: '3',
    চার: '4',
    পাঁচ: '5',
    ছয়: '6',
    সাত: '7',
    আট: '8',
    নয়: '9',
  };
  const keys = Object.keys(numberWords).sort((a, b) => b.length - a.length);
  const regex = new RegExp(keys.join('|'), 'g');

  normalized = normalized.replace(regex, (match) => numberWords[match]);

  // Object.keys(numberWords).forEach((word) => {
  //   // const regex = new RegExp(`\\b${word}\\b`, 'gi');
  //   // const regex = new RegExp(`(^|\\s)${word}(?=$|\\s)`, 'g');
  //   const regex = new RegExp(`(?<!\\p{L})${word}(?!\\p{L})`, 'gu');
  //   normalized = normalized.replace(regex, numberWords[word]);
  // });

  // 3️⃣ Roman numerals → digits
  const romanMap = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
  };
  Object.keys(romanMap).forEach((roman) => {
    const regex = new RegExp(`\\b${roman}\\b`, 'gi');
    normalized = normalized.replace(regex, romanMap[roman]);
  });

  return normalized;
};
