const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
const prisma = require('../../config/prisma');
const bcryptjs = require('bcryptjs');

// List all users
exports.getStafs = async (req, res) => {
  try {
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    const [data, total] = await Promise.all([
      prisma.admin.findMany({
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: { role: true },
      }),
      prisma.admin.count(),
    ]);
    res.setHeader('Content-Range', `users ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get single user
exports.getStaf = async (req, res) => {
  const id = req.params.id;
  try {
    const admin = await prisma.admin.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!admin) return res.status(404).json({ error: 'User not found' });
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create user
exports.createStaf = async (req, res) => {
  const { name, email, phone, password, roleId } = req.body;
  try {
    const errors = {};
    if (!name) {
      errors.title = 'The Name is required';
    }
    const existingEmail = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingEmail) {
      errors.email = 'An account with this email already exists. Please use a different email.';
    }
    const existingPhone = await prisma.admin.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      errors.phone = 'An account with this phone already exists. Please use a different phone.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        errors: errors,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const staf = await prisma.admin.create({
      data: {
        name,
        email,
        phone,
        phone,
        password: hashedPassword,
        roleId: parseInt(roleId),
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'create',
      resource: 'Stafs',
      resourceId: String(staf.id),
      message: `Created Staf ${staf.id}`,
      changes: { after: staf },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.status(201).json(staf);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateStaf = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, status, roleId, newPassword, confirmPassword } = req.body;
  try {
    const errors = {};
    const admin = await prisma.admin.findUnique({
      where: { id: id },
    });

    if (!admin) {
      return res.status(404).json({
        errors: {
          root: { serverError: 'User not found' },
        },
      });
    }
    if (email !== admin.email) {
      const existingEmail = await prisma.admin.findUnique({
        where: { email: email },
      });

      if (existingEmail) {
        errors.email = 'An account with this email already exists. Please use a different email.';
      }
    }
    if (phone !== admin.phone) {
      const existingPhone = await prisma.admin.findUnique({
        where: { phone: phone },
      });

      if (existingPhone) {
        errors.email = 'An account with this phone already exists. Please use a different phone.';
      }
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        errors: errors,
      });
    }

    const updateData = {
      name,
      email,
      phone,
      status,
      roleId: parseInt(roleId),
    };

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }

      updateData.password = await bcryptjs.hash(newPassword, 10);
    }

    const existing = await prisma.admin.findUnique({
      where: { id },
    });
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updatedStaf = await prisma.admin.update({
      where: { id },
      data: updateData,
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Stafs',
      resourceId: String(id),
      message: `Updated Staf ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedStaf);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update user' });
  }
};

// Delete user
exports.deleteStaf = async (req, res) => {
  const id = req.params.id;
  try {
   const deletedStaf = await prisma.admin.delete({ where: { id } });

      // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Stafs',
      resourceId: String(id),
      message: `Deleted Staf ${id}`,
      changes: { before: deletedStaf },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
};
