const prisma = require('../../config/prisma');

// List all users
exports.getCurrencies = async (req, res) => {
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
      filter = { ...filter, OR: [{ name: { contains: q } }, { code: { contains: q } }] };
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

    const [data, total] = await Promise.all([prisma.currency.findMany(queryOptions), prisma.currency.count({ where: filter })]);
    res.setHeader('Content-Range', `curencies ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch curencies' });
  }
};

// Get single user
exports.getCurrency = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const currency = await prisma.currency.findUnique({
      where: { id },
    });
    if (!currency) return res.status(404).json({ error: 'Currency not found' });
    res.json(currency);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch currency' });
  }
};

// Create user
exports.createCurrency = async (req, res) => {
  const { name, code, symbol, decimalPlaces, decimalSeparator, thousandSeparator, exchangeRate, status, defaultCurrency } = req.body;
  try {
    const currency = await prisma.currency.create({
      data: {
        name,
        code,
        symbol,
        decimalPlaces,
        decimalSeparator,
        thousandSeparator,
        exchangeRate,
        status,
        defaultCurrency,
      },
    });

    if (defaultCurrency) {
      req.session.defaultCurrency = currency;
      res.cookie('defaultCurrency', JSON.stringify(currency), { maxAge: 900000 });
    }

    res.status(201).json(currency);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Currency' });
  }
};

// Update user
exports.updateCurrency = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, code, symbol, decimalPlaces, decimalSeparator, thousandSeparator, exchangeRate, status, defaultCurrency } = req.body;

  try {
    const updateData = {
      name,
      code,
      symbol,
      decimalPlaces,
      decimalSeparator,
      thousandSeparator,
      exchangeRate,
      status,
      defaultCurrency,
    };

    const currency = await prisma.currency.update({
      where: { id },
      data: updateData,
    });

    if (defaultCurrency) {
      req.session.defaultCurrency = currency;
      res.cookie('defaultCurrency', JSON.stringify(currency), { maxAge: 900000 });
    }

    res.json(currency);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Currency' });
  }
};

// Delete user
exports.deleteCurrency = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.currency.delete({ where: { id } });
    res.json({ message: 'Currency deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Currency' });
  }
};
