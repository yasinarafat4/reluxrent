const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const prisma = require('../config/prisma');

const router = express.Router();

const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI;
const APPLE_PRIVATE_KEY = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, 'utf8');
const JWT_SECRET = process.env.JWT_SECRET;

// Step 1: redirect user to Apple
router.get('/auth/apple', (req, res) => {
  const redirect = req.query.redirect || '/';
  if (req.session) req.session.redirect = redirect;
  const authUrl = `https://appleid.apple.com/auth/authorize?response_type=code&client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(APPLE_REDIRECT_URI)}&scope=name%20email`;
  res.redirect(authUrl);
});

// Step 2: callback
router.get('/auth/apple/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    // Build client secret (JWT signed by your key)
    const clientSecret = jwt.sign(
      {
        iss: APPLE_TEAM_ID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
        aud: 'https://appleid.apple.com',
        sub: APPLE_CLIENT_ID,
      },
      APPLE_PRIVATE_KEY,
      {
        algorithm: 'ES256',
        header: {
          alg: 'ES256',
          kid: APPLE_KEY_ID,
        },
      },
    );

    // Exchange code for token
    const tokenRes = await axios.post(
      'https://appleid.apple.com/auth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: APPLE_REDIRECT_URI,
        client_id: APPLE_CLIENT_ID,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const idToken = tokenRes.data.id_token;
    const decoded = jwt.decode(idToken);

    const email = decoded.email || `${decoded.sub}@apple.com`;
    const name = decoded.name || 'Apple User';

    // Find user first
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // 🚫 Check if banned before updating or logging in
      if (user.isBanned) {
        console.log(`Banned user tried to login: ${email}`);
        return res.redirect('/login?error=banned');
      }

      // Update existing user info
      user = await prisma.user.update({
        where: { email },
        data: { name, appleId: decoded.sub },
      });
    } else {
      // Create new user (only if not banned — optional rule)
      user = await prisma.user.create({
        data: {
          email,
          name,
          appleId: decoded.sub,
          password: null,
          emailVerified: new Date(),
        },
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });

    const redirectUrl = req.session?.redirect || '/';
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Apple login error:', err.response?.data || err.message);
    return res.status(500).send('Apple login failed');
  }
});

module.exports = router;
