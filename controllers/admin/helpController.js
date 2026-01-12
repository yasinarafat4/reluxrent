const prisma = require('../../config/prisma');
const { processImage, saveBase64Image } = require('../../helpers/uploadFileToStorage');



// Helper: group translations by locale
const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, helpId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// GET /api/helps
const getAllHelps = async (req, res) => {
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
      prisma.help.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          helpTranslation: true,
          helpCategory: true,
        },
      }),
      prisma.help.count({ where }),
    ]);

    res.setHeader('Content-Range', `helps ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((help) => ({
      id: help.id,
      slug: help.slug,
      image: help.image,
      status: help.status,
      helpCategoryId: help.helpCategoryId,
      createdAt: help.createdAt,
      updatedAt: help.updatedAt,
      helpCategory: help.helpCategory,
      translations: groupTranslationsByLocale(help.helpTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch helps' });
  }
};

// GET /api/helps/:id
const getHelp = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const help = await prisma.help.findUnique({
      where: { id },
      include: { helpTranslation: true, helpCategory: true },
    });

    if (!help) return res.status(404).json({ message: 'Help not found' });

    res.json({
      id: help.id,
      slug: help.slug,
      image: help.image,
      status: help.status,
      helpCategoryId: help.helpCategoryId,
      createdAt: help.createdAt,
      updatedAt: help.updatedAt,
      helpCategory: help.helpCategory,
      translations: groupTranslationsByLocale(help.helpTranslation),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching help' });
  }
};

// POST /api/helps
const createHelp = async (req, res) => {
  try {
    const { translations, image, slug, helpCategoryId, status } = req.body;

    // Process base64 main image
    const processedImage = await processImage(image);

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
        seoImage: await processImage(fields.seoImage),
      })),
    );

    // Create Help
    const help = await prisma.help.create({
      data: {
        slug,
        image: processedImage,
        status,
        helpCategory: {
          connect: { id: helpCategoryId },
        },
        helpTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        helpTranslation: true,
      },
    });

    res.json(help);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create help' });
  }
};

// PUT /api/helps/:id
const updateHelp = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, slug, status, image, helpCategoryId } = req.body;

    const processedImage = await processImage(image);

    // Step 1: Update only fields on Help (scalar only)
    const updatedHelp = await prisma.help.update({
      where: { id },
      data: {
        slug,
        status,
        ...(processedImage ? { image: processedImage } : {}),
        helpCategory: {
          connect: { id: helpCategoryId },
        },
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      const seoImage = await processImage(fields.seoImage);

      await prisma.helpTranslation.upsert({
        where: {
          helpId_locale: {
            helpId: id,
            locale,
          },
        },
        create: {
          helpId: id,
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
          ...(seoImage ? { seoImage } : {}),
        },
      });
    }

    res.json(updatedHelp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update help' });
  }
};

// DELETE /api/helps/:id
const deleteHelp = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.helpTranslation.deleteMany({ where: { helpId: id } });
    await prisma.help.delete({ where: { id } });
    res.json({ message: 'Help deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete help' });
  }
};

module.exports = {
  getAllHelps,
  getHelp,
  createHelp,
  updateHelp,
  deleteHelp,
};
