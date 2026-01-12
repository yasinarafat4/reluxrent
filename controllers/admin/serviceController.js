const prisma = require('../../config/prisma');
const { processSeoImage, saveBase64Image } = require('../../helpers/uploadFileToStorage');



// Helper: group translations by locale
const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, serviceId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// GET /api/blogs
const getAllServices = async (req, res) => {
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
      prisma.service.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          ServiceTranslation: true,
        },
      }),
      prisma.service.count(),
    ]);

    res.setHeader('Content-Range', `services ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((service) => ({
      id: service.id,
      slug: service.slug,
      beforeImage: service.beforeImage,
      afterImage: service.afterImage,
      order: service.order,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      translations: groupTranslationsByLocale(service.ServiceTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Services' });
  }
};

// GET /api/blogs/:id
const getService = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const service = await prisma.service.findUnique({
      where: { id },
      include: { ServiceTranslation: true },
    });

    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.json({
      id: service.id,
      slug: service.slug,
      beforeImage: service.beforeImage,
      afterImage: service.afterImage,
      order: service.order,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      translations: groupTranslationsByLocale(service.ServiceTranslation),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching blog' });
  }
};

// POST /api/blogs
const createService = async (req, res) => {
  try {
    const { translations, slug, order, status, beforeImage, afterImage } = req.body;

    // Process base64 main image
    const processedBeforeImage = await processSeoImage(beforeImage);
    const processedAfterImage = await processSeoImage(afterImage);

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

    // Create Blog
    const service = await prisma.service.create({
      data: {
        slug,
        beforeImage: processedBeforeImage,
        afterImage: processedAfterImage,
        order,
        status,
        ServiceTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        ServiceTranslation: true,
      },
    });

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Service' });
  }
};

// PUT /api/blogs/:id
const updateService = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, slug, order, status, beforeImage, afterImage } = req.body;

    // Process base64 main image
    const processedBeforeImage = await processSeoImage(beforeImage);
    const processedAfterImage = await processSeoImage(afterImage);

    // Step 1: Update only fields on Blog (scalar only)
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        slug,
        order,
        status,
        ...(processedBeforeImage ? { beforeImage: processedBeforeImage } : {}),
        ...(processedAfterImage ? { afterImage: processedAfterImage } : {}),
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      const seoImage = await processSeoImage(fields.seoImage);

      await prisma.serviceTranslation.upsert({
        where: {
          serviceId_locale: {
            serviceId: id,
            locale,
          },
        },
        create: {
          serviceId: id,
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

    res.json(updatedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update blog' });
  }
};

// DELETE /api/blogs/:id
const deleteService = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.serviceTranslation.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service' });
  }
};

module.exports = {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
};
