const { convertDecimals } = require('../../helpers/convertDecimals');
const prisma = require('../../config/prisma');
const { findTranslation } = require('../../helpers/findTranslation');
const { startOfYear, endOfYear, format } = require('date-fns');

module.exports = {
  async getEarningsReportData(req, res) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      // Fetch all confirmed & paid bookings for this year
      const earningsData = await prisma.booking.findMany({
        where: {
          hostId: req.user.id,
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfYear(new Date()),
            lte: endOfYear(new Date()),
          },
        },
        select: {
          createdAt: true,
          totalPrice: true, // adjust to your field name
          currency: true,
        },
      });

      // Group by month
      const monthlyEarnings = Array.from({ length: 12 }, (_, i) => ({
        month: format(new Date(2025, i, 1), 'MMM'),
        total: 0,
      }));

      for (const booking of earningsData) {
        const monthIndex = new Date(booking.createdAt).getMonth();
        monthlyEarnings[monthIndex].total += Number(booking.totalPrice || 0);
      }

      res.status(200).json(monthlyEarnings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch earnings data' });
    }
  },

  async getEarningsData(req, res) {
    const lang = (req.query.lang || 'en').trim();

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
      const totalEarnings = await prisma.booking.count({
        where: { hostId: req.user.id, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' },
      });

      const earnings = await prisma.booking.findMany({
        where: { hostId: req.user.id, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' },
        skip,
        take,
        include: {
          payment: true,
          host: true,
          property: {
            include: {
              propertyImages: true,
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyType: {
                include: {
                  propertyTypeTranslation: true,
                },
              },
            },
          },
          currency: true,
        },
      });

      const earningsData = earnings.map((earningData) => {
        const propertyDesc = findTranslation(earningData?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

        const propertyTypeTranslation = findTranslation(earningData?.property?.propertyType?.propertyTypeTranslation, lang);
        const propertyType = propertyTypeTranslation
          ? {
              id: earningData?.property?.propertyType?.id,
              name: propertyTypeTranslation.name,
            }
          : null;

        return {
          ...earningData,
          property: {
            ...earningData.property,
            propertyDescription: propertyDesc,
            propertyType,
          },
        };
      });

      res.status(200).json({
        data: earningsData,
        pagination: {
          total: totalEarnings,
          page: Number(page),
          totalPages: Math.ceil(totalEarnings / Number(limit)),
        },
      });
    } catch (error) {}
  },

  async getPayoutsData(req, res) {
    const lang = (req.query.lang || 'en').trim();

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
      const totalPayouts = await prisma.booking.count({
        where: { hostId: req.user.id, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' },
      });

      const payouts = await prisma.booking.findMany({
        where: { hostId: req.user.id, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' },
        skip,
        take,
        include: {
          payment: {
            where: {
              status: 'PAID',
            },
          },
          property: {
            include: {
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
            },
          },
          currency: true,
          payouts: {
            include: {
              user: true,
              payoutMethod: true,
            },
          },
        },
      });

      const payoutsData = payouts.map((earningData) => {
        const propertyDesc = findTranslation(earningData?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

        return {
          ...earningData,
          property: {
            ...earningData.property,
            propertyDescription: propertyDesc,
          },
        };
      });

      res.status(200).json({
        data: payoutsData,
        pagination: {
          total: totalPayouts,
          page: Number(page),
          totalPages: Math.ceil(totalPayouts / Number(limit)),
        },
      });
    } catch (error) {}
  },

  async getTransactionDetails(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { confirmationCode } = req.params;

      if (!confirmationCode) return res.status(400).json({ error: 'Booking is required' });

      const booking = await prisma.booking.findFirst({
        where: { confirmationCode: confirmationCode },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          guests: true,
          totalNight: true,
          cleaningCharge: true,
          extraGuestCharge: true,
          totalGuestFee: true,
          totalHostFee: true,
          totalPrice: true,
          totalDiscount: true,
          discountType: true,
          bookingStatus: true,
          bookingType: true,
          paymentStatus: true,
          payoutStatus: true,
          confirmationCode: true,
          confirmedAt: true,
          acceptedAt: true,
          expiredAt: true,
          declinedAt: true,
          
          declinedBy: true,
          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          guest: {
            select: {
              id: true,
              name: true,
              dob: true,
              email: true,
              fcmToken: true,
              image: true,
              phone: true,
              isHost: true,
              hostAt: true,
              isVerified: true,
            },
          },
          payment: true,
          property: {
            select: {
              id: true,
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    where: { locale: lang },
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          currency: true,
          payouts: {
            select: {
              payoutAmount: true,
              payoutStatus: true,
              payoutDate: true,
              currency: true,
              user: true,
              payoutMethod: true,
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const transactionDetails = {
        ...booking,
        property: {
          ...booking.property,
          name: booking.property.propertyDescription.propertyDescriptionTranslation[0].name,
        },
      };

      res.status(200).json(convertDecimals(transactionDetails));
    } catch (error) {}
  },
};
