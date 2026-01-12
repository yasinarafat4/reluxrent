const prisma = require('../../config/prisma');
const fs = require('fs/promises');
const { glob } = require('glob');


// Get translations (optionally filtered by locale)
exports.getTranslations = async (req, res) => {
  try {
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';
    const localeFilter = req.query.locale;

    const where = {};
    if (localeFilter) where.locale = localeFilter;

    const [data, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.translation.count({ where }),
    ]);

    res.set('Content-Range', `translations ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json({
      data: data,
      total: total,
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
};

exports.syncTranslationKys = async (req, res) => {
  try {
    const { locale } = req.body;
    const files = glob.sync('src/**/*.{js,jsx,ts,tsx}');
    const keySet = new Set();

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const matches = content.match(/trans\(\s*['"`]([^'"`]+?)['"`]\s*\)/g);

      if (matches) {
        matches.forEach((match) => {
          const keyMatch = match.match(/trans\(\s*['"`]([^'"`]+?)['"`]\s*\)/);
          if (keyMatch && keyMatch[1]) {
            keySet.add(keyMatch[1]);
          }
        });
      }
    }

    const keys = [...keySet];

    for (const key of keys) {
      const exists = await prisma.translation.findFirst({
        where: { key, locale },
      });

      if (!exists) {
        await prisma.translation.create({
          data: {
            key,
            locale,
            value: '',
          },
        });
      }
    }

    res.json({ message: `Synced ${keys.length} keys.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync keys' });
  }
};

// Update only the value of a translation
exports.updateTranslation = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  try {
    const updated = await prisma.translation.update({
      where: { id: parseInt(id) },
      data: { value },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({ error: 'Failed to update translation' });
  }
};
