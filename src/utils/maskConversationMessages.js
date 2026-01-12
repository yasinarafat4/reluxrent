import { normalizeMixedDigits } from '@/utils/normalizeMixedDigits';

const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

// Phone regex with word boundaries to avoid matching numbers inside prices or text
const bdPhoneRegex = /(?:^|\s)(\+?88)?0\d{9}(?=\s|$)/g;
const intlPhoneRegex = /(?:^|\s)(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?=\s|$)/g;

// Regex to detect "only digits" (7-12 digits) after normalization
// const onlyDigitsRegex = /^\d{7,12}$/;
const onlyDigitsRegex = /^[\d\sIVXLCDM]+$/i;

export const maskConversationMessages = (messagesByDate) => {
  if (!messagesByDate) return [];

  // Flatten all messages into a single array
  const messages = Object.values(messagesByDate).flat();

  return messages.map((msg) => {
    let text = msg.text ?? '';
    if (typeof text !== 'string') text = String(text);

    // 1️⃣ Normalize text to English digits (handle Bangla digits, words, Roman numerals)
    const normalizedText = normalizeMixedDigits(text).replace(/\s+/g, '');

    console.log('normalizedText', normalizedText);

    // 2️⃣ Block messages that are ONLY 7-12 digit sequences
    if (onlyDigitsRegex.test(normalizedText)) {
      return { ...msg, text: '[****]' };
    }

    // 3️⃣ Mask phone numbers and emails inside text
    let maskedText = text;
    maskedText = maskedText.replace(bdPhoneRegex, '[****]');
    maskedText = maskedText.replace(intlPhoneRegex, '[****]');
    maskedText = maskedText.replace(emailRegex, '[****]');

    return { ...msg, text: maskedText };
  });
};
