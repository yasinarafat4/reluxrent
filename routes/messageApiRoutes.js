// routes/messages.js

const express = require('express');
const admin = require('../config/firebase-admin');
const prisma = require('../config/prisma');
const { sendSocketNotification } = require('../socketManager');
const messageController = require('../controllers/messageController.js');
const verifyUserToken = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/conversations', verifyUserToken, messageController.getConversations);

router.get('/messages/:conversationId', verifyUserToken, messageController.getMessagesWithUser);

router.post('/send-notification', async (req, res) => {
  try {
    const { fcmToken, userId, title, body, click_action } = req.body;

    if (userId) {
      sendSocketNotification(`user-${userId}`, { title, body, click_action });
    }

    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        data: { title, body, click_action },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error sending FCM:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/save-fcm-token', verifyUserToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fcmToken,
      },
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Save Fcm Token Error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
