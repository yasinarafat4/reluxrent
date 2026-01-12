const { sendEmail } = require("../email/emailService");

async function sendEmailWithRetry(emailData, retries = 3, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sendEmail(emailData); // Your actual email service
      console.log(`✅ Email sent successfully to ${emailData.to}`);
      return true; // Success
    } catch (error) {
      console.warn(`⚠️ Email attempt ${attempt} failed:`, error.message || error);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.log(`❌ Email failed after ${retries} attempts to ${emailData.to}`);
  return false; // Failure but does not throw
}

module.exports = { sendEmailWithRetry };
