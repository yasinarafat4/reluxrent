const prisma = require('../../config/prisma');
const { processImage } = require('../../helpers/uploadFileToStorage');


// Helper to group translations by locale
const groupTranslationsByLocale = (translations) => {
  const grouped = {};
  translations.forEach((t) => {
    const { locale, helpCategoryId, id, ...rest } = t;
    grouped[locale] = rest;
  });
  return grouped;
};

// GET /api/help-categories
const getAllHelpCategories = async (req, res) => {
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
      prisma.helpCategory.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: { helpCategoryTranslation: true },
      }),
      prisma.helpCategory.count({ where }),
    ]);

    res.setHeader('Content-Range', `helpCategories ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((category) => ({
      id: category.id,
      slug: category.slug,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      translations: groupTranslationsByLocale(category.helpCategoryTranslation),
    }));
    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// GET /api/help-categories/:id
const getHelpCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const category = await prisma.helpCategory.findUnique({
      where: { id },
      include: { helpCategoryTranslation: true },
    });

    if (!category) return res.status(404).json({ message: 'Not found' });

    res.json({
      id: category.id,
      slug: category.slug,
      translations: groupTranslationsByLocale(category.helpCategoryTranslation),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving category' });
  }
};

// POST /api/help-categories
const createHelpCategory = async (req, res) => {
  try {
    const { translations, ...rest } = req.body;

    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        ...fields,
        seoImage: await processImage(fields.seoImage),
        structuredData: fields.structuredData || {},
      })),
    );

    const category = await prisma.helpCategory.create({
      data: {
        ...rest,
        helpCategoryTranslation: {
          create: processedTranslations,
        },
      },
    });

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// PUT /api/help-categories/:id
const updateHelpCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, slug } = req.body;

    // Step 1: Update only fields on HelpCategory (scalar only)
    const updatedCategory = await prisma.helpCategory.update({
      where: { id },
      data: { slug },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      const seoImage = await processImage(fields.seoImage);

      await prisma.helpCategoryTranslation.upsert({
        where: {
          helpCategoryId_locale: {
            helpCategoryId: id,
            locale,
          },
        },
        create: {
          helpCategoryId: id,
          locale,
          title: fields.title,
          seoTitle: fields.seoTitle,
          seoDescription: fields.seoDescription,
          canonical: fields.canonical,
          structuredData: fields.structuredData || {},
          seoImage,
        },
        update: {
          title: fields.title,
          seoTitle: fields.seoTitle,
          seoDescription: fields.seoDescription,
          canonical: fields.canonical,
          structuredData: fields.structuredData || {},
          ...(seoImage ? { seoImage } : {}),
        },
      });
    }

    res.json(updatedCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

// DELETE /api/help-categories/:id
const deleteHelpCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.helpCategoryTranslation.deleteMany({ where: { helpCategoryId: id } });
    await prisma.helpCategory.delete({ where: { id } });

    res.json({ message: 'Category deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  getAllHelpCategories,
  getHelpCategory,
  createHelpCategory,
  updateHelpCategory,
  deleteHelpCategory,
};
