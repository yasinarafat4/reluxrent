// middlewares/logActivity.js
const prisma = require('../config/prisma');

async function logActivity(req, userId, action, meta = {}) {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        meta,
      },
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
}

module.exports = logActivity;
