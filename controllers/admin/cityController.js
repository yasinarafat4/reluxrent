const prisma = require('../../config/prisma');

// List all users
exports.getCities = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const q = req.query.q ? req.query.q : '';
    const status = req.query.status;
    const countryId = req.query.countryId;
    const stateId = req.query.stateId;
    const page = req.query._page ? parseInt(req.query._page) : null;
    const limit = req.query._limit ? parseInt(req.query._limit) : null;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let filter = {
      AND: [q ? { name: { contains: q } } : {}],
    };

    if (ids.length > 0) {
      filter = { ...filter, id: { in: ids.map((id) => parseInt(id)) } };
    }

    if (status) {
      filter = {
        ...filter,
        status: status === 'true' ? true : status === 'false' ? false : undefined,
      };
    }

    if (countryId) {
      filter = { ...filter, countryId: parseInt(countryId) };
    }

    if (stateId) {
      filter = { ...filter, stateId: parseInt(stateId) };
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

    const [data, total] = await Promise.all([prisma.city.findMany(queryOptions), prisma.city.count({ where: filter })]);
    res.setHeader('Content-Range', `cities ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

// Get single user
exports.getCity = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const city = await prisma.city.findUnique({
      where: { id },
    });
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json(city);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch city' });
  }
};

// Create user
exports.createCity = async (req, res) => {
  try {
    const { name, countryId, stateId, latitude, longitude, status } = req.body;
    const city = await prisma.city.create({
      data: {
        name,
        latitude,
        longitude,
        status,
        country: {
          connect: { id: countryId },
        },
        state: {
          connect: { id: stateId },
        },
      },
    });

    res.status(201).json(city);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create City' });
  }
};

// Update user
exports.updateCity = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, countryId, stateId, latitude, longitude, popularCity, popularCitySort, status } = req.body;

  try {
    const updateData = {
      name,
      countryId,
      stateId,
      latitude,
      longitude,
      popularCity,
      popularCitySort,
      status,
    };

    const city = await prisma.city.update({
      where: { id },
      data: updateData,
    });

    res.json(city);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update City' });
  }
};

// Delete user
exports.deleteCity = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.city.delete({ where: { id } });
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete City' });
  }
};
