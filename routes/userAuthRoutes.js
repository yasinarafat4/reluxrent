const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { processImage } = require('../helpers/uploadFileToStorage');
const verifyUserToken = require('../middleware/authMiddleware.js');
const { nanoid } = require('nanoid');
const { sendEmail } = require('../email/emailService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'reluxrent';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ========================================
// Utility to create JWT
// ========================================
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }, // Valid for 7 days
  );
}

// ========================================
// EMAIL + PASSWORD LOGIN
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (!user.emailVerified) {
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordToken.create({
        data: { userId: user.id, token, type: 'EMAIL_VERIFY', expiresAt },
      });

      const link = `${process.env.BASE_URL}/login/verify-email?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        templateName: 'verifyEmail',
        data: {
          year: new Date().getFullYear(),
          name: user.name,
          email: user.email,
          link,
        },
      });

      return res.status(401).json({ error: 'Your email is not verified. Please check your inbox and follow the verification link.' });
    }

    if (user.isBanned) {
      return res.status(403).json({
        error: `Your account has been banned. Please contact support for assistance.`,
      });
    }

    if (!user.password) {
      const socialProviders = [];
      if (user.googleId) socialProviders.push('Google');
      if (user.facebookId) socialProviders.push('Facebook');
      if (user.appleId) socialProviders.push('Apple');

      return res.status(400).json({
        error: `You previously signed in using ${socialProviders.join(', ')}. Use that login or set a password first.`,
        providers: socialProviders,
        isSocialAccount: true,
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});


router.post('/verify-email', async (req, res) => {
   try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const record = await prisma.passwordToken.findUnique({ where: { token }, include: { user: true } });
    if (!record || record.type !== 'EMAIL_VERIFY') return res.status(400).json({ error: 'Invalid token' });
    if (record.used) return res.status(400).json({ error: 'Token already used' });
    if (new Date() > record.expiresAt) return res.status(400).json({ error: 'Token expired' });

    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } });

    await prisma.passwordToken.update({ where: { id: record.id }, data: { used: true } });

    return res.status(200).json({ message: 'Email verified successfully. You can now login with email/password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
}) 

// ========================================
// SET PASSWORD FOR SOCIAL-ONLY USERS
// ========================================

router.post('/request-set-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No user found with this email' });
    if (user.password) return res.status(400).json({ error: 'User already has a password' });

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordToken.create({
      data: { userId: user.id, token, type: 'SET_PASSWORD', expiresAt },
    });

    const link = `${process.env.BASE_URL}/login/set-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Set your password',
      templateName: 'requestSetPassword',
      data: {
        year: new Date().getFullYear(),
        name: user.name,
        email: user.email,
        link,
      },
    });
    res.status(200).json({ message: 'Password set link sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sent password set link' });
  }
});

router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });

    const record = await prisma.passwordToken.findUnique({ where: { token }, include: { user: true } });

    if (!record || record.type !== 'SET_PASSWORD') return res.status(400).json({ error: 'Invalid token' });

    if (record.used) return res.status(400).json({ error: 'Token already used' });

    if (new Date() > record.expiresAt) return res.status(400).json({ error: 'Token expired' });

    const hashedPassword = await bcryptjs.hash(password, 10);

    await prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } });

    await prisma.passwordToken.update({ where: { id: record.id }, data: { used: true } });

    return res.status(200).json({ message: 'Password set successfully. You can now login with email/password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// ========================================
// FORGOT PASSWORD
// ========================================

router.post('/request-forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No user found with this email' });
   
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordToken.create({
      data: { userId: user.id, token, type: 'FORGOT_PASSWORD', expiresAt },
    });

    const link = `${process.env.BASE_URL}/forgot-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Forgot your password',
      templateName: 'requestForgotPassword',
      data: {
        year: new Date().getFullYear(),
        name: user.name,
        email: user.email,
        link,
      },
    });
    res.status(200).json({ message: 'Password set link sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sent password set link' });
  }
});

router.post('/reset-forgot-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });

    const record = await prisma.passwordToken.findUnique({ where: { token }, include: { user: true } });
    if (!record || record.type !== 'FORGOT_PASSWORD') return res.status(400).json({ error: 'Invalid token' });
    if (record.used) return res.status(400).json({ error: 'Token already used' });
    if (new Date() > record.expiresAt) return res.status(400).json({ error: 'Token expired' });

    const hashedPassword = await bcryptjs.hash(password, 10);

    await prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } });

    await prisma.passwordToken.update({ where: { id: record.id }, data: { used: true } });

    return res.status(200).json({ message: 'Password reset successfully. You can now login with new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set password' });
  }
});


// ========================================
// REGISTER NEW USER
// ========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered!' });

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(user);
    res.json({ message: 'User registered successfully. Login now! ', user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ========================================
// LOGOUT
// ========================================
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully' });
});

// ========================================
// PROFILE ROUTE GET/UPDATE (protected)
// ========================================
router.get('/profile', verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, unreadCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user,
      unreadNotifications: unreadCount,
    });
  } catch (error) {
    console.log('❌ Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/profile', verifyUserToken, async (req, res) => {
  try {
    const { firstName, lastName, preferredName, email, phone, about, image, dob, address, dreamPlace, funFact, myWork, obsessedWith, school, languages } = req.body;
    const processedImage = await processImage(image);

    let existingUser = null;

    if (phone) {
      existingUser = await prisma.user.findUnique({ where: { phone } });
    }

    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(400).json({ error: 'exists' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && lastName ? { name: firstName + ' ' + lastName } : {}),
        ...(processedImage ? { image: processedImage } : {}),
        ...(dob ? { dob: new Date(dob) } : {}),
        ...(preferredName ? { preferredName } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        about,
        address,
        dreamPlace,
        funFact,
        myWork,
        obsessedWith,
        school,
        languages,
      },
    });

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/notifications/unread-count', verifyUserToken, async (req, res) => {
  const userId = req.user.id;
  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
  res.json(unreadCount);
});

// ========================================
// TOKEN REFRESH
// ========================================
router.get('/refresh-token', verifyUserToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user, message: 'Token refreshed' });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: 'Could not refresh token' });
  }
});

// ========================================
// TOKEN FETCH (for frontend JWT decoding)
// ========================================
router.get('/token', (req, res) => {
  const token = req.cookies?.token || null;
  res.json({ token });
});

module.exports = router;
