const prisma = require('../../config/prisma');

// Helper: group translations by locale
const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// GET /api/pages
exports.getAllLogs = async (req, res) => {
  try {
    const { userId, adminId } = req.query;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const q = req.query.q ? req.query.q : '';
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let where = {};

    if (userId) {
      where.userId = userId;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (q) {
      where = {
        ...where,
        action: { contains: q },
      };
    }

    const [data, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.activityLog.count({
        where,
      }),
    ]);

    res.setHeader('Content-Range', `logs ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json({
      data,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Logs' });
  }
};

// GET /api/pages/:id
exports.getLog = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const log = await prisma.activityLog.findUnique({
      where: { id },
    });

    if (!log) return res.status(404).json({ message: 'Logs not found' });

    res.json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching Logs' });
  }
};

// POST /api/pages
exports.createLog = async (req, res) => {
  try {
    res.json();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Logs' });
  }
};

// PUT /api/pages/:id
exports.updateLog = async (req, res) => {
  try {
    res.json();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Logs' });
  }
};

// DELETE /api/pages/:id
exports.deleteLog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.activityLog.delete({ where: { id } });
    res.json({ message: 'Logs deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Logs' });
  }
};
