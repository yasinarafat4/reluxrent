const prisma = require('../../config/prisma');
const bcryptjs = require('bcryptjs');


// List all users
exports.getCountries = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const q = req.query.q ? req.query.q : '';
    const status = req.query.status;
    const page = req.query._page ? parseInt(req.query._page) : null;
    const limit = req.query._limit ? parseInt(req.query._limit) : null;
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
        OR: [{ name: { contains: q } }, { iso3: { contains: q } }, { iso2: { contains: q } }, { phonecode: { contains: q } }, { currency: { contains: q } }, { currency_symbol: { contains: q } }],
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
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.country.findMany(queryOptions), prisma.country.count({ where: filter })]);

    res.setHeader('Content-Range', `countries ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Countries' });
  }
};

// Get single user
exports.getCountry = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const country = await prisma.country.findUnique({
      where: { id },
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json(country);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch country' });
  }
};

// Create user
exports.createCountry = async (req, res) => {
  const { name, iso3, iso2, phonecode, currency, currency_name, currency_symbol, latitude, longitude, emoji, status } = req.body;
  try {
    const country = await prisma.country.create({
      data: {
        name,
        iso3,
        iso2,
        phonecode,
        currency,
        currency_name,
        currency_symbol,
        latitude,
        longitude,
        emoji,
        status,
      },
    });

    res.status(201).json(country);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Country' });
  }
};

// Update user
exports.updateCountry = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, iso3, iso2, phonecode, currency, currency_name, currency_symbol, latitude, longitude, emoji, status } = req.body;

  try {
    const updateData = {
      name,
      iso3,
      iso2,
      phonecode,
      currency,
      currency_name,
      currency_symbol,
      latitude,
      longitude,
      emoji,
      status,
    };

    const country = await prisma.country.update({
      where: { id },
      data: updateData,
    });

    res.json(country);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Country' });
  }
};

// Delete user
exports.deleteCountry = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.country.delete({ where: { id } });
    res.json({ message: 'Country deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Country' });
  }
};
