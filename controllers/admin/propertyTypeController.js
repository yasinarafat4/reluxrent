const prisma = require('../../config/prisma');
const { processImage, saveBase64Image } = require('../../helpers/uploadFileToStorage');


const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, propertyTypeId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// List all users
exports.getPropertyTypes = async (req, res) => {
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
            propertyTypeTranslation: {
              some: {
                name: { contains: q },
              },
            },
          },
          {
            propertyTypeTranslation: {
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
        propertyTypeTranslation: true,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.propertyType.findMany(queryOptions), prisma.propertyType.count({ where: filter })]);
    res.setHeader('Content-Range', `propertyTypes ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((propertyType) => ({
      id: propertyType.id,
      icon: propertyType.icon,
      order: propertyType.order,
      status: propertyType.status,
      createdAt: propertyType.createdAt,
      updatedAt: propertyType.updatedAt,
      translations: groupTranslationsByLocale(propertyType.propertyTypeTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch propertyTypes' });
  }
};

// Get single user
exports.getPropertyType = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const propertyType = await prisma.propertyType.findUnique({
      where: { id },
      include: {
        propertyTypeTranslation: true,
      },
    });

    if (!propertyType) return res.status(404).json({ error: 'Property Type not found' });

    res.json({
      id: propertyType.id,
      icon: propertyType.icon,
      order: propertyType.order,
      status: propertyType.status,
      createdAt: propertyType.createdAt,
      updatedAt: propertyType.updatedAt,
      translations: groupTranslationsByLocale(propertyType.propertyTypeTranslation),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Property' });
  }
};

// Create user
exports.createPropertyType = async (req, res) => {
  try {
    const { translations, icon, order, status } = req.body;
    const processedIcon = await processImage(icon);

    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        name: fields.name,
        description: fields.description,
      })),
    );
    const propertyType = await prisma.propertyType.create({
      data: {
        icon: processedIcon,
        order,
        status,
        propertyTypeTranslation: {
          create: processedTranslations,
        },
      },
    });

    res.status(201).json(propertyType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Property Type' });
  }
};

// Update user
exports.updatePropertyType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { translations, icon, order, status } = req.body;

    const processedIcon = await processImage(icon);

    const updatedpropertyType = await prisma.propertyType.update({
      where: { id },
      data: {
        order,
        status,
        ...(processedIcon ? { icon: processedIcon } : {}),
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.propertyTypeTranslation.upsert({
        where: {
          propertyTypeId_locale: {
            propertyTypeId: id,
            locale,
          },
        },
        create: {
          propertyTypeId: id,
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

    res.json(updatedpropertyType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Amenity' });
  }
};

// Delete user
exports.deletePropertyType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.propertyTypeTranslation.deleteMany({ where: { propertyTypeId: id } });
    await prisma.propertyType.delete({ where: { id } });
    res.json({ message: 'Property Type deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Property Type' });
  }
};
