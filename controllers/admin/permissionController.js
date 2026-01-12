const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
const prisma = require('../../config/prisma');

// Get all permissions
exports.getPermissions = async (req, res) => {
  try {
    const { slug, excludeId } = req.query;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    const where = {};

    if (slug) {
      where.slug = slug;
    }

    // Exclude current item in edit mode
    if (excludeId) {
      where.id = { not: Number(excludeId) };
    }
    const [data, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.permission.count(),
    ]);

    res.setHeader('Content-Range', `permissions ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error('getPermissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

// Get single permission
exports.getPermission = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid permission ID' });

  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) return res.status(404).json({ error: 'Permission not found' });
    res.json(permission);
  } catch (error) {
    console.error('getPermission error:', error);
    res.status(500).json({ error: 'Failed to fetch permission' });
  }
};

// Create permission
exports.createPermission = async (req, res) => {
  const { resource, action } = req.body;
  if (!resource || !action) return res.status(400).json({ error: "Resource or Action can't be null" });

  try {
    const permission = await prisma.permission.create({
      data: { resource, action },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'create',
      resource: 'Permissions',
      resourceId: String(permission.id),
      message: `Created Permission ${permission.id}`,
      changes: { after: permission },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.status(201).json(permission);
  } catch (error) {
    console.error('createPermission error:', error);
    res.status(400).json({ error: 'Failed to create permission' });
  }
};

// Update permission
exports.updatePermission = async (req, res) => {
  const id = parseInt(req.params.id);
  const { resource, action } = req.body;
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid permission ID' });
  if (!resource || !action) return res.status(400).json({ error: "Resource or Action can't be null" });

  try {
    const existing = await prisma.permission.findUnique({
      where: { id },
    });
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: { resource, action },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Permissions',
      resourceId: String(id),
      message: `Updated Permission ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedPermission);
  } catch (error) {
    console.error('updatePermission error:', error);
    res.status(400).json({ error: 'Failed to update permission' });
  }
};

// Delete permission
exports.deletePermission = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid permission ID' });

  try {
   const deletedPermission = await prisma.permission.delete({ where: { id } });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Permissions',
      resourceId: String(id),
      message: `Deleted Permission ${id}`,
      changes: { before: deletedPermission },
      meta: { ip: req.ip, route: req.originalUrl },
    });
    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('deletePermission error:', error);
    res.status(400).json({ error: 'Failed to delete permission' });
  }
};
