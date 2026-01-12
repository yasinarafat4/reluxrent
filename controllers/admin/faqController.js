const prisma = require('../../config/prisma');
const { processSeoImage } = require('../../helpers/uploadFileToStorage');



const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// GET /api/faqs
exports.getAllFaqs = async (req, res) => {
  try {
    const { slug } = req.query;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    const where = {};

    if (slug) {
      where.slug = slug;
    }

    const [data, total] = await Promise.all([
      prisma.faq.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          FaqTranslation: true,
        },
      }),
      prisma.faq.count(),
    ]);

    res.setHeader('Content-Range', `faqs ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((faq) => ({
      id: faq.id,
      order: faq.order,
      status: faq.status,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
      translations: groupTranslationsByLocale(faq.FaqTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Faqs' });
  }
};

// GET /api/faqs/:id
exports.getFaq = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const faq = await prisma.faq.findUnique({
      where: { id },
      include: { FaqTranslation: true },
    });

    if (!faq) return res.status(404).json({ message: 'Faq not found' });

    res.json({
      id: faq.id,
      order: faq.order,
      status: faq.status,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
      translations: groupTranslationsByLocale(faq.FaqTranslation),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching Faq' });
  }
};

// POST /api/faqs
exports.createFaq = async (req, res) => {
  try {
    const { translations, order, status } = req.body;

    // Process translations
    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        question: fields.question,
        answer: fields.answer,
      })),
    );

    // Create serviceSection
    const faq = await prisma.faq.create({
      data: {
        order,
        status,
        FaqTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        FaqTranslation: true,
      },
    });

    res.json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Faq' });
  }
};

// PUT /api/faqs/:id
exports.updateFaq = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, order, status } = req.body;

    // Step 1: Update only fields on Blog (scalar only)
    const updatedFaq = await prisma.faq.update({
      where: { id },
      data: {
        order,
        status,
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.faqTranslation.upsert({
        where: {
          faqId_locale: {
            faqId: id,
            locale,
          },
        },
        create: {
          faqId: id,
          locale,
          question: fields.question,
          answer: fields.answer,
        },
        update: {
          question: fields.question,
          answer: fields.answer,
        },
      });
    }

    res.json(updatedFaq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Faq' });
  }
};

// DELETE /api/faqs/:id
exports.deleteFaq = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.faqTranslation.deleteMany({ where: { faqId: id } });
    await prisma.faq.delete({ where: { id } });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Page' });
  }
};
