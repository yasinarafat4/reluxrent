const prisma = require('../../config/prisma');
const { findTranslation } = require('../../helpers/findTranslation');

module.exports = {
  async getSeoDetails(req, res) {
    const lang = (req.query.lang || 'en').trim();
    try {
      const { slug } = req.params;
      const seoDetails = await prisma.page.findFirst({
        where: { slug },
        include: {
          pageTranslation: true,
        },
      });

      if (!seoDetails) return res.status(404).json({});

      const seoDetailsTrans = findTranslation(seoDetails?.pageTranslation, lang);
      const seoData = {
        id: seoDetails.id,
        ...seoDetailsTrans,
      };

      res.json(seoData);
    } catch (error) {
      console.error('Languages fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Languages' });
    }
  },

  async getLanguages(req, res) {
    try {
      const languages = await prisma.language.findMany();

      if (!languages) return res.status(404).json([]);

      res.json(languages);
    } catch (error) {
      console.error('Languages fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Languages' });
    }
  },

  async getCurrencies(req, res) {
    try {
      const currencies = await prisma.currency.findMany({ where: { status: true } });

      if (!currencies) return res.status(404).json([]);

      res.json(currencies);
    } catch (error) {
      console.error('Currencies fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Currencies' });
    }
  },

  async getFees(req, res) {
    try {
      const fees = await prisma.propertyFees.findFirst();

      if (!fees) return res.status(404).json([]);

      const guestFee = fees.guestFee;
      const hostFee = fees.hostFee;

      res.json({ guestFee, hostFee });
    } catch (error) {
      console.error('Fees fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Fees' });
    }
  },

  async getPopularCity(req, res) {
    try {
      const cities = await prisma.city.findMany({
        where: { popularCity: true },
        orderBy: {
          popularCitySort: 'asc',
        },
      });

      if (!cities) return res.status(404).json([]);

      res.json(cities);
    } catch (error) {
      console.error('Popular Cities fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Popular Cities' });
    }
  },

  async getHelpCategoriesData(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const helpCategories = await prisma.helpCategory.findMany({
        include: {
          helpCategoryTranslation: true,
        },
      });

      if (!helpCategories || helpCategories.length === 0) {
        return res.status(404).json([]);
      }

      const formatted = helpCategories.map((category) => {
        const translations = findTranslation(category.helpCategoryTranslation, lang);
        return {
          id: category.id,
          slug: category.slug,
          title: translations.title,
          translations: translations,
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error('Helps fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Helps' });
    }
  },

  async getHelpsData(req, res) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const lang = (req.query.lang || 'en').trim();

      const helps = await prisma.help.findMany({
        where: {
          helpCategoryId: categoryId,
          status: true,
        },
        include: {
          helpTranslation: true,
          helpCategory: {
            include: {
              helpCategoryTranslation: true,
            },
          },
        },
      });
      console.log('HELPS', helps);

      const formatted = helps.map((help) => {
        const translations = findTranslation(help.helpTranslation, lang);
        const helpCategoryTranslation = findTranslation(help.helpCategory.helpCategoryTranslation, lang);

        const helpCategory = {
          id: help.helpCategory.id,
          slug: help.helpCategory.slug,
          ...helpCategoryTranslation,
        };

        return {
          id: help.id,
          slug: help.slug,
          image: help.image,
          status: help.status,
          createdAt: help.createdAt,
          updatedAt: help.updatedAt,
          helpCategory,
          ...translations,
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error('Helps fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Helps' });
    }
  },

  async getSingleHelpData(req, res) {
    try {
      const { slug } = req.params;
      console.log('SLUG$', slug);
      const lang = (req.query.lang || 'en').trim();

      if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
      }

      const help = await prisma.help.findUnique({
        where: { slug },
        include: {
          helpTranslation: true,
          helpCategory: {
            include: {
              helpCategoryTranslation: true,
            },
          },
        },
      });

      if (!help) {
        return res.status(404).json({});
      }

      const translations = findTranslation(help.helpTranslation, lang);
      const helpCategory = findTranslation(help.helpCategory.helpCategoryTranslation, lang);

      res.json({
        id: help.id,
        slug: help.slug,
        image: help.image,
        status: help.status,
        createdAt: help.createdAt,
        updatedAt: help.updatedAt,
        helpCategory,
        ...translations,
      });
    } catch (error) {
      console.error('Helps fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Helps' });
    }
  },

  async getUser(req, res) {
    try {
      // const id = parseInt(req.params.id);

      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      res.json(user);
    } catch (error) {
      console.error('User fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch User' });
    }
  },

  async getNotifications(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      // Read pagination params (with defaults)
      const { page = 1 } = req.query;
      const limit = 10;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Get total count for pagination
      const totalNotifications = await prisma.notification.count({
        where: { userId: req.user.id },
      });

      const notificationsData = await prisma.notification.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      });
      res.status(200).json({
        data: notificationsData,
        pagination: {
          total: totalNotifications,
          page: Number(page),
          totalPages: Math.ceil(totalNotifications / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Notifications fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Notifications' });
    }
  },

  async notificationsMarkAsRead(req, res) {
    try {
      const userId = req?.user?.id;
      const notifications = await prisma.notification.updateMany({
        where: { userId },
        data: {
          isRead: true,
        },
      });
      res.json(notifications);
    } catch (error) {
      console.error('Notifications Update error:', error);
      res.status(500).json({ error: 'Failed to update notificaitons' });
    }
  },
};
