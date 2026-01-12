const prisma = require('../../config/prisma');
const { processImage, saveBase64Image } = require('../../helpers/uploadFileToStorage');


const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, spaceTypeId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// List all users
exports.getSpaceTypes = async (req, res) => {
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
            spaceTypeTranslation: {
              some: {
                name: { contains: q },
              },
            },
          },
          {
            spaceTypeTranslation: {
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
        spaceTypeTranslation: true,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.spaceType.findMany(queryOptions), prisma.spaceType.count({ where: filter })]);
    res.setHeader('Content-Range', `spaceTypes ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((spaceType) => ({
      id: spaceType.id,
      icon: spaceType.icon,
      order: spaceType.order,
      status: spaceType.status,
      createdAt: spaceType.createdAt,
      updatedAt: spaceType.updatedAt,
      translations: groupTranslationsByLocale(spaceType.spaceTypeTranslation),
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
exports.getSpaceType = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const spaceType = await prisma.spaceType.findUnique({
      where: { id },
      include: {
        spaceTypeTranslation: true,
      },
    });

    if (!spaceType) return res.status(404).json({ error: 'Space Type not found' });

    res.json({
      id: spaceType.id,
      icon: spaceType.icon,
      order: spaceType.order,
      status: spaceType.status,
      createdAt: spaceType.createdAt,
      updatedAt: spaceType.updatedAt,
      translations: groupTranslationsByLocale(spaceType.spaceTypeTranslation),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Space Type' });
  }
};

// Create user
exports.createSpaceType = async (req, res) => {
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
    const spaceType = await prisma.spaceType.create({
      data: {
        icon: processedIcon,
        order,
        status,
        spaceTypeTranslation: {
          create: processedTranslations,
        },
      },
    });

    res.status(201).json(spaceType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Space Type' });
  }
};

// Update user
exports.updateSpaceType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { translations, icon, order, status } = req.body;
    const processedIcon = await processImage(icon);
    const updatedSpaceType = await prisma.spaceType.update({
      where: { id },
      data: {
        order,
        status,
        ...(processedIcon ? { icon: processedIcon } : {}),
      },
    });

    // Step 2: Upsert each translation using the composite unique key
    for (const [locale, fields] of Object.entries(translations)) {
      await prisma.spaceTypeTranslation.upsert({
        where: {
          spaceTypeId_locale: {
            spaceTypeId: id,
            locale,
          },
        },
        create: {
          spaceTypeId: id,
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

    res.json(updatedSpaceType);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Space Type' });
  }
};

// Delete user
exports.deleteSpaceType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.spaceTypeTranslation.deleteMany({ where: { spaceTypeId: id } });
    await prisma.spaceType.delete({ where: { id } });
    res.json({ message: 'Space Type deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Space Type' });
  }
};
