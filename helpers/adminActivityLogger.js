// activityLogger.js (CommonJS)
const prisma = require('../config/prisma');

async function createAdminActivityLog({ adminId, action, resource = null, resourceId = null, message = null, changes = null, meta = null }) {
  try {
    const log = await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId,
        message,
        changes,
        meta,
      },
    });
    return log;
  } catch (err) {
    // avoid crashing the main flow if logging fails
    console.error('Failed to create activity log', err);
    return null;
  }
}

module.exports = { createAdminActivityLog };
