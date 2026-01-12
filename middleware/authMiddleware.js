const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

async function verifyUserToken(req, res, next) {
  const authHeader = req.headers.authorization || req.cookies.token;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error('JWT verification failed', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = verifyUserToken;
