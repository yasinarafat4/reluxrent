// middlewares/logActivity.js
const prisma = require('../config/prisma');

async function StafLogActivity(req, adminId, action, meta = {}) {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';

    await prisma.activityLog.create({
      data: {
        adminId,
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

module.exports = StafLogActivity;
