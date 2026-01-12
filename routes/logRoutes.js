// routes/logRoutes.js
const express = require('express');
const router = express.Router();
const { logger } = require('../logger/logger');

router.post('/api/log', async (req, res) => {
  try {
    const { level = 'info', message = '', meta = {} } = req.body;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    logger.log(level, `[CLIENT] ${message}`, { ...meta, ip, userAgent });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in /api/log route', error);
    res.status(500).json({ success: false, error: 'Failed to log message' });
  }
});

module.exports = router;
