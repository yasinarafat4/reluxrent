const prisma = require('../../config/prisma');
const { processImage, saveBase64Image } = require('../../helpers/uploadFileToStorage');
const { findTranslation } = require('../../helpers/findTranslation');
const { convertDecimals } = require('../../helpers/convertDecimals');

const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, amenitiesId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// List all users
exports.getBookings = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const hostId = req.query.hostId;
    const guestId = req.query.guestId;
    const bookingStatus = req.query.bookingStatus;
    const q = req.query.q ? req.query.q : '';
    const paymentStatus = req.query.paymentStatus;
    const status = req.query.status;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let filter = {};
    if (hostId) {
      filter.hostId = hostId;
    }
    if (guestId) {
      filter.guestId = guestId;
    }
    if (bookingStatus) {
      filter.bookingStatus = bookingStatus;
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    if (ids.length > 0) {
      filter = { id: { in: ids.map((id) => id) } }; // Handle multiple IDs or a single ID
    }
    if (q) {
      filter = {
        ...filter,
        OR: [
          {
            amenitiesTranslation: {
              some: {
                name: { contains: q },
              },
            },
          },
          {
            amenitiesTranslation: {
              some: {
                description: { contains: q },
              },
            },
          },
        ],
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
      include: {
        currency: true,
        host: true,
        guest: true,
        reviews: true,
        payment: true,
        property: {
          include: {
            propertyDescription: {
              include: {
                propertyDescriptionTranslation: true,
              },
            },
          },
        },
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.booking.findMany(queryOptions), prisma.booking.count({ where: filter })]);
    res.setHeader('Content-Range', `amenities ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((booking) => {
      console.log('booking$$', booking);
      return {
        id: booking.id,
        propertyId: booking.propertyId,
        currencyId: booking.currencyId,
        host: booking.host,
        guest: booking.guest,
        startDate: booking.startDate,
        endDate: booking.endDate,
        guests: booking.guests,
        totalNight: booking.totalNight,
        cleaningCharge: booking.cleaningCharge,
        extraGuestCharge: booking.extraGuestCharge,
        totalGuestFee: booking.totalGuestFee,
        totalHostFee: booking.totalHostFee,
        totalPrice: booking.totalPrice,
        grandTotal: booking.grandTotal,
        currency: booking.currency,
        totalDiscount: booking.totalDiscount,
        discountType: booking.discountType,
        bookingStatus: booking.bookingStatus,
        bookingType: booking.bookingType,
        paymentStatus: booking.paymentStatus,
        payoutStatus: booking.payoutStatus,
        confirmationCode: booking.confirmationCode,
        acceptedAt: booking.acceptedAt,
        expiredAt: booking.expiredAt,
        declinedAt: booking.declinedAt,
        declinedBy: booking.declinedBy,
        confirmedAt: booking.confirmedAt,
        createdAt: booking.createdAt,
      };
    });

    res.json({
      data: convertDecimals(formatted),
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
};

// Get single user
exports.getBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        currency: true,
        host: true,
        guest: true,
        reviews: true,
        payment: true,
        property: {
          include: {
            propertyDescription: {
              include: {
                propertyDescriptionTranslation: true,
              },
            },
          },
        },
      },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json(
      convertDecimals({
        id: booking.id,
        propertyId: booking.propertyId,
        currencyId: booking.currencyId,
        host: booking.host,
        guest: booking.guest,
        startDate: booking.startDate,
        endDate: booking.endDate,
        guests: booking.guests,
        totalNight: booking.totalNight,
        cleaningCharge: booking.cleaningCharge,
        extraGuestCharge: booking.extraGuestCharge,
        totalGuestFee: booking.totalGuestFee,
        totalHostFee: booking.totalHostFee,
        totalPrice: booking.totalPrice,
        grandTotal: booking.grandTotal,
        currency: booking.currency,
        totalDiscount: booking.totalDiscount,
        discountType: booking.discountType,
        bookingStatus: booking.bookingStatus,
        bookingType: booking.bookingType,
        paymentStatus: booking.paymentStatus,
        confirmationCode: booking.confirmationCode,
        acceptedAt: booking.acceptedAt,
        expiredAt: booking.expiredAt,
        declinedAt: booking.declinedAt,
        declinedBy: booking.declinedBy,
        confirmedAt: booking.confirmedAt,
        createdAt: booking.createdAt,
      }),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Booking' });
  }
};

// Create user
exports.createBooking = async (req, res) => {
  try {
    const { translations, icon, order, status, amenitiesTypeId } = req.body;
    const processedIcon = await processImage(icon);

    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        name: fields.name,
        description: fields.description,
      })),
    );
    const amenity = await prisma.amenities.create({
      data: {
        icon: processedIcon,
        order,
        status,
        amenitiesType: {
          connect: { id: amenitiesTypeId },
        },
        amenitiesTranslation: {
          create: processedTranslations,
        },
      },
    });

    res.status(201).json(amenity);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Currency' });
  }
};

// Update user
exports.updateBooking = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { translations, icon, order, status, amenitiesTypeId } = req.body;

    res.json();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Amenity' });
  }
};

// Delete user
exports.deleteBooking = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.booking.delete({ where: { id } });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Booking' });
  }
};
