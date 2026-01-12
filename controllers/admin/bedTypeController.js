const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
const prisma = require('../../config/prisma');

const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, amenitiesId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// List all users
exports.getBedTypes = async (req, res) => {
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
            bedTypeTranslation: {
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
        bedTypeTranslation: true,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.bedType.findMany(queryOptions), prisma.bedType.count({ where: filter })]);
    res.setHeader('Content-Range', `bedTypes ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((bedType) => ({
      id: bedType.id,
      order: bedType.order,
      status: bedType.status,
      createdAt: bedType.createdAt,
      updatedAt: bedType.updatedAt,
      translations: groupTranslationsByLocale(bedType.bedTypeTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Bed Type' });
  }
};

// Get single user
exports.getBedType = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const bedType = await prisma.bedType.findUnique({
      where: { id },
      include: {
        bedTypeTranslation: true,
      },
    });

    if (!bedType) return res.status(404).json({ error: 'Bed Type not found' });

    res.json({
      id: bedType.id,
      order: bedType.order,
      status: bedType.status,
      createdAt: bedType.createdAt,
      updatedAt: bedType.updatedAt,
      bedTypeTranslation: groupTranslationsByLocale(bedType.bedTypeTranslation),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Bed Type' });
  }
};

// Create user
exports.createBedType = async (req, res) => {
  try {
    const { translations, order, status } = req.body;

    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        name: fields.name,
      })),
    );
    const bedType = await prisma.bedType.create({
      data: {
        order,
        status,
        bedTypeTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        bedTypeTranslation: true,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'create',
      resource: 'Bed Type',
      resourceId: String(bedType.id),
      message: `Created Bed Type ${bedType.id}`,
      changes: { after: bedType },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.status(201).json(bedType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Bed Type' });
  }
};

// Update user
exports.updateBedType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { bedTypeTranslation, order, status } = req.body;

    const existing = await prisma.bedType.findUnique({
      where: { id },
      include: {
        bedTypeTranslation: true,
      },
    });

    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updatedBedType = await prisma.bedType.update({
      where: { id },
      data: {
        order,
        status,
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(bedTypeTranslation)) {
      await prisma.bedTypeTranslation.upsert({
        where: {
          bedTypeId_locale: {
            bedTypeId: id,
            locale,
          },
        },
        create: {
          bedTypeId: id,
          locale,
          name: fields.name,
        },
        update: {
          name: fields.name,
        },
      });
    }

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Bed Type',
      resourceId: String(id),
      message: `Updated Bed Type ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedBedType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Bed Type' });
  }
};

// Delete user
exports.deleteBedType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedBedType = await prisma.bedType.delete({
      where: { id },
      include: {
        bedTypeTranslation: true,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Bed Type',
      resourceId: String(id),
      message: `Deleted Bed Type ${id}`,
      changes: { before: deletedBedType },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json({ message: 'Bed Type deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Bed Type' });
  }
};
