const prisma = require('../../config/prisma');
const { processImage, saveBase64Image } = require('../../helpers/uploadFileToStorage');


const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, amenitiesId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// List all users
exports.getPaymentMethods = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const q = req.query.q ? req.query.q : '';
    const status = req.query.status;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let filter = {};
    if (ids.length > 0) {
      filter = { id: { in: ids.map((id) => parseInt(id)) } }; // Handle multiple IDs or a single ID
    }
    if (q) {
      filter = {
        ...filter,
        OR: [
          {
            cancellationPolicyTranslation: {
              some: {
                name: { contains: q },
              },
            },
          },
        ],
      };
    }

    if (status) {
      filter = {
        ...filter,
        status: status === 'true' ? true : status === 'false' ? false : undefined,
      };
    }

    const queryOptions = {
      where: filter,
      orderBy: {
        [sortField]: sortOrder,
      },
      include: {
        cancellationPolicyTranslation: true,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.cancellationPolicy.findMany(queryOptions), prisma.cancellationPolicy.count({ where: filter })]);
    res.setHeader('Content-Range', `CancellationPolicy ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((cancellationPolicy) => ({
      id: cancellationPolicy.id,
      beforeDays: cancellationPolicy.beforeDays,
      beforeDayPriorRefund: cancellationPolicy.beforeDayPriorRefund,
      afterDayPriorRefund: cancellationPolicy.afterDayPriorRefund,
      createdAt: cancellationPolicy.createdAt,
      updatedAt: cancellationPolicy.updatedAt,
      translations: groupTranslationsByLocale(cancellationPolicy.cancellationPolicyTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Cancellation Policy' });
  }
};

// Get single user
exports.getPaymentMethod = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const cancellationPolicy = await prisma.cancellationPolicy.findUnique({
      where: { id },
      include: {
        cancellationPolicyTranslation: true,
      },
    });

    if (!cancellationPolicy) return res.status(404).json({ error: 'Cancellation Policy not found' });

    res.json({
      id: cancellationPolicy.id,
      beforeDays: cancellationPolicy.beforeDays,
      beforeDayPriorRefund: cancellationPolicy.beforeDayPriorRefund,
      afterDayPriorRefund: cancellationPolicy.afterDayPriorRefund,
      createdAt: cancellationPolicy.createdAt,
      updatedAt: cancellationPolicy.updatedAt,
      translations: groupTranslationsByLocale(cancellationPolicy.cancellationPolicyTranslation),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Cancellation Policy' });
  }
};

// Create user
exports.createPaymentMethod = async (req, res) => {
  try {
    const { translations, beforeDays, beforeDayPriorRefund, afterDayPriorRefund } = req.body;

    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        name: fields.name,
        description: fields.description,
      })),
    );
    const cancellationPolicy = await prisma.cancellationPolicy.create({
      data: {
        beforeDays,
        beforeDayPriorRefund,
        afterDayPriorRefund,
        cancellationPolicyTranslation: {
          create: processedTranslations,
        },
      },
    });

    res.status(201).json(cancellationPolicy);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Cancellation Policy' });
  }
};

// Update user
exports.updatePaymentMethod = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { translations, beforeDays, beforeDayPriorRefund, afterDayPriorRefund } = req.body;

    const updatedBedType = await prisma.cancellationPolicy.update({
      where: { id },
      data: {
        beforeDays,
        beforeDayPriorRefund,
        afterDayPriorRefund,
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.cancellationPolicyTranslation.upsert({
        where: {
          cancellationPolicyId_locale: {
            cancellationPolicyId: id,
            locale,
          },
        },
        create: {
          cancellationPolicyId: id,
          locale,
          name: fields.name,
          description: fields.description,
        },
        update: {
          name: fields.name,
          description: fields.description,
        },
      });
    }

    res.json(updatedBedType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Cancellation Policy' });
  }
};

// Delete user
exports.deletePaymentMethod = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.cancellationPolicyTranslation.deleteMany({ where: { bedTypeId: id } });
    await prisma.cancellationPolicy.delete({ where: { id } });
    res.json({ message: 'Cancellation Policy deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Cancellation Policy' });
  }
};
