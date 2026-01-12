const { convertDecimals } = require('../../helpers/convertDecimals');
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
exports.getAllPayments = async (req, res) => {
  try {
    const { userId, bookingId } = req.query;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const q = req.query.q ? req.query.q : '';
    const status = req.query.status;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let filter = {};
    if (userId) {
      filter.userId = userId;
    }
    if (bookingId) {
      filter.bookingId = bookingId;
    }

    if (q) {
      filter = {
        ...filter,
        OR: [{ transactionId: { contains: q } }, { bookingId: { contains: q } }],
      };
    }

    if (status) {
      filter.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where: filter,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          user: true,
        },
        skip: offset,
        take: limit,
      }),
      prisma.payment.count({ where: filter }),
    ]);

    res.setHeader('Content-Range', `payment ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json({ data: convertDecimals(data), total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Payments' });
  }
};

// GET /api/pages/:id
exports.getPayment = async (req, res) => {
  try {
    const id = req.params.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payment' });
  }
};

// POST /api/pages
exports.createPayment = async (req, res) => {
  try {
    const { translations, slug } = req.body;

    // Process translations
    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        title: fields.title,
        content: fields.content,
        canonical: fields.canonical,
        seoTitle: fields.seoTitle,
        seoDescription: fields.seoDescription,
        structuredData: fields.structuredData || {},
        seoImage: await processSeoImage(fields.seoImage),
      })),
    );

    // Create serviceSection
    const page = await prisma.page.create({
      data: {
        slug,
        PageTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        PageTranslation: true,
      },
    });

    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Page' });
  }
};

// PUT /api/pages/:id
exports.updatePayment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, slug } = req.body;

    // Step 1: Update only fields on Blog (scalar only)
    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        slug,
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.pageTranslation.upsert({
        where: {
          pageId_locale: {
            pageId: id,
            locale,
          },
        },
        create: {
          pageId: id,
          locale,
          title: fields.title,
          content: fields.content,
          seoTitle: fields.seoTitle,
          seoDescription: fields.seoDescription,
          canonical: fields.canonical,
          structuredData: fields.structuredData || {},
          seoImage,
        },
        update: {
          title: fields.title,
          content: fields.content,
          seoTitle: fields.seoTitle,
          seoDescription: fields.seoDescription,
          canonical: fields.canonical,
          structuredData: fields.structuredData || {},
          seoImage,
        },
      });
    }

    res.json(updatedPage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Page' });
  }
};

// DELETE /api/pages/:id
exports.deletePayment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.pageTranslation.deleteMany({ where: { pageId: id } });
    await prisma.page.delete({ where: { id } });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Page' });
  }
};
