const prisma = require('../../config/prisma');

exports.getAllAdminLogs = async (req, res) => {
  try {
    const { adminId } = req.query;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    const where = {};

    if (adminId) {
      where.adminId = adminId;
    }

    const [data, total] = await Promise.all([
      prisma.adminActivityLog.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          admin: true,
        },
      }),
      prisma.adminActivityLog.count({
        where,
      }),
    ]);

    res.setHeader('Content-Range', `adminActivityLog ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json({
      data,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Admin Activity Logs' });
  }
};
