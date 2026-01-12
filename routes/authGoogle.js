// routes/authGoogle.js
const express = require('express');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g. http://localhost:4000/auth/google/callback
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Step 1: redirect user to Google consent screen
router.get('/auth/google', (req, res) => {
  // store state in session (or in an encrypted cookie) to validate later
  const state = crypto.randomBytes(16).toString('hex');
  if (req.session) req.session.oauthState = state;

  // store redirect in session
  const redirect = req.query.redirect || '/';
  if (req.session) req.session.redirect = redirect;

  const url = client.generateAuthUrl({
    access_type: 'offline', // request refresh token
    scope: ['openid', 'email', 'profile'],
    prompt: 'consent', // prompts user to select account
    state,
  });
  return res.redirect(url);
});

// Step 2: Google redirects back to here with ?code=...
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // validate state
    if (!req.session || state !== req.session.oauthState) {
      return res.status(403).send('Invalid state');
    }
    // exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // verify id_token and extract profile
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload(); // contains email, name, picture, sub

    const email = payload.email;
    const name = payload.name || '';
    const picture = payload.picture || null;

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
        data: { name, image: picture, googleId: payload.sub },
      });
    } else {
      // Create new user (only if not banned — optional rule)
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: picture,
          googleId: payload.sub,
          password: null,
          emailVerified: new Date(),
        },
      });
    }

    // create your app JWT
    const appToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // set cookie (for web) and redirect to frontend
    res.cookie('token', appToken, COOKIE_OPTIONS);

    // redirect user to frontend page (dashboard or where you want)
    const redirectUrl = req.session.redirect || '/';

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google callback error', err);
    return res.status(500).send('Authentication failed');
  }
});

module.exports = router;
