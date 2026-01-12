const prisma = require('../../config/prisma');
const { format } = require('date-fns');
const logActivity = require('../../helpers/logActivity');
const { convertDecimals } = require('../../helpers/convertDecimals');
const { getGuestStatus } = require('../../helpers/getGuestStatus');
const { checkAvailability } = require('../../helpers/checkAvailability');
const { formatGuestSummary } = require('../../helpers/formatGuestSummary');
const { sendUserNotification } = require('../../helpers/notificationService');
const { formatPrice, convertAndFormatBookedCurrency } = require('../../helpers/formatPrice');
const { sendEmailWithRetry } = require('../../helpers/sendEmailWithRetry');
const { findTranslation } = require('../../helpers/findTranslation');

module.exports = {
  async getBookings(req, res) {
    const lang = (req.query.lang || 'en').trim();
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      // Read pagination params (with defaults)
      const { page = 1, status, search, startDate, endDate } = req.query;
      const limit = 10;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const normalizedStatus = !status || status === 'undefined' || status === 'All' ? null : status;
      const normalizedSearch = search === '' || search === 'undefined' ? null : search;
      const normalizedStartDate = startDate === 'undefined' ? null : startDate;
      const normalizedEndDate = endDate === 'undefined' ? null : endDate;

      const whereClause = { guestId: req.user.id };

      // Search
      if (normalizedSearch) {
        whereClause.OR = [
          { confirmationCode: { contains: normalizedSearch } },
          // search by related model fields (guest)
          {
            host: {
              name: { contains: normalizedSearch },
            },
          },
        ];
      }

      // Start & End date
      if (normalizedStartDate && normalizedEndDate) {
        const startDate1 = parse(normalizedStartDate, 'MM/dd/yyyy', new Date());
        const endDate1 = parse(normalizedEndDate, 'MM/dd/yyyy', new Date());
        if (!isNaN(startDate1) && !isNaN(endDate1)) {
          whereClause.createdAt = {
            gte: startOfDay(startDate1),
            lte: endOfDay(endDate1),
          };
        }
      }

      // Status
      if (normalizedStatus) {
        whereClause.bookingStatus = normalizedStatus;
      }

      // Get total count for pagination
      const totalBookings = await prisma.booking.count({
        where: whereClause,
      });

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take,

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
          grandTotal: true,
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
          createdAt: true,
          declinedBy: true,
          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          property: {
            select: {
              id: true,
              slug: true,
              accommodates: true,
              bookType: true,
              bookingType: true,
              minimumStay: true,
              bedrooms: true,
              bedrooms_data: true,
              bathrooms: true,
              status: true,
              isApproved: true,
              propertyType: {
                select: {
                  id: true,
                  icon: true,
                  propertyTypeTranslation: {
                    where: { locale: lang },
                    select: {
                      id: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
              spaceType: {
                select: {
                  id: true,
                  icon: true,
                  spaceTypeTranslation: {
                    where: { locale: lang },
                    select: {
                      id: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    where: { locale: lang },
                    select: {
                      name: true,
                      description: true,
                      aboutPlace: true,
                      placeIsGreatFor: true,
                      guestCanAccess: true,
                      interactionGuests: true,
                      other: true,
                      aboutNeighborhood: true,
                      getAround: true,
                    },
                  },
                },
              },
              propertyAddress: {
                select: {
                  addressLine1: true,
                  addressLine2: true,
                  latitude: true,
                  longitude: true,
                  postal_code: true,
                  country: { select: { id: true, name: true } },
                  state: { select: { id: true, name: true } },
                  city: { select: { id: true, name: true, latitude: true, longitude: true } },
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },

              propertyPrice: {
                select: {
                  price: true,
                  weeklyDiscount: true,
                  monthlyDiscount: true,
                  cleaningFee: true,
                  guestAfter: true,
                  guestAfterFee: true,
                  securityFee: true,
                  weekendPrice: true,
                  currency: {
                    select: {
                      id: true,
                      code: true,
                      name: true,
                      symbol: true,
                      decimalPlaces: true,
                      decimalSeparator: true,
                      thousandSeparator: true,
                      exchangeRate: true,
                    },
                  },
                },
              },
              propertyDates: true,
              host: {
                select: {
                  id: true,
                  name: true,
                  dob: true,
                  email: true,
                  fcmToken: true,
                  image: true,
                  phone: true,
                  about: true,
                  dreamPlace: true,
                  funFact: true,
                  myWork: true,
                  obsessedWith: true,
                  school: true,
                  address: true,
                  languages: true,
                  isHost: true,
                  hostAt: true,
                  isVerified: true,
                },
              },
              bookings: {
                where: { bookingStatus: 'CONFIRMED' },
                select: {
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
                  bookingDates: {
                    select: {
                      date: true,
                      price: true,
                    },
                  },
                },
              },
              reviews: {
                select: {
                  id: true,
                  message: true,
                  secretFeedback: true,
                  improveMessage: true,
                  publicResponse: true,
                  publicResponseDate: true,
                  overallRating: true,
                  ratings: true,
                  reviewSender: true,
                },
              },
            },
          },
          bookingDates: {
            select: {
              date: true,
              price: true,
            },
          },
          specialOffer: {
            where: {
              status: 'PENDING',
            },
          },
          reviews: true,
          guest: {
            select: {
              id: true,
              name: true,
              dob: true,
              email: true,
              fcmToken: true,
              image: true,
              phone: true,
              about: true,
              dreamPlace: true,
              funFact: true,
              myWork: true,
              obsessedWith: true,
              school: true,
              address: true,
              languages: true,
              isHost: true,
              hostAt: true,
              createdAt: true,
              isVerified: true,
              reviewsReceived: {
                select: {
                  id: true,
                  message: true,
                  secretFeedback: true,
                  improveMessage: true,
                  publicResponse: true,
                  publicResponseDate: true,
                  overallRating: true,
                  ratings: true,
                  reviewSender: true,
                  createdAt: true,
                },
              },
            },
          },
          host: {
            select: {
              id: true,
              name: true,
              dob: true,
              email: true,
              fcmToken: true,
              image: true,
              phone: true,
              about: true,
              dreamPlace: true,
              funFact: true,
              myWork: true,
              obsessedWith: true,
              school: true,
              address: true,
              languages: true,
              isHost: true,
              hostAt: true,
              createdAt: true,
              isVerified: true,
              reviewsReceived: {
                select: {
                  id: true,
                  message: true,
                  secretFeedback: true,
                  improveMessage: true,
                  publicResponse: true,
                  publicResponseDate: true,
                  overallRating: true,
                  ratings: true,
                  reviewSender: true,
                  createdAt: true,
                },
              },
            },
          },
          currency: {
            select: {
              id: true,
              code: true,
              name: true,
              symbol: true,
              decimalPlaces: true,
              decimalSeparator: true,
              thousandSeparator: true,
              exchangeRate: true,
            },
          },
          payment: true,
          cancellationPolicy: {
            select: {
              beforeDays: true,
              beforeDayPriorRefund: true,
              afterDayPriorRefund: true,
              cancellationPolicyTranslation: {
                where: { locale: lang },
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },
          conversationBooking: true,
        },
      });

      const bookingData = await Promise.all(
        bookings.map(async (booking) => {
          // Check availability using last booking
          const { isAvailable } = await checkAvailability(booking);

          // ---------------- Guest Status ----------------
          const { guestStatus, reviewDeadline, canReview, reviewFromGuest, reviewFromHost } = await getGuestStatus(booking, req.user, isAvailable);

          return {
            ...booking,
            guestStatus,
            conversationBooking: { conversationId: booking.conversationBooking[0]?.conversationId },
            property: {
              ...booking.property,

              propertyType: {
                id: booking.property.propertyType.id,
                icon: booking.property.propertyType.icon,
                name: booking.property.propertyType.propertyTypeTranslation[0].name,
                description: booking.property.propertyType.propertyTypeTranslation[0].description,
              },
              spaceType: {
                id: booking.property.spaceType.id,
                icon: booking.property.spaceType.icon,
                name: booking.property.spaceType.spaceTypeTranslation[0].name,
                description: booking.property.spaceType.spaceTypeTranslation[0].description,
              },

              propertyDescription: {
                name: booking.property.propertyDescription.propertyDescriptionTranslation[0].name,
                description: booking.property.propertyDescription.propertyDescriptionTranslation[0].description,
                aboutPlace: booking.property.propertyDescription.propertyDescriptionTranslation[0].aboutPlace,
                placeIsGreatFor: booking.property.propertyDescription.propertyDescriptionTranslation[0].placeIsGreatFor,
                guestCanAccess: booking.property.propertyDescription.propertyDescriptionTranslation[0].guestCanAccess,
                interactionGuests: booking.property.propertyDescription.propertyDescriptionTranslation[0].interactionGuests,
                other: booking.property.propertyDescription.propertyDescriptionTranslation[0].other,
                aboutNeighborhood: booking.property.propertyDescription.propertyDescriptionTranslation[0].aboutNeighborhood,
                getAround: booking.property.propertyDescription.propertyDescriptionTranslation[0].getAround,
              },
            },
          };
        }),
      );

      res.status(200).json({
        data: bookingData,
        pagination: {
          total: totalBookings,
          page: Number(page),
          totalPages: Math.ceil(totalBookings / Number(limit)),
        },
      });
    } catch (error) {
      console.log('Guest Booking Error', error);
    }
  },

  async getBookingDetails(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bookingId = req.params.bookingId;
      if (!bookingId) {
        return res.status(400).json({ error: 'Booking is required' });
      }

      const booking = await prisma.booking.findFirst({
        where: { id: bookingId },
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
          grandTotal: true,
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
          createdAt: true,
          declinedAt: true,
          declinedBy: true,

          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          property: {
            select: {
              id: true,
              slug: true,
              accommodates: true,
              bookType: true,
              bookingType: true,
              minimumStay: true,
              bedrooms: true,
              bedrooms_data: true,
              bathrooms: true,
              status: true,
              isApproved: true,
              propertyType: {
                select: {
                  id: true,
                  icon: true,
                  propertyTypeTranslation: {
                    where: { locale: lang },
                    select: {
                      id: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
              spaceType: {
                select: {
                  id: true,
                  icon: true,
                  spaceTypeTranslation: {
                    where: { locale: lang },
                    select: {
                      id: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    select: {
                      locale: true,
                      name: true,
                    },
                  },
                },
              },
              propertyAddress: {
                select: {
                  addressLine1: true,
                  addressLine2: true,
                  latitude: true,
                  longitude: true,
                  postal_code: true,
                  country: { select: { id: true, name: true } },
                  state: { select: { id: true, name: true } },
                  city: { select: { id: true, name: true, latitude: true, longitude: true } },
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },

              propertyPrice: {
                select: {
                  price: true,
                  weeklyDiscount: true,
                  monthlyDiscount: true,
                  cleaningFee: true,
                  guestAfter: true,
                  guestAfterFee: true,
                  securityFee: true,
                  weekendPrice: true,
                  currency: {
                    select: {
                      id: true,
                      code: true,
                      name: true,
                      symbol: true,
                      decimalPlaces: true,
                      decimalSeparator: true,
                      thousandSeparator: true,
                      exchangeRate: true,
                    },
                  },
                },
              },
              propertyDates: true,
              host: {
                select: {
                  id: true,
                  name: true,
                  dob: true,
                  email: true,
                  fcmToken: true,
                  image: true,
                  phone: true,
                  about: true,
                  dreamPlace: true,
                  funFact: true,
                  myWork: true,
                  obsessedWith: true,
                  school: true,
                  address: true,
                  languages: true,
                  isHost: true,
                  hostAt: true,
                  isVerified: true,
                },
              },
              bookings: {
                where: { bookingStatus: 'CONFIRMED' },
                select: {
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
                  bookingDates: {
                    select: {
                      date: true,
                      price: true,
                    },
                  },
                },
              },
              reviews: {
                select: {
                  id: true,
                  message: true,
                  secretFeedback: true,
                  improveMessage: true,
                  publicResponse: true,
                  publicResponseDate: true,
                  overallRating: true,
                  ratings: true,
                  reviewSender: true,
                },
              },
            },
          },
          bookingDates: {
            select: {
              date: true,
              price: true,
            },
          },
          specialOffer: {
            where: {
              status: 'PENDING',
            },
          },
          reviews: true,
          guest: {
            select: {
              id: true,
              name: true,
              dob: true,
              email: true,
              fcmToken: true,
              image: true,
              phone: true,
              about: true,
              dreamPlace: true,
              funFact: true,
              myWork: true,
              obsessedWith: true,
              school: true,
              address: true,
              languages: true,
              isHost: true,
              hostAt: true,
              createdAt: true,
              isVerified: true,
              reviewsReceived: {
                select: {
                  id: true,
                  message: true,
                  secretFeedback: true,
                  improveMessage: true,
                  publicResponse: true,
                  publicResponseDate: true,
                  overallRating: true,
                  ratings: true,
                  reviewSender: true,
                  createdAt: true,
                },
              },
            },
          },
          host: {
            select: {
              id: true,
              name: true,
              dob: true,
              email: true,
              fcmToken: true,
              image: true,
              phone: true,
              about: true,
              dreamPlace: true,
              funFact: true,
              myWork: true,
              obsessedWith: true,
              school: true,
              address: true,
              languages: true,
              isHost: true,
              hostAt: true,
              createdAt: true,
              isVerified: true,
              reviewsReceived: {
                select: {
                  id: true,
                  message: true,
                  secretFeedback: true,
                  improveMessage: true,
                  publicResponse: true,
                  publicResponseDate: true,
                  overallRating: true,
                  ratings: true,
                  reviewSender: true,
                  createdAt: true,
                },
              },
            },
          },
          currency: {
            select: {
              id: true,
              code: true,
              name: true,
              symbol: true,
              decimalPlaces: true,
              decimalSeparator: true,
              thousandSeparator: true,
              exchangeRate: true,
            },
          },
          payment: true,
          cancellationPolicy: {
            select: {
              cancellationPolicyTranslation: {
                select: {
                  locale: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          conversationBooking: true,
        },
      });
      console.log('$booking$', booking?.property?.propertyDescription?.propertyDescriptionTranslation);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check availability using last booking
      const { isAvailable } = await checkAvailability(booking);
      console.log('i$sAvailable', isAvailable);
      // ---------------- Guest Status ----------------
      const { guestStatus, reviewDeadline, canReview, reviewFromGuest, reviewFromHost } = await getGuestStatus(booking, req.user, isAvailable);

      const translatedDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
      console.log('$translatedDesc$', translatedDesc?.name);
      const translatedCancellationPolicy = findTranslation(booking?.cancellationPolicy?.cancellationPolicyTranslation, lang);
      const translatedPropertyTypes = findTranslation(booking?.property?.propertyType?.propertyTypeTranslation, lang);
      const translatedSpaceTypes = findTranslation(booking?.property?.spaceType?.spaceTypeTranslation, lang);

      const lastBookingData = {
        ...booking,
        property: {
          id: booking?.property?.id,
          bookType: booking?.property?.bookType,
          bookingType: booking?.property?.bookingType,
          accommodates: booking?.property?.accommodates,
          propertyAddress: booking?.property?.propertyAddress,
          propertyType: {
            id: booking?.property?.propertyType?.id,
            name: translatedPropertyTypes?.name,
          },
          spaceType: {
            id: booking?.property?.spaceType?.id,
            name: translatedSpaceTypes?.name,
          },
          propertyDescription: {
            name: translatedDesc?.name,
          },
          propertyImages: booking?.property?.propertyImages,
          propertyPrice: booking?.property?.propertyPrice,
          isAvailable,
        },
        cancellationPolicy: {
          name: translatedCancellationPolicy?.name,
          description: translatedCancellationPolicy?.description,
        },
      };
      res.status(200).json(
        convertDecimals({
          lastBooking: lastBookingData,
          conversationId: booking.conversationBooking[0]?.conversationId,
          conversationBooking: { id: booking.conversationBooking[0]?.id, conversationId: booking.conversationBooking[0]?.conversationId },
          guestStatus,
          canReview,
          reviewFromHost,
          reviewDeadline,
        }),
      );
    } catch (error) {
      console.error('getBookingDetails error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async propertyBooking(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const lang = (req.query.lang || 'en').trim();
    const {
      propertyId,
      currencyId,
      hostId,
      startDate,
      endDate,
      guests,
      totalNight,
      discountType,
      totalPrice,
      exchangeRateToBase,
      exchangeRatePropertyToBase,
      totalDiscount,
      totalGuestFee,
      totalHostFee,
      cleaningCharge,
      extraGuestCharge,
      bookingType,
      cancellationPolicyId,
      nights,
    } = req.body;

    try {
      if (hostId === req.user.id) {
        return res.status(400).json({
          error: "You can't book your own property.",
        });
      }

      if (req.user.isBanned) {
        return res.status(400).json({
          error: 'Your account has been suspended. Please contact support for assistance.',
        });
      }

      const propertyHost = await prisma.user.findFirst({
        where: { id: hostId },
      });

      if (propertyHost.isBanned || !propertyHost.isVerified) {
        return res.status(400).json({
          error: "This listing is currently unavailable as the host's account is not verified or has been restricted.",
        });
      }

      const property = await prisma.property.findFirst({
        where: { id: propertyId },
        include: {
          host: true,
        },
      });

      console.log('Property', property);

      if (!property.isApproved || property.status === 'Unlisted') {
        return res.status(400).json({
          error: 'This listing is not available for booking at the moment.',
        });
      }

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          propertyId,
          bookingStatus: 'CONFIRMED',
          bookingDates: {
            some: {
              date: {
                in: nights.map((n) => new Date(n.date)),
              },
            },
          },
        },
        include: {
          bookingDates: true,
        },
      });

      if (conflictingBooking) {
        return res.status(400).json({
          error: 'Some Selected dates are already booked for this property',
          conflictingBooking,
        });
      }

      const booking = await prisma.booking.create({
        data: {
          property: {
            connect: { id: propertyId },
          },
          currency: {
            connect: { id: currencyId },
          },
          host: {
            connect: { id: hostId },
          },
          guest: {
            connect: { id: req.user.id },
          },
          startDate,
          endDate,
          guests,
          totalNight,
          discountType,
          totalPrice,
          totalDiscount,
          totalGuestFee,
          totalHostFee,
          cleaningCharge,
          extraGuestCharge,
          bookingType,
          exchangeRateToBase,
          exchangeRatePropertyToBase,
          grandTotal: totalPrice + totalGuestFee + cleaningCharge - totalDiscount,
          cancellationPolicy: {
            connect: { id: cancellationPolicyId },
          },
          bookingDates: {
            create: nights.map((n) => ({
              date: new Date(n.date),
              price: n.price,
            })),
          },
        },
        select: {
          id: true,
          totalPrice: true,
          startDate: true,
          endDate: true,
          guests: true,
          totalNight: true,
          cleaningCharge: true,
          extraGuestCharge: true,
          totalGuestFee: true,
          totalHostFee: true,
          totalDiscount: true,
          discountType: true,
          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          property: {
            select: {
              id: true,
              cancellationPolicyId: true,
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    where: { locale: lang },
                    select: { name: true },
                  },
                },
              },
            },
          },
          guest: true,
          currency: true,
          bookingDates: true,
        },
      });
      console.log('Booking', booking);
      // Activity log
      await logActivity(req, req.user.id, 'Booking Created', {
        details: `Booked "${booking?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}" (Property ID: ${propertyId}) for ${totalNight} night(s) from ${startDate} to ${endDate}. Total price: ${totalPrice} ${booking.currency?.code}.`,
      });

      res.status(200).json({ message: 'Confirm Booking', booking });
    } catch (error) {
      console.error('Confirm Booking error:', error);
      res.status(500).json({ error: 'Failed to Confirm Booking' });
    }
  },

  async propertyInquiry(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const lang = (req.query.lang || 'en').trim();
    const {
      propertyId,
      currencyId,
      hostId,
      startDate,
      endDate,
      guests,
      totalNight,
      discountType,
      totalPrice,
      exchangeRateToBase,
      exchangeRatePropertyToBase,
      totalDiscount,
      totalGuestFee,
      totalHostFee,
      cleaningCharge,
      extraGuestCharge,
      bookingType,
      cancellationPolicyId,
      nights,
      message,
    } = req.body;

    try {
      if (hostId === req.user.id) {
        return res.status(400).json({
          error: "You can't book your own property.",
        });
      }

      if (req.user.isBanned) {
        return res.status(400).json({
          error: 'Your account has been suspended. Please contact support for assistance.',
        });
      }

      const propertyHost = await prisma.user.findFirst({
        where: { id: hostId },
      });

      if (propertyHost.isBanned || !propertyHost.isVerified) {
        return res.status(400).json({
          error: "This listing is currently unavailable as the host's account is not verified or has been restricted.",
        });
      }

      const property = await prisma.property.findFirst({
        where: { id: propertyId },
      });

      if (!property.isApproved || property.status === 'Unlisted') {
        return res.status(400).json({
          error: 'This listing is not available for booking at the moment.',
        });
      }

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          propertyId,
          bookingStatus: 'CONFIRMED',
          bookingDates: {
            some: {
              date: {
                in: nights.map((n) => new Date(n.date)),
              },
            },
          },
        },
        include: {
          bookingDates: true,
        },
      });

      if (conflictingBooking) {
        return res.status(400).json({
          error: 'Some Selected dates are already booked for this property',
          conflictingBooking,
        });
      }

      const inquiry = await prisma.booking.create({
        data: {
          property: { connect: { id: propertyId } },
          currency: { connect: { id: currencyId } },
          host: { connect: { id: hostId } },
          guest: { connect: { id: req.user.id } },
          startDate,
          endDate,
          guests,
          totalNight,
          discountType,
          totalPrice,
          exchangeRateToBase,
          exchangeRatePropertyToBase,
          totalDiscount,
          totalGuestFee,
          totalHostFee,
          cleaningCharge,
          extraGuestCharge,
          bookingType,
          grandTotal: totalPrice + totalGuestFee + cleaningCharge - totalDiscount,
          ...(cancellationPolicyId && {
            cancellationPolicy: {
              connect: { id: cancellationPolicyId },
            },
          }),
        },
        select: {
          id: true,
          totalPrice: true,
          startDate: true,
          endDate: true,
          guests: true,
          totalNight: true,
          cleaningCharge: true,
          extraGuestCharge: true,
          totalGuestFee: true,
          totalHostFee: true,
          totalDiscount: true,
          discountType: true,
          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          property: {
            select: {
              id: true,
              cancellationPolicyId: true,
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    where: { locale: lang },
                    select: { name: true },
                  },
                },
              },
            },
          },
          host: true,
          guest: true,
          currency: true,
          bookingDates: true,
        },
      });

      let conversation;
      if (inquiry) {
        // 2️⃣ Find or create Conversation (per property per guest)
        conversation = await prisma.conversation.findFirst({
          where: {
            propertyId,
            participants: { some: { userId: req.user.id } }, // only find conversation this guest is part of
          },
          include: { participants: true },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              propertyId,
              participants: {
                create: [
                  { userId: req.user.id, role: 'GUEST' },
                  { userId: hostId, role: 'HOST' },
                ],
              },
            },
            include: { participants: true },
          });
        } else {
          // 3️⃣ Ensure participants exist
          const existingUserIds = conversation.participants.map((p) => p.userId);
          const toAdd = [];
          if (!existingUserIds.includes(req.user.id)) toAdd.push({ userId: req.user.id, role: 'GUEST' });
          if (!existingUserIds.includes(hostId)) toAdd.push({ userId: hostId, role: 'HOST' });
          if (toAdd.length > 0) {
            await prisma.conversationParticipant.createMany({
              data: toAdd.map((p) => ({ ...p, conversationId: conversation.id })),
            });
          }
        }

        // 4️⃣ Create ConversationBooking for this booking
        const conversationBooking = await prisma.conversationBooking.create({
          data: {
            conversationId: conversation.id,
            bookingId: inquiry.id,
          },
        });

        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: req.user.id,
            text: `Inquiry sent · ${formatGuestSummary(guests)}, ${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`,
            type: 'SYSTEM',
          },
        });

        const userMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: req.user.id,
            text: message,
            type: 'TEXT',
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageId: userMessage.id,
            lastMessageAt: userMessage.createdAt,
          },
        });
      }

      // Activity log
      await logActivity(req, req.user.id, 'Booking Inquiry Sent', {
        details: `Guest ${req.user.name} sent a booking inquiry to host ${inquiry?.host?.name} for "${inquiry?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}".`,
      });

      // Notification for Host
      const notificationData = {
        title: `New inquiry from ${req?.user?.name}`,
        body: `${req?.user?.name} sent an inquiry for "${inquiry?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}"`,
        link: `/host/reservations/details/:id`,
      };

      await sendUserNotification({ userId: inquiry?.host?.id, fcmToken: inquiry?.host?.fcmToken, notificationData });

      // Email to Host
      await sendEmailWithRetry({
        to: inquiry.host.email,
        subject: `New inquiry for "${inquiry?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}"`,
        templateName: 'propertyInquiryHost',
        data: {
          year: new Date().getFullYear(),
          hostName: inquiry.host.name,
          guestName: inquiry.guest.name,
          propertyName: inquiry?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name,
          bookingId: inquiry.id,
          checkIn: format(inquiry.startDate, 'dd/MM/yyyy'),
          checkOut: format(inquiry.endDate, 'dd/MM/yyyy'),
          totalNight: inquiry.totalNight,
          nightText: inquiry.totalNight > 1 ? 'nights' : 'night',
          conversationId: conversation.id,
          message,
        },
      });

      // Email to Guest
      await sendEmailWithRetry({
        to: inquiry.guest.email,
        subject: `Your inquiry for "${inquiry?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}" was sent`,
        templateName: 'propertyInquiryGuest',
        data: {
          year: new Date().getFullYear(),
          guestName: inquiry.guest.name,
          propertyName: inquiry?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name,
          checkIn: format(inquiry.startDate, 'dd/MM/yyyy'),
          checkOut: format(inquiry.endDate, 'dd/MM/yyyy'),
          totalNight: inquiry.totalNight,
          nightText: inquiry.totalNight > 1 ? 'nights' : 'night',
          conversationId: conversation.id,
        },
      });

      res.json({ message: 'Booking inquiry submit successfully!', conversationId: conversation.id, booking: inquiry });
    } catch (error) {
      console.error('Request Reserve error:', error);
      res.status(500).json({ error: 'Failed to Request Reserve' });
    }
  },

  async requestBooking(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const lang = (req.query.lang || 'en').trim();
    const {
      propertyId,
      currencyId,
      hostId,
      startDate,
      endDate,
      guests,
      totalNight,
      discountType,
      totalPrice,
      exchangeRateToBase,
      exchangeRatePropertyToBase,
      totalDiscount,
      totalGuestFee,
      totalHostFee,
      cleaningCharge,
      extraGuestCharge,
      bookingType,
      cancellationPolicyId,
      nights,
      message,
    } = req.body;

    try {
      if (hostId === req.user.id) {
        return res.status(400).json({
          error: "You can't book your own property.",
        });
      }

      if (req.user.isBanned) {
        return res.status(400).json({
          error: 'Your account has been suspended. Please contact support for assistance.',
        });
      }

      const propertyHost = await prisma.user.findFirst({
        where: { id: hostId },
      });

      if (propertyHost.isBanned || !propertyHost.isVerified) {
        return res.status(400).json({
          error: "This listing is currently unavailable as the host's account is not verified or has been restricted.",
        });
      }

      const property = await prisma.property.findFirst({
        where: { id: propertyId },
      });

      if (!property.isApproved || property.status === 'Unlisted') {
        return res.status(400).json({
          error: 'This listing is not available for booking at the moment.',
        });
      }

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          propertyId,
          bookingStatus: 'CONFIRMED',
          bookingDates: {
            some: {
              date: {
                in: nights.map((n) => new Date(n.date)),
              },
            },
          },
        },
        include: {
          bookingDates: true,
        },
      });

      if (conflictingBooking) {
        return res.status(400).json({
          error: 'Some Selected dates are already booked for this property',
          conflictingBooking,
        });
      }

      const booking = await prisma.booking.create({
        data: {
          property: {
            connect: { id: propertyId },
          },
          currency: {
            connect: { id: currencyId },
          },
          host: {
            connect: { id: hostId },
          },
          guest: {
            connect: { id: req?.user?.id },
          },
          startDate,
          endDate,
          guests,
          totalNight,
          discountType,
          totalPrice,
          exchangeRateToBase,
          exchangeRatePropertyToBase,
          totalDiscount,
          totalGuestFee,
          totalHostFee,
          cleaningCharge,
          extraGuestCharge,
          bookingType,
          grandTotal: totalPrice + totalGuestFee + cleaningCharge - totalDiscount,
          cancellationPolicy: {
            connect: { id: cancellationPolicyId },
          },
        },
        select: {
          id: true,
          totalPrice: true,
          startDate: true,
          endDate: true,
          guests: true,
          totalNight: true,
          cleaningCharge: true,
          extraGuestCharge: true,
          totalGuestFee: true,
          totalHostFee: true,
          totalDiscount: true,
          discountType: true,
          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          property: {
            select: {
              id: true,
              cancellationPolicyId: true,
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    where: { locale: lang },
                    select: { name: true },
                  },
                },
              },
              propertyPrice: {
                select: {
                  currency: true,
                },
              },
            },
          },
          host: true,
          guest: true,
          currency: true,
          bookingDates: true,
        },
      });

      let conversation;
      if (booking) {
        // 2️⃣ Find or create Conversation (per property per guest)
        conversation = await prisma.conversation.findFirst({
          where: {
            propertyId,
            participants: { some: { userId: req.user.id } }, // only find conversation this guest is part of
          },
          include: { participants: true },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              propertyId,
              participants: {
                create: [
                  { userId: req.user.id, role: 'GUEST' },
                  { userId: hostId, role: 'HOST' },
                ],
              },
            },
            include: { participants: true },
          });
        } else {
          // 3️⃣ Ensure participants exist
          const existingUserIds = conversation.participants.map((p) => p.userId);
          const toAdd = [];
          if (!existingUserIds.includes(req.user.id)) toAdd.push({ userId: req.user.id, role: 'GUEST' });
          if (!existingUserIds.includes(hostId)) toAdd.push({ userId: hostId, role: 'HOST' });
          if (toAdd.length > 0) {
            await prisma.conversationParticipant.createMany({
              data: toAdd.map((p) => ({ ...p, conversationId: conversation.id })),
            });
          }
        }

        // 4️⃣ Create ConversationBooking for this booking
        const conversationBooking = await prisma.conversationBooking.create({
          data: {
            conversationId: conversation.id,
            bookingId: booking.id,
          },
        });

        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: req.user.id,
            text: `Inquiry sent · ${formatGuestSummary(guests)}, ${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`,
            type: 'SYSTEM',
          },
        });

        const userMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: req.user.id,
            text: message,
            type: 'TEXT',
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageId: userMessage.id,
            lastMessageAt: userMessage.createdAt,
          },
        });
      }

      // Activity log
      await logActivity(req, req.user.id, 'Booking Request Sent', {
        details: `Guest ${req.user.name} requested to book "${booking?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}" (Property ID: ${propertyId}) hosted by ${booking?.host?.name} from ${startDate} to ${endDate}, for ${totalNight} night(s). Total amount: ${totalPrice} ${booking?.currency?.code}.`,
      });

      // Notification for Host
      const notificationData = {
        title: 'New Booking Request',
        body: `${req?.user?.name} requested to book "${booking?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}" from (${format(startDate, 'MMM dd')} to ${format(endDate, 'MMM dd, yyyy')}).`,
        link: `/host/reservations/details/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.host?.id, fcmToken: booking?.host?.fcmToken, notificationData });

      // Send email to Host
      await sendEmailWithRetry({
        to: booking?.host?.email,
        subject: 'New Booking Request',
        templateName: 'newBookingRequestHost',
        data: {
          year: new Date().getFullYear(),
          hostName: booking?.host?.name,
          guestName: booking?.guest?.name,
          propertyName: booking?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name,
          startDate: format(startDate, 'dd/MM/yyyy'),
          endDate: format(endDate, 'dd/MM/yyyy'),
          totalNight: booking?.totalNight,
          nightText: booking?.totalNight > 1 ? 'nights' : 'night',
          totalPrice: formatPrice(
            booking?.property?.propertyPrice?.currency,
            parseFloat(booking?.totalPrice) + parseFloat(booking?.cleaningCharge) + parseFloat(booking?.totalGuestFee) - parseFloat(booking?.totalDiscount),
          ),
          conversationId: conversation.id,
          message,
        },
      });

      // Send email to Guest
      await sendEmailWithRetry({
        to: req.user.email,
        subject: 'Your Booking Request Has Been Sent!',
        templateName: 'newBookingRequestGuest',
        data: {
          year: new Date().getFullYear(),
          guestName: req.user.name,
          propertyName: booking?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name,
          hostName: booking?.host?.name,
          bookingId: booking.id,
          startDate: format(startDate, 'dd/MM/yyyy'),
          endDate: format(endDate, 'dd/MM/yyyy'),
          totalNight: booking?.totalNight,
          nightText: booking?.totalNight > 1 ? 'nights' : 'night',

          totalPrice: convertAndFormatBookedCurrency({
            orderCurrency: booking?.currency,
            exchangeRateToBase: booking?.exchangeRateToBase,
            exchangeRatePropertyToBase: booking?.exchangeRatePropertyToBase,
            price: parseFloat(booking?.totalPrice) + parseFloat(booking?.cleaningCharge) + parseFloat(booking?.totalGuestFee) - parseFloat(booking?.totalDiscount),
          }),
          conversationId: conversation.id,
        },
      });

      res.json({ message: 'Booking request submitted successfully!', conversationId: conversation.id, booking });
    } catch (error) {
      console.error('Request Reserve error:', error);
      res.status(500).json({ error: 'Failed to Request Reserve' });
    }
  },

  async confirmBooking(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const lang = (req.query.lang || 'en').trim();
    const {
      bookingId,
      hostId,
      propertyId,
      exchangeRateToBase,
      exchangeRatePropertyToBase,
      startDate,
      endDate,
      guests,
      totalNight,
      discountType,
      totalPrice,
      totalDiscount,
      totalGuestFee,
      totalHostFee,
      cleaningCharge,
      extraGuestCharge,
      bookingType,
      nights,
    } = req.body;

    try {
      if (hostId === req.user.id) {
        return res.status(400).json({
          error: "You can't book your own property.",
        });
      }

      if (req.user.isBanned) {
        return res.status(400).json({
          error: 'Your account has been suspended. Please contact support for assistance.',
        });
      }

      const propertyHost = await prisma.user.findFirst({
        where: { id: hostId },
      });

      if (propertyHost.isBanned || !propertyHost.isVerified) {
        return res.status(400).json({
          error: "This listing is currently unavailable as the host's account is not verified or has been restricted.",
        });
      }

      const property = await prisma.property.findFirst({
        where: { id: propertyId },
      });

      if (!property.isApproved || property.status === 'Unlisted') {
        return res.status(400).json({
          error: 'This listing is not available for booking at the moment.',
        });
      }

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          propertyId,
          bookingStatus: 'CONFIRMED',
          bookingDates: {
            some: {
              date: {
                in: nights.map((n) => new Date(n.date)),
              },
            },
          },
        },
        include: {
          bookingDates: true,
        },
      });

      if (conflictingBooking) {
        return res.status(400).json({
          error: 'Some Selected dates are already booked for this property',
          conflictingBooking,
        });
      }

      const bookingDates = await prisma.bookingDates.deleteMany({
        where: {
          bookingId: bookingId,
        },
      });

      const booking = await prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          property: {
            connect: { id: propertyId },
          },
          startDate,
          endDate,
          guests,
          totalNight,
          discountType,
          totalPrice,
          totalDiscount,
          totalGuestFee,
          totalHostFee,
          cleaningCharge,
          extraGuestCharge,
          bookingType,
          exchangeRateToBase,
          exchangeRatePropertyToBase,
          grandTotal: totalPrice + totalGuestFee + cleaningCharge - totalDiscount,
          bookingDates: {
            create: nights.map((n) => ({
              date: new Date(n.date),
              price: n.price,
            })),
          },
        },
        select: {
          id: true,
          totalPrice: true,
          startDate: true,
          endDate: true,
          guests: true,
          totalNight: true,
          cleaningCharge: true,
          extraGuestCharge: true,
          totalGuestFee: true,
          totalHostFee: true,
          totalDiscount: true,
          discountType: true,
          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          property: {
            select: {
              id: true,
              cancellationPolicyId: true,
              propertyDescription: {
                select: {
                  propertyDescriptionTranslation: {
                    where: { locale: lang },
                    select: { name: true },
                  },
                },
              },
            },
          },
          host: true,
          guest: true,
          currency: true,
          bookingDates: true,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Booking Confirmed', {
        details: `Booking #${bookingId} for property "${booking?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}" (Property ID: ${propertyId}) was confirmed by ${req.user.name}. Stay period: From ${startDate} to ${endDate} (${totalNight} nights).`,
      });

      res.status(200).json({ message: 'Booking Confirmed!', booking });
    } catch (error) {
      console.error('Confirm Booking error:', error);
      res.status(500).json({ error: 'Failed to Confirm Booking' });
    }
  },

  async addReview(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const lang = (req.query.lang || 'en').trim();
    const {
      senderId,
      receiverId,
      bookingId,
      propertyId,
      message,
      secretFeedback,
      improveMessage,
      accuracy,
      accuracyMessage,
      amenities,
      amenitiesMessage,
      checkin,
      checkinMessage,
      cleanliness,
      cleanlinessMessage,
      communication,
      communicationMessage,
      location,
      locationMessage,
      value,
      valueMessage,
    } = req.body;
    try {
      const review = await prisma.reviews.create({
        data: {
          message,
          secretFeedback,
          improveMessage,
          booking: {
            connect: { id: bookingId },
          },
          property: {
            connect: { id: propertyId },
          },
          reviewSender: {
            connect: { id: senderId },
          },
          reviewReceiver: {
            connect: { id: receiverId },
          },
          ratings: {
            create: [
              { category: 'accuracy', score: accuracy ? Number(accuracy) : 0, message: accuracyMessage },
              { category: 'cleanliness', score: cleanliness ? Number(cleanliness) : 0, message: cleanlinessMessage },
              { category: 'communication', score: communication ? Number(communication) : 0, message: communicationMessage },
              { category: 'checkin', score: checkin ? Number(checkin) : 0, message: checkinMessage },
              { category: 'amenities', score: amenities ? Number(amenities) : 0, message: amenitiesMessage },
              { category: 'location', score: location ? Number(location) : 0, message: locationMessage },
              { category: 'value', score: value ? Number(value) : 0, message: valueMessage },
            ],
          },
        },
        select: {
          id: true,
          ratings: true,
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
          reviewReceiver: {
            select: {
              name: true,
            },
          },
        },
      });
      console.log('REVIEW', review);
      const totalScore = review.ratings.reduce((sum, r) => sum + Number(r.score || 0), 0);
      const overallRating = review.ratings.length > 0 ? totalScore / review.ratings.length : 0;

      // Update the review with overallRating
      await prisma.reviews.update({
        where: { id: review.id },
        data: { overallRating },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Review Submitted by Guest', {
        details: `Review submitted by ${req.user.name} for property "${review?.property?.propertyDescription?.propertyDescriptionTranslation?.[0]?.name}" (Booking #${bookingId}) to ${review?.reviewReceiver?.name}. Overall rating: ${overallRating.toFixed(1)} / 5.`,
      });

      res.status(200).json({ message: 'Review added successfully', review });
    } catch (error) {
      console.error('Add Review error:', error);
      res.status(500).json({ error: 'Failed to Add Review' });
    }
  },

  async getPaymentsData(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const { type, status } = req.query;
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const paymentsData = await prisma.booking.findMany({
        where: { guestId: req.user.id },
        include: {
          payment: true,
        },
      });

      res.status(200).json(paymentsData);
    } catch (error) {}
  },

  async declineBookingRequest(req, res) {
    const { bookingId } = req.params;
    const { conversationBookingId } = req.body;

    try {
      // Validate user
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the booking
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          guest: true,
          host: true,
          property: {
            include: {
              propertyDescription: {
                include: { propertyDescriptionTranslation: true },
              },
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'DECLINED',
          declinedAt: new Date(),
          declinedBy: 'Guest',
        },
      });

      if (booking) {
        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId,
            senderId: req.user.id,
            text: `Booking request declined by Guest`,
            type: 'SYSTEM',
          },
          include: {
            conversationBooking: {
              include: { conversation: true },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: systemMessage.conversationBooking.conversationId },
          data: {
            lastMessageId: systemMessage.id,
            lastMessageAt: systemMessage.createdAt,
          },
        });
      }

      // Activity log
      await logActivity(req, req.user.id, 'Booking request declined', {
        details: `Booking (#${bookingId}) request declined by ${req.user.name} (User ID: ${req.user.id}).`,
      });

      // Notification for Host
      const notificationData = {
        title: 'Guest declined the booking request',
        body: `The guest (${booking?.guest?.name}) has declined the booking request for "${booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name}".`,
        link: `/host/bookings/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.host?.id, fcmToken: booking?.host?.fcmToken, notificationData });

      // Send Email to Guest
      await sendEmailWithRetry({
        to: booking?.host?.email,
        subject: 'Booking request has been declined by guest',
        templateName: 'bookingDeclinedByGuest',
        data: {
          hostName: booking?.host?.name,
          guestName: booking?.guest?.name,
          propertyName: booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name,
          bookingId: booking?.id,
          checkIn: format(booking.startDate, 'dd/MM/yyyy'),
          checkOut: format(booking.endDate, 'dd/MM/yyyy'),
        },
      });

      res.json({ message: 'Booking request declined successfully', booking: updatedBooking });
    } catch (error) {
      console.error('Decline booking error:', error);
      res.status(500).json({ error: 'Failed to decline booking request' });
    }
  },
};
