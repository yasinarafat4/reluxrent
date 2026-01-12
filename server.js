const prisma = require('./config/prisma');
const compression = require('compression');
const cookie = require('cookie');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const next = require('next');
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { initSocket } = require('./socketManager');
const http = require('http'); // Import http module
const { logger } = require('./logger/logger');
dotenv.config();

const sitemap = require('express-sitemap-xml');
const getUrls = require('./config/sitemap');

const authGoogle = require('./routes/authGoogle');
const authApple = require('./routes/authApple');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const adminApiRoutes = require('./routes/adminApiRoutes');
const frontApiRoutes = require('./routes/frontApiRoutes');
const guestApiRoutes = require('./routes/guestApiRoutes');
const hostApiRoutes = require('./routes/hostApiRoutes');
const paymentApiRoutes = require('./routes/paymentApiRoutes');
const messageApiRoutes = require('./routes/messageApiRoutes');
const logRoutes = require('./routes/logRoutes');
const path = require('path');
require('./crons/expireRequests');
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const expressApp = express();

  // Set up your Express server (this is now wrapped inside a http.Server)
  const server = http.createServer(expressApp); // Create HTTP server instance

  // Middlewares
  expressApp.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  expressApp.use(compression());

  expressApp.set('trust proxy', 1);

  expressApp.use(
    cors({
      origin: [process.env.BASE_URL],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      exposedHeaders: ['Content-Range'],
      credentials: true,
    }),
  );

  expressApp.use(
    session({
      secret: process.env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax' },
      store: new PrismaSessionStore(prisma, {
        checkPeriod: 60 * 60 * 1000, // Prune expired sessions every hour
        dbRecordIdIsSessionId: true,
        tableName: 'Session',
        logErrors: true,
      }),
    }),
  );
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(express.static('public'));
  expressApp.use('/_next', express.static('.next'));

  const uploadDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  expressApp.use('/uploads', express.static(uploadDir, { maxAge: '7d', immutable: true }));

  // Middleware to parse cookies
  expressApp.use((req, res, next) => {
    if (req.headers.cookie) {
      req.cookies = cookie.parse(req.headers.cookie);
    }
    next();
  });

  // Log all requests
  expressApp.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  expressApp.use(sitemap(getUrls, process.env.BASE_URL));

  expressApp.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
User-agent: GPTBot
Allow: /
User-agent: CCBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /
Disallow: /.next/
Disallow: /_next/
Sitemap: ${process.env.BASE_URL}/sitemap.xml`);
  });

  // Custom APIs
  expressApp.use('/api/admin', adminAuthRoutes);
  expressApp.use('/api/user', userAuthRoutes);
  expressApp.use('/api', adminApiRoutes);
  expressApp.use('/api/front', frontApiRoutes);
  expressApp.use('/api/guest', guestApiRoutes);
  expressApp.use('/api/host', hostApiRoutes);
  expressApp.use('/api/payment', paymentApiRoutes);
  expressApp.use('/api/', messageApiRoutes);
  expressApp.use('/api/', authGoogle);
  expressApp.use('/api/', authApple);
  expressApp.use(logRoutes);

  expressApp.get('/api/default/language', async (req, res) => {
    const defaultLang = await prisma.language.findFirst({
      where: { defaultLanguage: true },
    });

    res.json(defaultLang);
  });

  expressApp.get('/api/translations/:locale', async (req, res) => {
    const { locale } = req.params;
    const translations = await prisma.translation.findMany({ where: { locale } });

    const formattedTranslations = {};
    translations.forEach((t) => {
      formattedTranslations[t.key] = t.value || t.key;
    });

    res.json(formattedTranslations);
  });

  // Set up Socket.IO for real-time communication
  const io = initSocket(server);

  expressApp.use((err, req, res, next) => {
    console.error('🔥 API Error:', err);

    if (req.originalUrl.startsWith('/api')) {
      // API request – send JSON error response
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // For non-API routes, redirect to Next.js /500 page
    res.redirect('/error');
  });

  // Next.js catch-all (must be last)
  expressApp.all('/_next/{*splat}', (req, res) => handle(req, res)); // optional
  expressApp.all('/{*splat}', (req, res) => handle(req, res));

  // Start the server using the HTTP instance
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${port}`);
  });
});
