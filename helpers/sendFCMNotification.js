const admin = require('../config/firebase-admin');

async function sendFCMNotification(deviceToken, data) {
  const message = {
    token: deviceToken,
    notification: {
      title: data.title || 'Background Notification',
      body: data.body || 'You have a new message.',
    },
    data: {
      link: data.link || '/',
      id: data.id || Date.now().toString(),
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('FCM sent successfully:', response);
  } catch (err) {
    console.error('FCM send error:', err);
  }
}

module.exports = { sendFCMNotification };
