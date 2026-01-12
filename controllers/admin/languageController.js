const prisma = require('../../config/prisma');

// Get all languages (with pagination support)
exports.getAllLanguages = async (req, res) => {
  try {
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    const [data, total] = await Promise.all([
      prisma.language.findMany({
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.language.count(),
    ]);

    res.set('Content-Range', `translations ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    res.json({
      data: data,
      total: total,
    });
  } catch (err) {
    console.error('getAllLanguages error:', err);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
};

// Get one language
exports.getLanguageById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const language = await prisma.language.findUnique({ where: { id } });

    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }

    res.json(language);
  } catch (err) {
    console.error('getLanguageById error:', err);
    res.status(500).json({ error: 'Failed to fetch language' });
  }
};

// Create a new language
exports.createLanguage = async (req, res) => {
  try {
    const { name, code } = req.body;

    const newLang = await prisma.language.create({
      data: { name, code },
    });

    res.status(201).json(newLang);
  } catch (err) {
    console.error('createLanguage error:', err);
    res.status(500).json({ error: 'Failed to create language' });
  }
};

// Update a language
exports.updateLanguage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, code } = req.body;

    const updated = await prisma.language.update({
      where: { id },
      data: { name, code },
    });

    res.json(updated);
  } catch (err) {
    console.error('updateLanguage error:', err);
    res.status(500).json({ error: 'Failed to update language' });
  }
};

// Delete a language
exports.deleteLanguage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.language.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteLanguage error:', err);
    res.status(500).json({ error: 'Failed to delete language' });
  }
};
