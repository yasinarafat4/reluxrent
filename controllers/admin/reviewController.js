const prisma = require('../../config/prisma');
const { processSeoImage } = require('../../helpers/uploadFileToStorage');

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
exports.getAllReviews = async (req, res) => {
  try {
    const { slug, q } = req.query;
    const receiverId = req.query.receiverId;
    const senderId = req.query.senderId;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let where = {};

    if (slug) {
      where.slug = slug;
    }

    if (q) {
      where = {
        ...where,
        OR: [
          {
            reviewSender: {
              name: { contains: q },
            },
          },
          {
            reviewReceiver: {
              name: { contains: q },
            },
          },
        ],
      };
    }

    if (receiverId) {
      where.receiverId = receiverId;
    }
    if (senderId) {
      where.senderId = senderId;
    }

    const [data, total] = await Promise.all([
      prisma.reviews.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          ratings: true,
          reviewSender: true,
          reviewReceiver: true,
        },
        skip: offset,
        take: limit,
      }),
      prisma.reviews.count({ where }),
    ]);

    res.setHeader('Content-Range', `reviews ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json({
      data: data,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Reviews' });
  }
};

// GET /api/pages/:id
exports.getReview = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const review = await prisma.reviews.findUnique({
      where: { id },
      include: {
        ratings: true,
      },
    });

    if (!review) return res.status(404).json({ message: 'Reviews not found' });

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching Review' });
  }
};

// POST /api/pages
exports.createReview = async (req, res) => {
  try {
    const { translations, slug } = req.body;

    res.json();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Review' });
  }
};

// PUT /api/pages/:id
exports.updateReview = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, slug } = req.body;

    res.json();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Review' });
  }
};

// DELETE /api/pages/:id
exports.deleteReview = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.reviews.delete({ where: { id } });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Review' });
  }
};
