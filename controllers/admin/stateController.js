const prisma = require('../../config/prisma');

// List all users
exports.getStates = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const q = req.query.q ? req.query.q : '';
    const status = req.query.status;
    const countryId = req.query.countryId;
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

    const [data, total] = await Promise.all([prisma.state.findMany(queryOptions), prisma.state.count({ where: filter })]);
    res.setHeader('Content-Range', `cities ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch States' });
  }
};

// Get single user
exports.getState = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const state = await prisma.state.findUnique({
      where: { id },
    });
    if (!state) return res.status(404).json({ error: 'State not found' });
    res.json(state);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
};

// Create user
exports.createState = async (req, res) => {
  try {
    const { name, countryId, latitude, longitude, status } = req.body;
    const state = await prisma.state.create({
      data: {
        name,
        latitude,
        longitude,
        status,
        country: {
          connect: { id: countryId },
        },
      },
    });

    res.status(201).json(state);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create State' });
  }
};

// Update user
exports.updateState = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, countryId, latitude, longitude, status } = req.body;

  try {
    const updateData = {
      name,
      countryId,
      latitude,
      longitude,
      status,
    };

    const state = await prisma.state.update({
      where: { id },
      data: updateData,
    });

    res.json(state);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update State' });
  }
};

// Delete user
exports.deleteState = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.state.delete({ where: { id } });
    res.json({ message: 'State deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete State' });
  }
};
