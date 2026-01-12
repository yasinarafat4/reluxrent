const admin = require('../config/firebase-admin');
const prisma = require('../config/prisma');
const { getSocket } = require('../socketManager');

/**
 * Send notification through FCM + Socket + Store in DB (Prisma)
 *
 * @param {Object} options
 * @param {string} options.userId - Target user ID
 * @param {string} [options.fcmToken] - User’s Firebase token (optional)
 * @param {Object} options.notificationData - { title, body, icon?, link? }
 * @param {string} [options.type] - Notification type (default: "general")
 */
async function sendUserNotification({ userId, fcmToken, notificationData, type = 'general' }) {
  const { title, body, icon, link } = notificationData;

  // 1️⃣ Save in database
  let savedNotification = null;
  try {
    savedNotification = await prisma.notification.create({
      data: {
        userId,
        title: title || 'Notification',
        body: body || '',
        icon: icon || '/images/notification-icon.png',
        link: link || '/',
        type,
      },
    });
    console.log(`💾 Notification stored for user ${userId}`);
  } catch (err) {
    console.error(`❌ Failed to store notification for user ${userId}:`, err.message);
  }

  // 2️⃣ Send FCM notification
  if (fcmToken) {
    try {
      await admin.messaging().send({
        token: fcmToken,
        data: {
          title: title || 'Notification',
          body: body || '',
          icon: icon || '/images/notification-icon.png',
          link: link || '/',
        },
      });
      console.log(`✅ FCM notification sent to user ${userId}`);
    } catch (err) {
      console.error(`❌ Failed to send FCM to user ${userId}:`, err.message);
    }
  }

  // 3️⃣ Emit via Socket.IO
  try {
    const socket = getSocket();
    if (socket) {
      socket.to(`user-${userId}`).emit('notification', {
        id: savedNotification?.id,
        ...notificationData,
      });
      console.log(`📡 Socket notification sent to user-${userId}`);
    } else {
      console.warn('⚠️ Socket not initialized.');
    }
  } catch (err) {
    console.error(`❌ Failed to send socket notification:`, err.message);
  }

  return savedNotification;
}

module.exports = { sendUserNotification };
