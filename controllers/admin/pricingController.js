const prisma = require('../../config/prisma');
const { processSeoImage } = require('../../helpers/uploadFileToStorage');



// Helper: group translations by locale
const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, serviceId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// GET /api/pricings
exports.getAllPricings = async (req, res) => {
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
      prisma.pricing.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          PricingTranslation: true,
          service: true,
        },
      }),
      prisma.pricing.count(),
    ]);

    res.setHeader('Content-Range', `pricings ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((pricing) => ({
      id: pricing.id,
      serviceId: pricing.serviceId,
      image: pricing.image,
      order: pricing.order,
      status: pricing.status,
      createdAt: pricing.createdAt,
      updatedAt: pricing.updatedAt,
      service: pricing.service,
      translations: groupTranslationsByLocale(pricing.PricingTranslation),
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

// GET /api/pricings/:id
exports.getPricing = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const pricing = await prisma.pricing.findUnique({
      where: { id },
      include: { PricingTranslation: true, service: true },
    });

    if (!pricing) return res.status(404).json({ message: 'Pricing not found' });

    res.json({
      id: pricing.id,
      serviceId: pricing.serviceId,
      image: pricing.image,
      order: pricing.order,
      status: pricing.status,
      createdAt: pricing.createdAt,
      updatedAt: pricing.updatedAt,
      service: pricing.service,
      translations: groupTranslationsByLocale(pricing.PricingTranslation),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching blog' });
  }
};

// POST /api/pricings
exports.createPricing = async (req, res) => {
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
    const pricing = await prisma.pricing.create({
      data: {
        image: processedImage,
        order,
        status,
        service: {
          connect: { id: serviceId },
        },
        PricingTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        PricingTranslation: true,
      },
    });

    res.json(pricing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Pricing' });
  }
};

// PUT /api/pricings/:id
exports.updatePricing = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, serviceId, order, status, image } = req.body;

    // Process base64 main image
    const processedImage = await processSeoImage(image);

    // Step 1: Update only fields on Blog (scalar only)
    const updatedPricing = await prisma.pricing.update({
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
      await prisma.pricingTranslation.upsert({
        where: {
          pricingId_locale: {
            pricingId: id,
            locale,
          },
        },
        create: {
          pricingId: id,
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

    res.json(updatedPricing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Pricing' });
  }
};

// DELETE /api/pricings/:id
exports.deletePricing = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.pricingTranslation.deleteMany({ where: { pricingId: id } });
    await prisma.pricing.delete({ where: { id } });
    res.json({ message: 'Pricing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Pricing' });
  }
};
