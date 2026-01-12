const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
const prisma = require('../../config/prisma');
const StafLogActivity = require('../../middleware/stafLogActivity');

exports.getRoles = async (req, res) => {
  try {
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    const [data, total] = await Promise.all([
      prisma.role.findMany({
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: { permissions: true },
      }),
      prisma.role.count(),
    ]);

    res.setHeader('Content-Range', `roles ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error('getRoles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

exports.getRole = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!role) return res.status(404).json({ error: 'Role not found' });

    res.json(role);
  } catch (error) {
    console.error('getRole error:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

exports.createRole = async (req, res) => {
  const { name, permissions = [] } = req.body;
  try {
    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          connect: permissions.map((p) => (typeof p === 'object' ? { id: p.id } : { id: p })),
        },
      },
      include: { permissions: true },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'create',
      resource: 'Roles',
      resourceId: String(role.id),
      message: `Created Role ${role.id}`,
      changes: { after: role },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('createRole error:', error);
    res.status(400).json({ error: 'Failed to create role' });
  }
};

exports.updateRole = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, permissions = [] } = req.body;

  try {
    const existing = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: {
          set: permissions.map((p) => (typeof p === 'object' ? { id: p.id } : { id: p })),
        },
      },
      include: { permissions: true },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Roles',
      resourceId: String(id),
      message: `Updated Role ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updated);
  } catch (error) {
    console.error('updateRole error:', error);
    res.status(400).json({ error: 'Failed to update role' });
  }
};

exports.deleteRole = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const deletedRole = await prisma.role.delete({
      where: { id },
      include: { permissions: true }
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Roles',
      resourceId: String(id),
      message: `Deleted Role ${id}`,
      changes: { before: deletedRole },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('deleteRole error:', error);
    res.status(400).json({ error: 'Failed to delete role' });
  }
};
