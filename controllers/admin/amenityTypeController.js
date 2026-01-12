const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
const prisma = require('../../config/prisma');

const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, amenitiesTypeId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// List all users
exports.getAmenityTypes = async (req, res) => {
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
            amenitiesTypeTranslation: {
              some: {
                name: { contains: q },
              },
            },
          },
          {
            amenitiesTypeTranslation: {
              some: {
                description: { contains: q },
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
        amenitiesTypeTranslation: true,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.amenitiesType.findMany(queryOptions), prisma.amenitiesType.count({ where: filter })]);
    res.setHeader('Content-Range', `amenitiesTypes ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((amenitiesType) => ({
      id: amenitiesType.id,
      order: amenitiesType.order,
      status: amenitiesType.status,
      createdAt: amenitiesType.createdAt,
      updatedAt: amenitiesType.updatedAt,
      translations: groupTranslationsByLocale(amenitiesType.amenitiesTypeTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch amenitiesTypes' });
  }
};

// Get single user
exports.getAmenityType = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const amenitiesType = await prisma.amenitiesType.findUnique({
      where: { id },
      include: {
        amenitiesTypeTranslation: true,
      },
    });
    if (!amenitiesType) return res.status(404).json({ error: 'Amenities Type not found' });

    res.json({
      id: amenitiesType.id,
      order: amenitiesType.order,
      status: amenitiesType.status,
      createdAt: amenitiesType.createdAt,
      updatedAt: amenitiesType.updatedAt,
      amenitiesTypeTranslation: groupTranslationsByLocale(amenitiesType.amenitiesTypeTranslation),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Amenities Type' });
  }
};

// Create user
exports.createAmenityType = async (req, res) => {
  try {
    const { translations, order, status } = req.body;

    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        name: fields.name,
        description: fields.description,
      })),
    );
    const amenitiesType = await prisma.amenitiesType.create({
      data: {
        order,
        status,
        amenitiesTypeTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        amenitiesTypeTranslation: true,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'create',
      resource: 'Amenities Type',
      resourceId: String(amenitiesType.id),
      message: `Created Amenities Type ${amenitiesType.id}`,
      changes: { after: amenitiesType },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.status(201).json(amenitiesType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Amenities Type' });
  }
};

// Update user
exports.updateAmenityType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amenitiesTypeTranslation, order, status } = req.body;

    const existing = await prisma.amenitiesType.findUnique({
      where: { id },
      include: {
        amenitiesTypeTranslation: true,
      },
    });

    console.log('existing', existing);
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updatedAmenityType = await prisma.amenitiesType.update({
      where: { id },
      data: {
        order,
        status,
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(amenitiesTypeTranslation)) {
      await prisma.amenitiesTypeTranslation.upsert({
        where: {
          amenitiesTypeId_locale: {
            amenitiesTypeId: id,
            locale,
          },
        },
        create: {
          amenitiesTypeId: id,
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

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Amenities Type',
      resourceId: String(id),
      message: `Updated Amenities Type ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedAmenityType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Amenity Type' });
  }
};

// Delete user
exports.deleteAmenityType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedAmenitiesType = await prisma.amenitiesType.delete({
      where: { id },
      include: {
        amenitiesTypeTranslation: true,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Amenities Type',
      resourceId: String(id),
      message: `Deleted Amenities Type ${id}`,
      changes: { before: deletedAmenitiesType },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json({ message: 'Amenity Type deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Amenity Type' });
  }
};
