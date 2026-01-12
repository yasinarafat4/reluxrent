// lib/sendOtpSms.js
import axios from 'axios';

export async function sendOtpSms(phone, otp) {
  const smsData = {
    api_token: process.env.SSL_SMS_API_TOKEN,
    sid: process.env.SSL_SMS_SID,
    msisdn: phone,
    sms: `আপনার OTP: ${otp}`,
    csms_id: `${Date.now()}`, // unique ID
  };

  try {
    const res = await axios.post('https://smsplus.sslwireless.com/api/v3/send-sms', smsData, { headers: { 'Content-Type': 'application/json' } });

    if (res.data && res.data.status === 'SUCCESS') {
      console.log('✅ OTP SMS sent successfully:', res.data);
      return true;
    } else {
      console.error('❌ SMS send failed:', res.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending OTP SMS:', error.message);
    return false;
  }
}
