const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
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
exports.getAmenities = async (req, res) => {
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
            amenitiesTranslation: {
              some: {
                name: { contains: q },
              },
            },
          },
          {
            amenitiesTranslation: {
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
        amenitiesTranslation: true,
        amenitiesType: {
          include: {
            amenitiesTypeTranslation: true,
          },
        },
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.amenities.findMany(queryOptions), prisma.amenities.count({ where: filter })]);
    res.setHeader('Content-Range', `amenities ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((amenity) => ({
      id: amenity.id,
      amenitiesTypeId: amenity.amenitiesTypeId,
      icon: amenity.icon,
      order: amenity.order,
      status: amenity.status,
      createdAt: amenity.createdAt,
      updatedAt: amenity.updatedAt,
      amenitiesType: { id: amenity.amenitiesType.id, translations: groupTranslationsByLocale(amenity.amenitiesType.amenitiesTypeTranslation) },
      translations: groupTranslationsByLocale(amenity.amenitiesTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
};

// Get single user
exports.getAmenity = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const amenity = await prisma.amenities.findUnique({
      where: { id },
      include: {
        amenitiesTranslation: true,
      },
    });

    if (!amenity) return res.status(404).json({ error: 'Amenity not found' });

    res.json({
      id: amenity.id,
      amenitiesTypeId: amenity.amenitiesTypeId,
      icon: amenity.icon,
      order: amenity.order,
      status: amenity.status,
      createdAt: amenity.createdAt,
      updatedAt: amenity.updatedAt,
      amenitiesTranslation: groupTranslationsByLocale(amenity.amenitiesTranslation),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Amenity' });
  }
};

// Create user
exports.createAmenity = async (req, res) => {
  try {
    const { translations, icon, order, status, amenitiesTypeId } = req.body;
    const processedIcon = await processImage(icon);

    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        name: fields.name,
        description: fields.description,
      })),
    );
    const amenity = await prisma.amenities.create({
      data: {
        icon: processedIcon,
        order,
        status,
        amenitiesType: {
          connect: { id: amenitiesTypeId },
        },
        amenitiesTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        amenitiesType: true,
        amenitiesTranslation: true,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'create',
      resource: 'Amenities',
      resourceId: String(amenity.id),
      message: `Created Amenity ${amenity.id}`,
      changes: { after: amenity },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.status(201).json(amenity);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Currency' });
  }
};

// Update user
exports.updateAmenity = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amenitiesTranslation, icon, order, status, amenitiesTypeId } = req.body;

    const processedIcon = await processImage(icon);

    const existing = await prisma.amenities.findUnique({
      where: { id },
      include: {
        amenitiesTranslation: true,
        amenitiesType: {
          include: {
            amenitiesTypeTranslation: true,
          },
        },
      },
    });
    
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updatedAmenity = await prisma.amenities.update({
      where: { id },
      data: {
        order,
        status,
        amenitiesType: {
          connect: { id: amenitiesTypeId },
        },
        ...(processedIcon ? { icon: processedIcon } : {}),
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(amenitiesTranslation)) {
      await prisma.amenitiesTranslation.upsert({
        where: {
          amenitiesId_locale: {
            amenitiesId: id,
            locale,
          },
        },
        create: {
          amenitiesId: id,
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
      resource: 'Amenities',
      resourceId: String(id),
      message: `Updated Amenity ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedAmenity);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Amenity' });
  }
};

// Delete user
exports.deleteAmenity = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedAmenity = await prisma.amenities.delete({
      where: { id },
      include: {
        amenitiesTranslation: true,
        amenitiesType: {
          include: {
            amenitiesTypeTranslation: true,
          },
        },
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Amenities',
      resourceId: String(id),
      message: `Deleted Amenity ${id}`,
      changes: { before: deletedAmenity },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Amenity' });
  }
};
