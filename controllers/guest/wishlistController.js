const prisma = require('../../config/prisma');
const { startOfDay, endOfDay, format } = require('date-fns');
const { findTranslation } = require('../../helpers/findTranslation');
const logActivity = require('../../helpers/logActivity');

module.exports = {
  async addRecentlyViewed(req, res) {
    const propertyId = req.body.propertyId;
    const userId = req.user.id;

    try {
      // Otherwise create new one
      let recentlyViewed = await prisma.recentlyViewed.findFirst({
        where: { userId, propertyId },
      });

      if (recentlyViewed) {
        recentlyViewed = await prisma.recentlyViewed.update({
          where: { id: recentlyViewed.id },
          data: { updatedAt: new Date() },
        });
      } else {
        recentlyViewed = await prisma.recentlyViewed.create({
          data: { userId, propertyId },
        });
      }

      res.json(recentlyViewed);
    } catch (error) {
      console.error('Recently Viewed fetch error:', error);
      res.status(500).json({ error: 'Failed to add Recently Viewed' });
    }
  },

  async getRecentlyViewed(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const lang = (req.query.lang || 'en').trim();
      const recentlyViewed = await prisma.recentlyViewed.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          property: {
            include: {
              propertyAddress: {
                include: {
                  country: true,
                  state: true,
                  city: true,
                },
              },
              propertyType: {
                include: {
                  propertyTypeTranslation: true,
                },
              },
              spaceType: {
                include: {
                  spaceTypeTranslation: true,
                },
              },
              amenities: {
                include: {
                  amenitiesTranslation: true,
                },
              },
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyPrice: {
                include: {
                  currency: true,
                },
              },
              cancellationPolicy: true,
              propertyImages: { orderBy: { serial: 'asc' } },
              propertyDates: true,
              reviews: true,
            },
          },
        },
      });

      const propertiesViewedData = recentlyViewed
        .map((recentViewed) => {
          const propertyDesc = findTranslation(recentViewed?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
          const propertyType = findTranslation(recentViewed?.property?.propertyType?.propertyTypeTranslation, lang);
          const spaceType = findTranslation(recentViewed?.property?.spaceType?.spaceTypeTranslation, lang);

          const amenities = recentViewed?.property?.amenities?.map((amenity) => {
            const trans = findTranslation(amenity?.amenitiesTranslation, lang);
            return {
              id: amenity.id,
              icon: amenity.icon,
              name: trans.name,
              description: trans.description,
            };
          });

          return {
            id: recentViewed?.property?.id,
            userId: recentViewed?.property?.userId,
            slug: recentViewed?.property?.slug,
            accommodates: recentViewed?.property?.accommodates,
            bedrooms: recentViewed?.property?.bedrooms,
            bedrooms_data: recentViewed?.property?.bedrooms_data,
            bathrooms: recentViewed?.property?.bathrooms,
            amenities: amenities,
            propertyTypeId: recentViewed?.property?.propertyTypeId,
            propertyType: propertyType,
            spaceTypeId: recentViewed?.property?.spaceTypeId,
            spaceType: spaceType,
            bookType: recentViewed?.property?.bookType,
            bookingType: recentViewed?.property?.bookingType,
            cancellationPolicyId: recentViewed?.property?.cancellationPolicyId,
            cancellationPolicy: recentViewed?.property?.cancellationPolicy,
            checkInAfter: recentViewed?.property?.checkInAfter,
            checkOutBefore: recentViewed?.property?.checkOutBefore,
            propertyAddress: recentViewed?.property?.propertyAddress,
            propertyDates: recentViewed?.property?.propertyDates,
            propertyDescription: propertyDesc,
            propertyImages: recentViewed?.property?.propertyImages,
            propertyPrice: recentViewed?.property?.propertyPrice,

            propertySteps: recentViewed?.property?.propertySteps,
            reviews: recentViewed?.property?.reviews,
            recommended: recentViewed?.property?.recommended,
            status: recentViewed?.property?.status,
            createdAt: recentViewed?.property?.createdAt,
            updatedAt: recentViewed?.updatedAt,
          };
        })
        .filter(Boolean);

      // Group messages by date
      const grouped = {};
      propertiesViewedData.forEach((viewedData) => {
        const dateKey = format(viewedData.updatedAt, 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(viewedData);
      });

      res.json(grouped);
    } catch (error) {
      console.error('Recently Viewed fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Recently Viewed' });
    }
  },

  async addWishlist(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const lang = (req.query.lang || 'en').trim();
      const propertyId = req.params.propertyId;
      const userId = req.user.id;
      const wishlist = await prisma.wishlist.create({
        data: {
          user: { connect: { id: userId } },
          property: { connect: { id: propertyId } },
        },
        select: {
          property: {
            select: {
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    where: {
                      locale: lang,
                    },
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Property added to wishlist', {
        details: `${req.user.name} added property "${wishlist?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}" (ID: ${propertyId}) to wishlist.`,
      });

      res.json(wishlist);
    } catch (error) {
      console.error('Wishlist create error:', error);
      res.status(500).json({ error: 'Failed to create Wishlist' });
    }
  },

  async removeWishlist(req, res) {
    try {
      const propertyId = req.params.propertyId;

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;

      await prisma.wishlist.deleteMany({
        where: { userId, propertyId },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Property removed from wishlist', {
        details: `${req.user.name} removed (property ID: ${propertyId}) from wishlist.`,
      });

      res.json('');
    } catch (error) {
      console.error('Wishlist delete error:', error);
      res.status(500).json({ error: 'Failed to delete Wishlist' });
    }
  },

  async getWishlist(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const lang = (req.query.lang || 'en').trim();
      const wishlists = await prisma.wishlist.findMany({
        where: { userId: req.user.id },

        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          property: {
            include: {
              propertyAddress: {
                include: {
                  country: true,
                  state: true,
                  city: true,
                },
              },
              propertyType: {
                include: {
                  propertyTypeTranslation: true,
                },
              },
              spaceType: {
                include: {
                  spaceTypeTranslation: true,
                },
              },
              amenities: {
                include: {
                  amenitiesTranslation: true,
                },
              },
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyPrice: {
                include: {
                  currency: true,
                },
              },
              cancellationPolicy: true,
              propertyImages: { orderBy: { serial: 'asc' } },
              propertyDates: true,
              reviews: true,
            },
          },
        },
      });

      const wishlistsData = wishlists
        .map((wishlist) => {
          const propertyDesc = findTranslation(wishlist?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
          const propertyType = findTranslation(wishlist?.property?.propertyType?.propertyTypeTranslation, lang);
          const spaceType = findTranslation(wishlist?.property?.spaceType?.spaceTypeTranslation, lang);

          const amenities = wishlist?.property?.amenities?.map((amenity) => {
            const trans = findTranslation(amenity?.amenitiesTranslation, lang);
            return {
              id: amenity.id,
              icon: amenity.icon,
              name: trans.name,
              description: trans.description,
            };
          });

          return {
            id: wishlist?.property?.id,
            userId: wishlist?.property?.userId,
            slug: wishlist?.property?.slug,
            accommodates: wishlist?.property?.accommodates,
            bedrooms: wishlist?.property?.bedrooms,
            bedrooms_data: wishlist?.property?.bedrooms_data,
            bathrooms: wishlist?.property?.bathrooms,
            amenities: amenities,
            propertyTypeId: wishlist?.property?.propertyTypeId,
            propertyType: propertyType,
            spaceTypeId: wishlist?.property?.spaceTypeId,
            spaceType: spaceType,
            bookType: wishlist?.property?.bookType,
            bookingType: wishlist?.property?.bookingType,
            cancellationPolicyId: wishlist?.property?.cancellationPolicyId,
            cancellationPolicy: wishlist?.property?.cancellationPolicy,
            checkInAfter: wishlist?.property?.checkInAfter,
            checkOutBefore: wishlist?.property?.checkOutBefore,
            propertyAddress: wishlist?.property?.propertyAddress,
            propertyDates: wishlist?.property?.propertyDates,
            propertyDescription: propertyDesc,
            propertyImages: wishlist?.property?.propertyImages,
            propertyPrice: wishlist?.property?.propertyPrice,

            propertySteps: wishlist?.property?.propertySteps,
            reviews: wishlist?.property?.reviews,
            recommended: wishlist?.property?.recommended,
            status: wishlist?.property?.status,
            createdAt: wishlist?.property?.createdAt,
            updatedAt: wishlist?.updatedAt,
          };
        })
        .filter(Boolean);

      res.json(wishlistsData);
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Wishlist' });
    }
  },
};
