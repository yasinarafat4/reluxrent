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
exports.getAllPages = async (req, res) => {
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
      prisma.page.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          PageTranslation: true,
        },
      }),
      prisma.page.count(),
    ]);

    res.setHeader('Content-Range', `pages ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((page) => ({
      id: page.id,
      slug: page.slug,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      translations: groupTranslationsByLocale(page.PageTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Pricings' });
  }
};

// GET /api/pages/:id
exports.getPage = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const page = await prisma.page.findUnique({
      where: { id },
      include: { PageTranslation: true },
    });

    if (!page) return res.status(404).json({ message: 'Page not found' });

    res.json({
      id: page.id,
      slug: page.slug,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      translations: groupTranslationsByLocale(page.PageTranslation),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching blog' });
  }
};

// POST /api/pages
exports.createPage = async (req, res) => {
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
exports.updatePage = async (req, res) => {
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
exports.deletePage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.pageTranslation.deleteMany({ where: { pageId: id } });
    await prisma.page.delete({ where: { id } });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Page' });
  }
};
