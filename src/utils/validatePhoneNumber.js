// utils/validatePhoneNumber.js
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export const isValidPhoneNumber = (number, region = 'BD') => {
  try {
    const parsed = phoneUtil.parseAndKeepRawInput(number, region);
    return phoneUtil.isValidNumber(parsed);
  } catch (e) {
    return false;
  }
};
