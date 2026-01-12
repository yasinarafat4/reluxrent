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

// GET /api/service-faqs
const getAllServiceFaqs = async (req, res) => {
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
      prisma.serviceFaq.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
        include: {
          ServiceFaqTranslation: true,
          service: true,
        },
      }),
      prisma.serviceFaq.count(),
    ]);

    res.setHeader('Content-Range', `services ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((serviceFaq) => ({
      id: serviceFaq.id,
      serviceId: serviceFaq.serviceId,
      order: serviceFaq.order,
      status: serviceFaq.status,
      createdAt: serviceFaq.createdAt,
      updatedAt: serviceFaq.updatedAt,
      service: serviceFaq.service,
      translations: groupTranslationsByLocale(serviceFaq.ServiceFaqTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch service Faq' });
  }
};

// GET /api/service-faqs/:id
const getServiceFaq = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const serviceFaq = await prisma.serviceFaq.findUnique({
      where: { id },
      include: { ServiceFaqTranslation: true, service: true },
    });

    if (!serviceFaq) return res.status(404).json({ message: 'service Faq not found' });

    res.json({
      id: serviceFaq.id,
      serviceId: serviceFaq.serviceId,
      order: serviceFaq.order,
      status: serviceFaq.status,
      createdAt: serviceFaq.createdAt,
      updatedAt: serviceFaq.updatedAt,
      service: serviceFaq.service,
      translations: groupTranslationsByLocale(serviceFaq.ServiceFaqTranslation),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching service Faq' });
  }
};

// POST /api/service-faqs
const createServiceFaq = async (req, res) => {
  try {
    const { translations, serviceId, order, status } = req.body;

    // Process translations
    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        question: fields.question,
        answer: fields.answer,
      })),
    );

    // Create serviceSection
    const serviceFaq = await prisma.serviceFaq.create({
      data: {
        order,
        status,
        service: {
          connect: { id: serviceId },
        },
        ServiceFaqTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        ServiceFaqTranslation: true,
      },
    });

    res.json(serviceFaq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create service Faq' });
  }
};

// PUT /api/service-faqs/:id
const updateServiceFaq = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { translations, serviceId, order, status } = req.body;

    // Step 1: Update only fields on Blog (scalar only)
    const updatedServiceFaq = await prisma.serviceFaq.update({
      where: { id },
      data: {
        order,
        status,
        service: {
          connect: { id: serviceId },
        },
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.serviceFaqTranslation.upsert({
        where: {
          serviceFaqId_locale: {
            serviceFaqId: id,
            locale,
          },
        },
        create: {
          serviceFaqId: id,
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

    res.json(updatedServiceFaq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update service Faq' });
  }
};

// DELETE /api/service-faqs/:id
const deleteServiceFaq = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.serviceFaqTranslation.deleteMany({ where: { serviceFaqId: id } });
    await prisma.serviceFaq.delete({ where: { id } });
    res.json({ message: 'service Faq deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service Faq' });
  }
};

module.exports = {
  getAllServiceFaqs,
  getServiceFaq,
  createServiceFaq,
  updateServiceFaq,
  deleteServiceFaq,
};
