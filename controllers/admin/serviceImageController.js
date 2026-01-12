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
const getAllServiceImages = async (req, res) => {
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
      prisma.serviceImage.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          ServiceImageTranslation: true,
          service: true,
        },
      }),
      prisma.serviceImage.count(),
    ]);

    res.setHeader('Content-Range', `services ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((serviceImage) => ({
      id: serviceImage.id,
      serviceId: serviceImage.serviceId,
      beforeImage: serviceImage.beforeImage,
      afterImage: serviceImage.afterImage,
      order: serviceImage.order,
      status: serviceImage.status,
      createdAt: serviceImage.createdAt,
      updatedAt: serviceImage.updatedAt,
      service: serviceImage.service,
      translations: groupTranslationsByLocale(serviceImage.ServiceImageTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Service Image' });
  }
};

// GET /api/blogs/:id
const getServiceImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const serviceImage = await prisma.serviceImage.findUnique({
      where: { id },
      include: { ServiceImageTranslation: true, service: true },
    });

    if (!serviceImage) return res.status(404).json({ message: 'Service Image not found' });

    res.json({
      id: serviceImage.id,
      serviceId: serviceImage.serviceId,
      beforeImage: serviceImage.beforeImage,
      afterImage: serviceImage.afterImage,
      order: serviceImage.order,
      status: serviceImage.status,
      createdAt: serviceImage.createdAt,
      updatedAt: serviceImage.updatedAt,
      service: serviceImage.service,
      translations: groupTranslationsByLocale(serviceImage.ServiceImageTranslation),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching Service Image' });
  }
};

// POST /api/blogs
const createServiceImage = async (req, res) => {
  try {
    const { translations, serviceId, order, status, beforeImage, afterImage } = req.body;

    // Process base64 main image
    const processedBeforeImage = await processSeoImage(beforeImage);
    const processedAfterImage = await processSeoImage(afterImage);

    // Process translations
    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        title: fields.title,
      })),
    );

    // Create Blog
    const serviceImage = await prisma.serviceImage.create({
      data: {
        beforeImage: processedBeforeImage,
        afterImage: processedAfterImage,
        order,
        status,
        service: {
          connect: { id: serviceId },
        },
        ServiceImageTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        ServiceImageTranslation: true,
      },
    });

    res.json(serviceImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Service Image' });
  }
};

// PUT /api/blogs/:id
const updateServiceImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, serviceId, order, status, beforeImage, afterImage } = req.body;

    // Process base64 main image
    const processedBeforeImage = await processSeoImage(beforeImage);
    const processedAfterImage = await processSeoImage(afterImage);

    // Step 1: Update only fields on Blog (scalar only)
    const updatedServiceImage = await prisma.serviceImage.update({
      where: { id },
      data: {
        order,
        status,
        ...(processedBeforeImage ? { beforeImage: processedBeforeImage } : {}),
        ...(processedAfterImage ? { afterImage: processedAfterImage } : {}),
        service: {
          connect: { id: serviceId },
        },
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.serviceImageTranslation.upsert({
        where: {
          serviceImageId_locale: {
            serviceImageId: id,
            locale,
          },
        },
        create: {
          serviceImageId: id,
          locale,
          title: fields.title,
        },
        update: {
          title: fields.title,
        },
      });
    }

    res.json(updatedServiceImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Service Image' });
  }
};

// DELETE /api/blogs/:id
const deleteServiceImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.serviceTranslation.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service Image' });
  }
};

module.exports = {
  getAllServiceImages,
  getServiceImage,
  createServiceImage,
  updateServiceImage,
  deleteServiceImage,
};
