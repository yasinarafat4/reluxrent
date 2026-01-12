const express = require('express');
const bcryptjs = require('bcryptjs');
const cookieParser = require('cookie-parser');
const router = express.Router();
router.use(cookieParser());
const prisma = require('../config/prisma');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        role: { include: { permissions: true } },
      },
    });

    if (!admin || !(await bcryptjs.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const permissions = admin.role.permissions.map((p) => ({
      resource: p.resource,
      action: p.action,
    }));

    // Store admin session
    req.session.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions,
    };
    await req.session.save();

    res.json({ message: 'Admin logged in successfully', admin: req.session.admin });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Something went wrong during admin login' });
  }
});

router.get('/check-auth', async (req, res) => {
  try {
    if (req.session && req.session.admin) {
      const admin = await prisma.admin.findUnique({
        where: { id: req.session.admin.id },
        include: { role: { include: { permissions: true } } },
      });
      const permissions = admin.role.permissions.map((p) => ({
        resource: p.resource,
        action: p.action,
      }));
      req.session.admin.permissions = permissions;
      req.session.save();

      return res.json({ authenticated: true, admin: req.session.admin });
    } else {
      return res.status(401).json({ authenticated: false, admin: null });
    }
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ error: 'Something went wrong while checking auth' });
  }
});

// ✅ GET /api/admin/permissions
// Optional query: ?resource=users&action=create
router.get('/permissions', async (req, res) => {
  try {
    const adminSession = req.session?.admin;
    if (!adminSession?.id) {
      return res.status(401).json({ error: 'Not authenticated as admin' });
    }

    // Refresh from DB if missing
    const admin = await prisma.admin.findUnique({
      where: { id: adminSession.id },
      include: { role: { include: { permissions: true } } },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const permissions = admin.role.permissions.map((p) => ({
      resource: p.resource,
      action: p.action,
    }));

    // ✅ update session in same structure as login
    req.session.admin.permissions = permissions;
    await req.session.save();

    const { resource, action } = req.query;
    if (resource && action) {
      const hasPermission = permissions.some((p) => p.resource.toLowerCase() === resource.toLowerCase() && p.action.toLowerCase() === action.toLowerCase());

      return res.json({
        allowed: hasPermission,
        resource,
        action,
        message: hasPermission ? `Access granted for ${resource}:${action}` : `Access denied for ${resource}:${action}`,
      });
    }

    res.json({ permissions });
  } catch (error) {
    console.error('Error fetching admin permissions:', error);
    res.status(500).json({ error: 'Something went wrong while fetching permissions' });
  }
});

router.post('/logout', async (req, res) => {
  delete req.session.admin;
  res.clearCookie('connect.sid');
  await req.session.save();
  res.json({ message: 'Admin logged out successfully' });
});

module.exports = router;
