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
exports.getFees = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const q = req.query.q ? req.query.q : '';
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
      };
    }

    const queryOptions = {
      where: filter,
      orderBy: {
        [sortField]: sortOrder,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.propertyFees.findMany(queryOptions), prisma.propertyFees.count({ where: filter })]);
    res.setHeader('Content-Range', `PropertyFees ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((propertyFee) => ({
      id: propertyFee.id,
      guestFee: propertyFee.guestFee,
      hostFee: propertyFee.hostFee,
      moreThenSeven: propertyFee.moreThenSeven,
      lessThenSeven: propertyFee.lessThenSeven,
      hostPenalty: propertyFee.hostPenalty,
      createdAt: propertyFee.createdAt,
      updatedAt: propertyFee.updatedAt,
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Property Fees' });
  }
};

// Get single user
exports.getFee = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const propertyFee = await prisma.propertyFees.findUnique({
      where: { id },
    });

    if (!propertyFee) return res.status(404).json({ error: 'Property Fees not found' });

    res.json({
      id: propertyFee.id,
      guestFee: propertyFee.guestFee,
      hostFee: propertyFee.hostFee,
      moreThenSeven: propertyFee.moreThenSeven,
      lessThenSeven: propertyFee.lessThenSeven,
      hostPenalty: propertyFee.hostPenalty,
      createdAt: propertyFee.createdAt,
      updatedAt: propertyFee.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Property Fees' });
  }
};

// Create user
exports.createFee = async (req, res) => {
  try {
    const { guestFee, hostFee, moreThenSeven, lessThenSeven, hostPenalty } = req.body;

    const propertyFee = await prisma.propertyFees.create({
      data: {
        guestFee,
        hostFee,
        moreThenSeven,
        lessThenSeven,
        hostPenalty,
      },
    });

    res.status(201).json(propertyFee);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Property Fees' });
  }
};

// Update user
exports.updateFee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { guestFee, hostFee, moreThenSeven, lessThenSeven, hostPenalty } = req.body;

    const updatedpropertyFee = await prisma.propertyFees.update({
      where: { id },
      data: {
        guestFee,
        hostFee,
        moreThenSeven,
        lessThenSeven,
        hostPenalty,
      },
    });

    res.json(updatedpropertyFee);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Fees' });
  }
};

// Delete user
exports.deleteFee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.propertyFees.delete({ where: { id } });
    res.json({ message: 'Property Fees deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Property Fees' });
  }
};
