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
const getAllServiceSections = async (req, res) => {
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
      prisma.serviceSection.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          ServiceSectionTranslation: true,
          service: true,
        },
      }),
      prisma.serviceSection.count(),
    ]);

    res.setHeader('Content-Range', `services ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((serviceSection) => ({
      id: serviceSection.id,
      serviceId: serviceSection.serviceId,
      image: serviceSection.image,
      order: serviceSection.order,
      status: serviceSection.status,
      createdAt: serviceSection.createdAt,
      updatedAt: serviceSection.updatedAt,
      service: serviceSection.service,
      translations: groupTranslationsByLocale(serviceSection.ServiceSectionTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch serviceSection' });
  }
};

// GET /api/blogs/:id
const getServiceSection = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const serviceSection = await prisma.serviceSection.findUnique({
      where: { id },
      include: { ServiceSectionTranslation: true, service: true },
    });

    if (!serviceSection) return res.status(404).json({ message: 'serviceSection not found' });

    res.json({
      id: serviceSection.id,
      serviceId: serviceSection.serviceId,
      slug: serviceSection.slug,
      image: serviceSection.image,
      order: serviceSection.order,
      status: serviceSection.status,
      createdAt: serviceSection.createdAt,
      updatedAt: serviceSection.updatedAt,
      service: serviceSection.service,
      translations: groupTranslationsByLocale(serviceSection.ServiceSectionTranslation),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching serviceSection' });
  }
};

// POST /api/blogs
const createServiceSection = async (req, res) => {
  try {
    const { translations, serviceId, order, status, image } = req.body;

    // Process base64 main image
    const processedImage = await processSeoImage(image);

    // Process translations
    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        title: fields.title,
        content: fields.content,
      })),
    );

    // Create serviceSection
    const serviceSection = await prisma.serviceSection.create({
      data: {
        image: processedImage,
        order,
        status,
        service: {
          connect: { id: serviceId },
        },
        ServiceSectionTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        ServiceSectionTranslation: true,
      },
    });

    res.json(serviceSection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create serviceSection' });
  }
};

// PUT /api/blogs/:id
const updateServiceSection = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, serviceId, order, status, image } = req.body;

    // Process base64 main image
    const processedImage = await processSeoImage(image);

    // Step 1: Update only fields on Blog (scalar only)
    const updatedServiceSection = await prisma.serviceSection.update({
      where: { id },
      data: {
        order,
        status,
        ...(processedImage ? { image: processedImage } : {}),
        service: {
          connect: { id: serviceId },
        },
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.serviceSectionTranslation.upsert({
        where: {
          serviceSectionId_locale: {
            serviceSectionId: id,
            locale,
          },
        },
        create: {
          serviceSectionId: id,
          locale,
          title: fields.title,
          content: fields.content,
        },
        update: {
          title: fields.title,
          content: fields.content,
        },
      });
    }

    res.json(updatedServiceSection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update serviceSection' });
  }
};

// DELETE /api/blogs/:id
const deleteServiceSection = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.serviceSectionTranslation.deleteMany({ where: { serviceSectionId: id } });
    await prisma.serviceSection.delete({ where: { id } });
    res.json({ message: 'serviceSection deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete serviceSection' });
  }
};

module.exports = {
  getAllServiceSections,
  getServiceSection,
  createServiceSection,
  updateServiceSection,
  deleteServiceSection,
};
