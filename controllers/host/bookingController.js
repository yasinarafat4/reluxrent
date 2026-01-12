const prisma = require('../../config/prisma');
const { findTranslation } = require('../../helpers/findTranslation');
const { format, addDays, addHours, differenceInDays, parse, startOfDay, endOfDay } = require('date-fns');
const logActivity = require('../../helpers/logActivity');
const { getGuestStatus } = require('../../helpers/getGuestStatus');
const { checkAvailability } = require('../../helpers/checkAvailability');
const { getUserRatings } = require('../../helpers/getUserRatings');
const { convertDecimals } = require('../../helpers/convertDecimals');
const { formatGuestSummary } = require('../../helpers/formatGuestSummary');
const { sendUserNotification } = require('../../helpers/notificationService');
const { sendEmailWithRetry } = require('../../helpers/sendEmailWithRetry');
const { convertAndFormatBookedCurrency } = require('../../helpers/formatPrice');

module.exports = {
  async getReservations(req, res) {
    const lang = (req.query.lang || 'en').trim();

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      // Read pagination params (with defaults)
      const { page = 1, search, startDate, endDate, property } = req.query;
      const rawStatus = String(req.query.status || '').trim();
      const limit = 10;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const normalizedStatus = !rawStatus || rawStatus === 'undefined' || rawStatus === 'All' ? null : rawStatus;
      const normalizedSearch = search === '' || search === 'undefined' ? null : search;
      const normalizedStartDate = startDate === 'undefined' ? null : startDate;
      const normalizedEndDate = endDate === 'undefined' ? null : endDate;
      const normalizedProperty = property === 'undefined' ? null : property;

      const whereClause = { hostId: req.user.id };

      // Search
      if (normalizedSearch) {
        whereClause.OR = [
          { confirmationCode: { contains: normalizedSearch } },
          // search by related model fields (guest)
          {
            guest: {
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

      // Property
      if (normalizedProperty) {
        whereClause.propertyId = normalizedProperty;
      }

      // Status
      if (normalizedStatus) {
        whereClause.bookingStatus = normalizedStatus;
      }

      // Get total count for pagination
      const totalReservations = await prisma.booking.count({
        where: whereClause,
      });

      const reservations = await prisma.booking.findMany({
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
              bookType: true,
              bookingType: true,
              status: true,
              isApproved: true,
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
              propertyImages: { orderBy: { serial: 'asc' } },
              propertyDates: true,
              bookings: {
                where: { bookingStatus: 'CONFIRMED' },
                select: {
                  bookingDates: {
                    select: {
                      date: true,
                      price: true,
                    },
                  },
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
                },
              },
            },
          },
          conversationBooking: true,
        },
      });

      const reservationData = await Promise.all(
        reservations.map(async (booking) => {
          // Check availability using last booking
          const { isAvailable } = await checkAvailability(booking);

          // ---------------- Guest Status ----------------
          const { guestStatus, reviewDeadline, canReview, reviewFromGuest, reviewFromHost } = await getGuestStatus(booking, req.user, isAvailable);

          const translatedDescriptions = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

          return {
            ...booking,
            guestStatus,
            reviewDeadline,
            canReview,
            reviewFromGuest,
            reviewFromHost,
            conversationBooking: { conversationId: booking.conversationBooking[0]?.conversationId },
            property: {
              ...booking.property,
              propertyDescription: {
                name: translatedDescriptions?.name,
              },
            },
          };
        }),
      );

      res.status(200).json(
        convertDecimals({
          data: reservationData,
          pagination: {
            total: totalReservations,
            page: Number(page),
            totalPages: Math.ceil(totalReservations / Number(limit)),
          },
        }),
      );
    } catch (error) {
      console.log('Host Booking Error', error);
    }
  },

  async getReservationDetails(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const bookingId = req.params.bookingId;
      if (!bookingId) return res.status(400).json({ error: 'Booking is required' });

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
          declinedAt: true,
          declinedBy: true,
          exchangeRateToBase: true,
          exchangeRatePropertyToBase: true,
          property: {
            select: {
              id: true,
              slug: true,
              bookType: true,
              bookingType: true,
              status: true,
              isApproved: true,
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
              propertyImages: { orderBy: { serial: 'asc' } },
              propertyDates: true,
              propertyPrice: {
                select: {
                  cleaningFee: true,
                  guestAfter: true,
                  guestAfterFee: true,
                  monthlyDiscount: true,
                  price: true,
                  securityFee: true,
                  weekendPrice: true,
                  weeklyDiscount: true,
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
              bookings: {
                where: { bookingStatus: 'CONFIRMED' },
                select: {
                  bookingDates: {
                    select: {
                      date: true,
                      price: true,
                    },
                  },
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
                },
              },
            },
          },
          conversationBooking: true,
        },
      });

      const guest = booking?.guest;
      const host = booking?.host;
      // Check availability using last booking
      const { isAvailable } = await checkAvailability(booking);

      // ---------------- Guest and Host Overall Ratings ----------------
      const { guestOverallRating, guestReviewCount, guestTripsCount, guestCategoryRatings, hostOverallRating, hostReviewCount, hostCategoryRatings } = await getUserRatings(booking);

      // ---------------- Guest Status ----------------
      const { guestStatus, reviewDeadline, canReview, reviewFromGuest, reviewFromHost } = await getGuestStatus(booking, req.user, isAvailable);

      const specialOffer = booking.specialOffer
        ? {
            id: booking.specialOffer.id,
            price: parseFloat(booking.specialOffer.price),
            guestFee: parseFloat(booking.specialOffer.guestFee),
            hostFee: parseFloat(booking.specialOffer.hostFee),
            startDate: booking.specialOffer.startDate,
            endDate: booking.specialOffer.endDate,
            totalNight: booking.specialOffer.totalNight,
            guests: booking.specialOffer.guests,
            status: booking.specialOffer.status,
            createdAt: booking.specialOffer.createdAt,
          }
        : null;

      const translatedDescriptions = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
      const translatedCancellationPolicy = findTranslation(booking?.cancellationPolicy?.cancellationPolicyTranslation, lang);

      res.json(
        convertDecimals({
          lastBooking: {
            ...booking,
            guestStatus,
            specialOffer,
            guestCategoryRatings,
            hostCategoryRatings,
            reviewDeadline,
            canReview,
            guestOverallRating,
            hostOverallRating,
            guestReviewCount,
            hostReviewCount,
            guestTripsCount,
            property: {
              ...booking.property,
              isAvailable,
              propertyDescription: {
                name: translatedDescriptions?.name,
              },
              propertyPrice: booking?.property?.propertyPrice,
              isAvailable,
            },
            cancellationPolicy: {
              name: translatedCancellationPolicy?.name,
            },
          },
          conversationId: booking.conversationBooking[0]?.conversationId,
          conversationBookingId: booking.conversationBooking[0]?.id,
          guestStatus,
          reviewDeadline,
          canReview,
          reviewFromGuest,
          reviewFromHost,
          guestOverallRating,
          hostOverallRating,
          guestReviewCount,
          hostReviewCount,
          guestTripsCount,
          guestCategoryRatings,
          hostCategoryRatings,
        }),
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getTodaysReservations(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const { type, status } = req.query;
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          hostId: req.user.id,
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
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
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },
            },
          },
          cancellationPolicy: {
            include: {
              cancellationPolicyTranslation: true,
            },
          },
          currency: true,
          host: true,
          guest: true,
          reviews: true,
          payment: true,
          conversationBooking: true,
        },
      });
      const bookingsData = bookings.map((booking) => {
        const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

        const propertyData = {
          id: booking?.property?.id,
          name: propertyDesc?.name,
        };

        // ---------------- Guest Status ----------------
        let guestStatus = '';
        let reviewFromHost = null;
        let reviewDeadline;
        let canReview = false;
        if (booking?.guest?.id) {
          const guestId = booking.guest.id;
          const now = new Date();

          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);

          if (start <= now && now <= end) {
            guestStatus = 'Currently Staying';
          } else if (start > now) {
            guestStatus = 'Upcoming Stay';
          } else if (end < now) {
            const hostId = booking.property?.host?.id;

            // fetch full review objects

            reviewFromHost = booking.reviews?.find((r) => r.senderId === hostId && r.receiverId === guestId) || null;

            if (!reviewFromHost) {
              const deadline = addDays(end, 15); // 15 days after checkout
              const daysLeft = differenceInDays(deadline, now);

              if (daysLeft > 0) {
                guestStatus = 'Review guest';
                reviewDeadline = daysLeft;
                canReview = true;
              } else {
                guestStatus = 'Past Guest';
              }
            } else {
              guestStatus = 'Past Guest';
            }
          }
        }

        return {
          id: booking?.id,
          startDate: booking?.startDate,
          endDate: booking?.endDate,
          guests: booking?.guests,
          totalNight: booking?.totalNight,
          cleaningCharge: booking?.cleaningCharge,
          confirmationCode: booking?.confirmationCode,
          confirmedAt: booking?.confirmedAt,
          extraGuestCharge: booking?.extraGuestCharge,
          totalGuestFee: booking?.totalGuestFee,
          totalHostFee: booking?.totalHostFee,
          totalPrice: booking?.totalPrice,
          totalDiscount: booking?.totalDiscount,
          discountType: booking?.discountType,
          bookingStatus: booking?.bookingStatus,
          bookingType: booking?.bookingType,
          paymentStatus: booking?.paymentStatus,
          acceptedAt: booking?.acceptedAt,
          expiredAt: booking?.expiredAt,
          declinedAt: booking?.declinedAt,
          declinedBy: booking?.declinedBy,
          property: propertyData,
          currency: booking?.currency,
          host: booking?.host,
          guest: booking?.guest,
          reviews: booking.reviews,
          payment: booking.payment,
          conversationBooking: booking.conversationBooking,

          guestStatus,
          reviewDeadline,
          canReview,
          createdAt: booking?.createdAt,
          updatedAt: booking?.updatedAt,
        };
      });

      res.status(200).json(bookingsData);
    } catch (error) {
      console.log('Host Booking Error', error);
    }
  },

  async getRequestBookings(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const { type, status } = req.query;
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          hostId: req.user.id,
          bookingType: 'REQUEST',
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
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },
            },
          },
          cancellationPolicy: {
            include: {
              cancellationPolicyTranslation: true,
            },
          },
          currency: true,
          host: true,
          guest: true,
          reviews: true,
          payment: true,
          conversationBooking: true,
        },
      });
      const bookingsData = bookings.map((booking) => {
        const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

        const propertyData = {
          id: booking?.property?.id,
          name: propertyDesc?.name,
        };

        // ---------------- Guest Status ----------------
        let guestStatus = '';
        let reviewFromHost = null;
        let reviewDeadline;
        let canReview = false;
        if (booking?.guest?.id) {
          const guestId = booking.guest.id;
          const now = new Date();

          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);

          if (start <= now && now <= end) {
            guestStatus = 'Currently Staying';
          } else if (start > now) {
            guestStatus = 'Upcoming Stay';
          } else if (end < now) {
            const hostId = booking.property?.host?.id;

            // fetch full review objects

            reviewFromHost = booking.reviews?.find((r) => r.senderId === hostId && r.receiverId === guestId) || null;

            if (!reviewFromHost) {
              const deadline = addDays(end, 15); // 15 days after checkout
              const daysLeft = differenceInDays(deadline, now);

              if (daysLeft > 0) {
                guestStatus = 'Review guest';
                reviewDeadline = daysLeft;
                canReview = true;
              } else {
                guestStatus = 'Past Guest';
              }
            } else {
              guestStatus = 'Past Guest';
            }
          }
        }

        return {
          id: booking?.id,
          startDate: booking?.startDate,
          endDate: booking?.endDate,
          guests: booking?.guests,
          totalNight: booking?.totalNight,
          cleaningCharge: booking?.cleaningCharge,
          confirmationCode: booking?.confirmationCode,
          confirmedAt: booking?.confirmedAt,
          extraGuestCharge: booking?.extraGuestCharge,
          totalGuestFee: booking?.totalGuestFee,
          totalHostFee: booking?.totalHostFee,
          totalPrice: booking?.totalPrice,
          totalDiscount: booking?.totalDiscount,
          discountType: booking?.discountType,
          bookingStatus: booking?.bookingStatus,
          bookingType: booking?.bookingType,
          paymentStatus: booking?.paymentStatus,
          acceptedAt: booking?.acceptedAt,
          expiredAt: booking?.expiredAt,
          declinedAt: booking?.declinedAt,

          declinedBy: booking?.declinedBy,
          property: propertyData,
          currency: booking?.currency,
          host: booking?.host,
          guest: booking?.guest,
          reviews: booking.reviews,
          payment: booking.payment,
          conversationBooking: booking.conversationBooking,

          guestStatus,
          reviewDeadline,
          canReview,
          createdAt: booking?.createdAt,
          updatedAt: booking?.updatedAt,
        };
      });

      res.status(200).json(bookingsData);
    } catch (error) {
      console.log('Host Booking Error', error);
    }
  },

  async getFollowUpBookings(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const { type, status } = req.query;
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          hostId: req.user.id,
          bookingType: 'BOOKING',
          bookingStatus: 'CONFIRMED',
          reviews: {
            none: { senderId: req.user.id },
          },
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
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },
            },
          },
          cancellationPolicy: {
            include: {
              cancellationPolicyTranslation: true,
            },
          },
          currency: true,
          host: true,
          guest: {
            include: {
              reviewsReceived: {
                include: {
                  ratings: true,
                  reviewSender: true,
                },
              },
            },
          },
          reviews: true,
          payment: true,
          conversationBooking: true,
        },
      });
      const bookingsData = bookings.map((booking) => {
        const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

        const propertyData = {
          id: booking?.property?.id,
          name: propertyDesc?.name,
        };

        // ---------------- Guest Status ----------------
        let guestStatus = '';
        let reviewFromHost = null;
        let reviewDeadline;
        let canReview = false;
        if (booking?.guest?.id) {
          const guestId = booking.guest.id;
          const now = new Date();

          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);

          if (start <= now && now <= end) {
            guestStatus = 'Currently Staying';
          } else if (start > now) {
            guestStatus = 'Upcoming Stay';
          } else if (end < now) {
            const hostId = booking.property?.host?.id;

            // fetch full review objects

            reviewFromHost = booking.reviews?.find((r) => r.senderId === hostId && r.receiverId === guestId) || null;

            if (!reviewFromHost) {
              const deadline = addDays(end, 15); // 15 days after checkout
              const daysLeft = differenceInDays(deadline, now);

              if (daysLeft > 0) {
                guestStatus = 'Review guest';
                reviewDeadline = daysLeft;
                canReview = true;
              } else {
                guestStatus = 'Past Guest';
              }
            } else {
              guestStatus = 'Past Guest';
            }
          }
        }

        // ---------------- Ratings Aggregation ----------------
        let guestCategoryRatings = {};
        let hostCategoryRatings = {};

        if (booking.guest?.reviewsReceived?.length) {
          const ratingSums = {};
          const ratingCounts = {};

          booking.guest.reviewsReceived.forEach((review) => {
            if (Array.isArray(review.ratings)) {
              review.ratings.forEach((rating) => {
                if (rating.category && rating.score != null) {
                  const score = parseFloat(rating.score);
                  if (!isNaN(score)) {
                    ratingSums[rating.category] = (ratingSums[rating.category] || 0) + score;
                    ratingCounts[rating.category] = (ratingCounts[rating.category] || 0) + 1;
                  }
                }
              });
            }
          });

          guestCategoryRatings = Object.fromEntries(Object.entries(ratingSums).map(([key, sum]) => [key, parseFloat((sum / ratingCounts[key]).toFixed(1))]));
        }

        return {
          id: booking?.id,
          startDate: booking?.startDate,
          endDate: booking?.endDate,
          guests: booking?.guests,
          totalNight: booking?.totalNight,
          cleaningCharge: booking?.cleaningCharge,
          confirmationCode: booking?.confirmationCode,
          confirmedAt: booking?.confirmedAt,
          extraGuestCharge: booking?.extraGuestCharge,
          totalGuestFee: booking?.totalGuestFee,
          totalHostFee: booking?.totalHostFee,
          totalPrice: booking?.totalPrice,
          totalDiscount: booking?.totalDiscount,
          discountType: booking?.discountType,
          bookingStatus: booking?.bookingStatus,
          bookingType: booking?.bookingType,
          paymentStatus: booking?.paymentStatus,
          acceptedAt: booking?.acceptedAt,
          expiredAt: booking?.expiredAt,
          declinedAt: booking?.declinedAt,

          declinedBy: booking?.declinedBy,
          property: propertyData,
          currency: booking?.currency,
          host: booking?.host,
          guest: booking?.guest,
          reviews: booking.reviews,
          payment: booking.payment,
          conversationBooking: booking.conversationBooking,
          lastBooking: {
            bookingId: booking.id,
            // bookingType: booking.bookingType,
            // bookingStatus: booking.bookingStatus,
            // paymentStatus: booking.paymentStatus,
            // currency: booking?.currency,
            // startDate: booking?.startDate || null,
            // endDate: booking?.endDate || null,
            // guests: booking?.guests || null,
            // totalNight: booking?.totalNight || null,
            // cleaningCharge: booking?.cleaningCharge ? parseFloat(booking.cleaningCharge) : 0,
            // extraGuestCharge: booking?.extraGuestCharge ? parseFloat(booking.extraGuestCharge) : 0,
            // totalPrice: booking?.totalPrice ? parseFloat(booking.totalPrice) : 0,
            // totalGuestFee: booking?.totalGuestFee ? parseFloat(booking.totalGuestFee) : 0,
            // totalHostFee: booking?.totalHostFee ? parseFloat(booking.totalHostFee) : 0,
            // totalDiscount: booking?.totalDiscount ? parseFloat(booking.totalDiscount) : 0,
            // discountType: booking?.discountType,
            // confirmationCode: booking?.confirmationCode || null,
            // confirmedAt: booking?.confirmedAt || null,
            // acceptedAt: booking?.acceptedAt || null,
            // expiredAt: booking?.expiredAt || null,
            // declinedAt: booking?.declinedAt || null,
            // cancelledAt: booking?.cancelledAt || null,
            // declinedBy: booking?.declinedBy || null,
            // createdAt: booking.createdAt || null,
            // specialOffer,
          },
          guestStatus,
          reviewDeadline,
          guestCategoryRatings,
          hostCategoryRatings,
          canReview,
          createdAt: booking?.createdAt,
          updatedAt: booking?.updatedAt,
        };
      });

      res.status(200).json(bookingsData);
    } catch (error) {
      console.log('Host Booking Error', error);
    }
  },

  async getUpcomingReservations(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const { type, status } = req.query;
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          hostId: req.user.id,
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
          startDate: { gte: new Date() },
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
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },
            },
          },
          cancellationPolicy: {
            include: {
              cancellationPolicyTranslation: true,
            },
          },
          currency: true,
          host: true,
          guest: true,
          reviews: true,
          payment: true,
          conversationBooking: true,
        },
      });
      const bookingsData = bookings.map((booking) => {
        const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);

        const propertyData = {
          id: booking?.property?.id,
          name: propertyDesc?.name,
        };

        // ---------------- Guest Status ----------------
        let guestStatus = '';
        let reviewFromHost = null;
        let reviewDeadline;
        let canReview = false;
        if (booking?.guest?.id) {
          const guestId = booking.guest.id;
          const now = new Date();

          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);

          if (start <= now && now <= end) {
            guestStatus = 'Currently Staying';
          } else if (start > now) {
            guestStatus = 'Upcoming Stay';
          } else if (end < now) {
            const hostId = booking.property?.host?.id;

            // fetch full review objects

            reviewFromHost = booking.reviews?.find((r) => r.senderId === hostId && r.receiverId === guestId) || null;

            if (!reviewFromHost) {
              const deadline = addDays(end, 15); // 15 days after checkout
              const daysLeft = differenceInDays(deadline, now);

              if (daysLeft > 0) {
                guestStatus = 'Review guest';
                reviewDeadline = daysLeft;
                canReview = true;
              } else {
                guestStatus = 'Past Guest';
              }
            } else {
              guestStatus = 'Past Guest';
            }
          }
        }

        return {
          id: booking?.id,
          startDate: booking?.startDate,
          endDate: booking?.endDate,
          guests: booking?.guests,
          totalNight: booking?.totalNight,
          cleaningCharge: booking?.cleaningCharge,
          confirmationCode: booking?.confirmationCode,
          confirmedAt: booking?.confirmedAt,
          extraGuestCharge: booking?.extraGuestCharge,
          totalGuestFee: booking?.totalGuestFee,
          totalHostFee: booking?.totalHostFee,
          totalPrice: booking?.totalPrice,
          totalDiscount: booking?.totalDiscount,
          discountType: booking?.discountType,
          bookingStatus: booking?.bookingStatus,
          bookingType: booking?.bookingType,
          paymentStatus: booking?.paymentStatus,
          acceptedAt: booking?.acceptedAt,
          expiredAt: booking?.expiredAt,
          declinedAt: booking?.declinedAt,

          declinedBy: booking?.declinedBy,
          property: propertyData,
          currency: booking?.currency,
          host: booking?.host,
          guest: booking?.guest,
          reviews: booking.reviews,
          payment: booking.payment,
          conversationBooking: booking.conversationBooking,

          guestStatus,
          reviewDeadline,
          canReview,
          createdAt: booking?.createdAt,
          updatedAt: booking?.updatedAt,
        };
      });

      res.status(200).json(bookingsData);
    } catch (error) {
      console.log('Host Booking Error', error);
    }
  },

  async getReceiptData(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const bookingId = req.params.bookingId;
      const lang = (req.query.lang || 'en').trim();

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId, guestId: req.user.id },
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
              propertyDescription: {
                include: {
                  propertyDescriptionTranslation: true,
                },
              },
              propertyImages: { orderBy: { serial: 'asc' } },
            },
          },
          cancellationPolicy: {
            include: {
              cancellationPolicyTranslation: true,
            },
          },
          currency: true,
          host: true,
          guest: true,
          reviews: true,
          payment: true,
          conversationBooking: true,
        },
      });

      const propertyDesc = findTranslation(booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
      const translatedCancellationPolicy = findTranslation(booking?.cancellationPolicy?.cancellationPolicyTranslation, lang);

      const propertyData = {
        id: booking?.property?.id,
        name: propertyDesc?.name,
        images: booking?.property?.propertyImages,
        address: booking?.property?.propertyAddress,
      };

      const cancellationPolicy = {
        id: booking?.cancellationPolicy?.id,
        afterDayPriorRefund: booking?.cancellationPolicy?.afterDayPriorRefund,
        beforeDayPriorRefund: booking?.cancellationPolicy?.beforeDayPriorRefund,
        beforeDays: booking?.cancellationPolicy?.beforeDays,
        name: translatedCancellationPolicy?.name,
        description: translatedCancellationPolicy?.description,
      };

      const bookingData = {
        id: booking?.id,
        startDate: booking?.startDate,
        endDate: booking?.endDate,
        guests: booking?.guests,
        totalNight: booking?.totalNight,
        cleaningCharge: booking?.cleaningCharge,
        extraGuestCharge: booking?.extraGuestCharge,
        totalGuestFee: booking?.totalGuestFee,
        totalHostFee: booking?.totalHostFee,
        totalPrice: booking?.totalPrice,
        totalDiscount: booking?.totalDiscount,
        discountType: booking?.discountType,
        bookingStatus: booking?.bookingStatus,
        bookingType: booking?.bookingType,
        paymentStatus: booking?.paymentStatus,
        acceptedAt: booking?.acceptedAt,
        expiredAt: booking?.expiredAt,
        declinedAt: booking?.declinedAt,

        declinedBy: booking?.declinedBy,
        property: propertyData,
        currency: booking?.currency,
        host: booking?.host,
        guest: booking?.guest,
        cancellationPolicy: cancellationPolicy,
        reviews: booking.reviews,
        payment: booking.payment,
        conversationBooking: booking.conversationBooking,
        createdAt: booking?.createdAt,
        updatedAt: booking?.updatedAt,
      };

      res.status(200).json(bookingData);
    } catch (error) {}
  },

  async preApproveBooking(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { bookingId, conversationBookingId } = req.body;

    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'ACCEPTED',
          acceptedAt: new Date(),
          expiredAt: addHours(new Date(), 24),
        },
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

      if (booking) {
        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId,
            senderId: req.user.id,
            text: `Pre-approval sent · ${formatGuestSummary(booking.guests)}, ${format(booking.startDate, 'MMM dd')} - ${format(booking.endDate, 'MMM dd, yyyy')}`,
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
      await logActivity(req, req.user.id, 'Booking Pre-Approved', {
        details: `Booking ID: ${booking.id} was pre-approved by ${req.user.name} (User ID: ${req.user.id}), accepted at ${booking.acceptedAt} for dates ${format(
          booking.startDate,
          'MMM dd',
        )} - ${format(booking.endDate, 'MMM dd, yyyy')}.`,
      });

      // Notification for Host
      const notificationData = {
        title: 'Your booking request was pre-approved!',
        body: `Good news! ${booking?.host?.name} has pre-approved your booking request for "${booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name}".`,
        link: `/guest/bookings/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.guest?.id, fcmToken: booking?.guest?.fcmToken, notificationData });

      // Send Email to Guest
      await sendEmailWithRetry({
        to: booking?.guest?.email,
        subject: 'Your booking request was pre-approved!',
        templateName: 'bookingPreApprovedGuest',
        data: {
          guestName: booking?.guest?.name,
          hostName: booking?.host?.name,
          propertyName: booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name,
          bookingId: booking?.id,
          checkIn: format(booking.startDate, 'dd/MM/yyyy'),
          checkOut: format(booking.endDate, 'dd/MM/yyyy'),
          expiresAt: format(booking?.expiredAt, 'dd/MM/yyyy'),
        },
      });

      res.status(200).json({ message: 'Booking Pre-approved', booking });
    } catch (error) {
      console.error('Pre-approve Booking Failed:', error);
      res.status(500).json({ error: 'Failed to Pre-approve Booking' });
    }
  },

  async withdrawPreApproveBooking(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { bookingId, conversationBookingId } = req.body;
    console.log('bookingId', bookingId);
    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'PENDING',
          acceptedAt: null,
          expiredAt: null,
        },
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

      if (booking) {
        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId,
            senderId: req.user.id,
            text: `Pre-approval withdrawn`,
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
      await logActivity(req, req.user.id, 'Pre-Approval Withdrawn', {
        details: `Pre-approval for booking ID: ${booking.id} was withdrawn by ${req.user.name} (User ID: ${req.user.id}).`,
      });

      // Notification for Host
      const notificationData = {
        title: 'Pre-approval withdrawn',
        body: `The host (${booking?.host?.name}) has withdrawn the pre-approval for your booking request at "${booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name}".`,
        link: `/guest/bookings/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.guest?.id, fcmToken: booking?.guest?.fcmToken, notificationData });

      // Send Email to Guest
      await sendEmailWithRetry({
        to: booking?.guest?.email,
        subject: 'Pre-approval withdrawn by host',
        templateName: 'bookingPreApprovalWithdrawnGuest',
        data: {
          guestName: booking?.guest?.name,
          hostName: booking?.host?.name,
          propertyName: booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name,
          bookingId: booking?.id,
          checkIn: format(booking.startDate, 'dd/MM/yyyy'),
          checkOut: format(booking.endDate, 'dd/MM/yyyy'),
        },
      });

      res.status(200).json({ message: 'Withdraw Pre-approve booking', booking });
    } catch (error) {
      console.error('Withdraw Pre-approve Booking error:', error);
      res.status(500).json({ error: 'Failed to Withdraw Pre-approve Booking' });
    }
  },

  // TODO: Email & Notification
  async sendSpecialOffer(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { propertyId, bookingId, price, nights, startDate, guestFee, totalNight, hostFee, endDate, guests, cleaningCharge, extraGuestCharge, conversationBookingId, cancellationPolicyId } = req.body;

    try {
      const getBooking = await prisma.booking.findFirst({
        where: { id: bookingId },
      });
      let booking;
      let isUpdate;
      if (getBooking.propertyId == propertyId) {
        isUpdate = true;
        booking = await prisma.booking.update({
          where: { id: bookingId, propertyId },
          data: {
            bookingStatus: 'ACCEPTED',
            acceptedAt: new Date(),
            expiredAt: addHours(new Date(), 24),
            specialOffer: {
              create: {
                propertyId,
                guests,
                startDate,
                endDate,
                totalNight,
                price,
                guestFee,
                hostFee,
                expiredAt: addHours(new Date(), 24),
              },
            },
          },
          include: {
            guest: true,
            host: true,
            currency: true,
            specialOffer: true,
            property: {
              include: {
                propertyDescription: {
                  include: { propertyDescriptionTranslation: true },
                },
              },
            },
          },
        });
      } else {
        isUpdate = false;
        booking = await prisma.booking.create({
          data: {
            property: {
              connect: { id: propertyId },
            },
            currency: {
              connect: { id: getBooking.currencyId },
            },
            host: {
              connect: { id: getBooking.hostId },
            },
            guest: {
              connect: { id: getBooking.guestId },
            },

            // propertyId, bookingId, price, startDate, guestFee, totalNight, hostFee, endDate, guests, conversationBookingId

            startDate,
            endDate,
            guests,
            totalNight,
            totalPrice: price,
            totalGuestFee: guestFee,
            totalHostFee: hostFee,
            cleaningCharge,
            extraGuestCharge,
            bookingType: 'REQUEST',
            exchangeRateToBase: getBooking.exchangeRateToBase,
            exchangeRatePropertyToBase: getBooking.exchangeRatePropertyToBase,
            cancellationPolicy: {
              connect: { id: cancellationPolicyId },
            },
            bookingDates: {
              create: nights.map((n) => ({
                date: new Date(n.date),
                price: n.price,
              })),
            },
            bookingStatus: 'ACCEPTED',
            acceptedAt: new Date(),
            expiredAt: addHours(new Date(), 24),
            specialOffer: {
              create: {
                propertyId,
                guests,
                startDate,
                endDate,
                totalNight,
                price,
                guestFee,
                hostFee,
                expiredAt: addHours(new Date(), 24),
              },
            },
          },
          include: {
            guest: true,
            host: true,
            currency: true,
            specialOffer: true,
            property: {
              include: {
                propertyDescription: {
                  include: { propertyDescriptionTranslation: true },
                },
              },
            },
          },
        });
      }

      if (booking && isUpdate) {
        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId,
            senderId: req.user.id,
            text: `Special offer sent · ${formatGuestSummary(guests)}, ${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`,
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

      let conversation;
      if (booking && !isUpdate) {
        // 2️⃣ Find or create Conversation (per property per guest)
        conversation = await prisma.conversation.findFirst({
          where: {
            propertyId,
            participants: { some: { userId: getBooking.guestId } }, // only find conversation this guest is part of
          },
          include: { participants: true },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              propertyId,
              participants: {
                create: [
                  { userId: getBooking.guestId, role: 'GUEST' },
                  { userId: getBooking.hostId, role: 'HOST' },
                ],
              },
            },
            include: { participants: true },
          });
        } else {
          // 3️⃣ Ensure participants exist
          const existingUserIds = conversation.participants.map((p) => p.userId);
          const toAdd = [];
          if (!existingUserIds.includes(getBooking.guestId)) toAdd.push({ userId: getBooking.guestId, role: 'GUEST' });
          if (!existingUserIds.includes(getBooking.hostId)) toAdd.push({ userId: getBooking.hostId, role: 'HOST' });
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

        const systemMessageForPreviousConversation = await prisma.conversationMessage.create({
          data: {
            conversationBookingId,
            senderId: req.user.id,
            text: `${req.user.name} sent you a special offer to another conversation.`,
            type: 'SYSTEM',
          },
          include: {
            conversationBooking: {
              include: { conversation: true },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: systemMessageForPreviousConversation.conversationBooking.conversationId },
          data: {
            lastMessageId: systemMessageForPreviousConversation.id,
            lastMessageAt: systemMessageForPreviousConversation.createdAt,
          },
        });

        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId: conversationBooking.id,
            senderId: getBooking.hostId,
            text: `Special offer sent · ${formatGuestSummary(guests)}, ${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`,
            type: 'SYSTEM',
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageId: systemMessage.id,
            lastMessageAt: systemMessage.createdAt,
          },
        });
      }

      // Activity log
      await logActivity(req, req.user.id, 'Special Offer Sent', {
        details: `A special offer was sent by ${req.user.name} (User ID: ${req.user.id}) for property ID: ${propertyId}, booking ID: ${bookingId}. 
                  Offer details — Price: ${price}, Nights: ${totalNight}, Guest Fee: ${guestFee}, Host Fee: ${hostFee}, Dates: ${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}.`,
      });

      // Notification for Host
      const notificationData = {
        title: 'Special offer received',
        body: `The host (${req.user.name}) has sent you a special offer for "${booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name}".`,
        link: `/guest/bookings/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.guest?.id, fcmToken: booking?.guest?.fcmToken, notificationData });
      console.log('$BOOKING', booking);
      // Send Email to Guest
      await sendEmailWithRetry({
        to: booking?.guest?.email,
        subject: "You've received a special offer!",
        templateName: 'bookingSpecialOfferGuest',
        data: {
          guestName: booking?.guest?.name,
          hostName: booking?.host?.name,
          propertyName: booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name,
          bookingId: booking?.id,
          checkIn: format(booking.startDate, 'dd/MM/yyyy'),
          checkOut: format(booking.endDate, 'dd/MM/yyyy'),
          price: convertAndFormatBookedCurrency({
            orderCurrency: booking?.currency,
            exchangeRateToBase: parseFloat(booking?.exchangeRateToBase),
            exchangeRatePropertyToBase: parseFloat(booking?.exchangeRatePropertyToBase),
            price: (parseFloat(booking?.specialOffer?.price) + parseFloat(booking?.specialOffer?.guestFee)).toFixed(2),
          }),
          totalNight: booking?.totalNight,
        },
      });

      res.status(200).json({ message: 'Special offer sent', booking });
    } catch (error) {
      console.error('Confirm Booking error:', error);
      res.status(500).json({ error: 'Failed to Confirm Booking' });
    }
  },

  async withdrawSpecialOffer(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bookingId, conversationBookingId } = req.body;

    try {
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'ACCEPTED',
          expiredAt: null,
          specialOffer: {
            delete: true,
          },
        },
      });

      if (booking) {
        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId,
            senderId: req.user.id,
            text: `Special offer withdrawn`,
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
      await logActivity(req, req.user.id, 'Special Offer Withdrawn', {
        details: `A special offer for booking ID: ${bookingId} was withdrawn by ${req.user.name} (User ID: ${req.user.id}).`,
      });
      res.status(200).json({ message: 'Special offer withdrawn', booking });
    } catch (error) {
      console.error('Confirm Booking error:', error);
      res.status(500).json({ error: 'Failed to Confirm Booking' });
    }
  },

 // TODO: Email & Notification
  async addReview(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { senderId, receiverId, bookingId, propertyId, message, secretFeedback, houseRules, cleanliness, communication } = req.body;
    try {
      const review = await prisma.reviews.create({
        data: {
          senderId,
          receiverId,
          bookingId: bookingId,
          propertyId: propertyId,
          message,
          secretFeedback,
          ratings: {
            create: [
              { category: 'houseRules', score: houseRules ? Number(houseRules) : 0 },
              { category: 'cleanliness', score: cleanliness ? Number(cleanliness) : 0 },
              { category: 'communication', score: communication ? Number(communication) : 0 },
            ],
          },
        },
        include: {
          ratings: true,
          reviewReceiver: true,
        },
      });

      // Compute overallRating
      const totalScore = review.ratings.reduce((sum, r) => sum + Number(r.score), 0);
      const overallRating = Math.round(totalScore / review.ratings.length);

      // Update the review with overallRating
      await prisma.reviews.update({
        where: { id: review.id },
        data: { overallRating },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Review Submitted by host', {
        details: `A new review was added by ${req.user.name} (User ID: ${req.user.id}) for property ID: ${propertyId}, to ${review?.reviewReceiver?.name} (Receiver ID: ${receiverId}), booking ID: ${bookingId}. Overall rating: ${overallRating}/5.`,
      });
      res.status(200).json({ message: 'Review add successfully', review });
    } catch (error) {
      console.error('Add Review error:', error);
      res.status(500).json({ error: 'Failed to Add Review' });
    }
  },

  async getReviewsAboutYou(req, res) {
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
      const totalReviews = await prisma.reviews.count({
        where: { receiverId: req.user.id },
      });

      // Get paginated reviews
      const reviews = await prisma.reviews.findMany({
        where: { receiverId: req.user.id },
        include: {
          reviewSender: true,
          reviewReceiver: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      });

      res.status(200).json({
        data: reviews,
        pagination: {
          total: totalReviews,
          page: Number(page),
          totalPages: Math.ceil(totalReviews / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Getting About You Review error:', error);
      res.status(500).json({ error: 'Failed to get reviews' });
    }
  },

  async getReviewsByYou(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { page = 1 } = req.query;
      const limit = 10;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Get total count for pagination
      const totalReviews = await prisma.reviews.count({
        where: { senderId: req.user.id },
      });

      const reviews = await prisma.reviews.findMany({
        where: { senderId: req.user.id },
        include: {
          reviewSender: true,
          reviewReceiver: true,
        },
        orderBy: {
          createdAt: 'desc',
        },

        skip,
        take,
      });

      res.status(200).json({
        data: reviews,
        pagination: {
          total: totalReviews,
          page: Number(page),
          totalPages: Math.ceil(totalReviews / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Getting About You Review error:', error);
      res.status(500).json({ error: 'Failed to Getting About You Review' });
    }
  },

  // TODO: Email & Notification
  async addPublicResponse(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { publicResponse, id } = req.body;

      const pubResponse = await prisma.reviews.update({
        where: { id },
        data: {
          publicResponse,
          publicResponseDate: new Date(),
        },
        include: {
          reviewSender: true,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Public Response Added', {
        details: `A public response was added by ${req.user.name} (User ID: ${req.user.id}) to  ${pubResponse.reviewSender.name} (Receiver ID: ${pubResponse.senderId}). Review ID: ${id}"`,
      });
      res.status(200).json({ message: 'Public response added successfully', review: pubResponse });
    } catch (error) {
      console.error('Add Public Response error:', error);
      res.status(500).json({ error: 'Failed to Add Public Response' });
    }
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
          declinedBy: 'Host',
        },
      });

      if (booking) {
        // 5️⃣ Insert SYSTEM + USER messages
        const systemMessage = await prisma.conversationMessage.create({
          data: {
            conversationBookingId,
            senderId: req.user.id,
            text: `Booking request declined by Host`,
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

      // Notification for Guest
      const notificationData = {
        title: 'Booking request declined',
        body: `Your booking request for "${booking?.property?.propertyDescription?.propertyDescriptionTranslation[0]?.name}" has been declined by the host (${booking?.host?.name}).`,
        link: `/guest/bookings/${booking.id}`,
      };

      await sendUserNotification({ userId: booking?.guest?.id, fcmToken: booking?.guest?.fcmToken, notificationData });

      // Send Email to Guest
      await sendEmailWithRetry({
        to: booking?.guest?.email,
        subject: 'Your booking request has been declined',
        templateName: 'bookingDeclinedByHost',
        data: {
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
