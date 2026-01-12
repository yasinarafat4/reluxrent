const prisma = require('../config/prisma'); // or use Sequelize
const { format, startOfDay, addDays, isAfter, isBefore, differenceInDays } = require('date-fns');
const { findTranslation } = require('../helpers/findTranslation');
const { convertDecimals } = require('../helpers/convertDecimals');
const { checkAvailability } = require('../helpers/checkAvailability');
const { getUserRatings } = require('../helpers/getUserRatings');
const { getGuestStatus } = require('../helpers/getGuestStatus');

module.exports = {
  async getConversations(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch conversations where user is a participant
      const conversations = await prisma.conversation.findMany({
        where: { participants: { some: { userId: req.user.id } } },
        select: {
          id: true,
          lastMessageAt: true,
          conversationbookings: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              booking: {
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
                },
              },
              messages: {
                orderBy: { createdAt: 'asc' },
                select: {
                  id: true,
                  text: true,
                  metadata: true,
                  type: true,
                  createdAt: true,
                  updatedAt: true,
                  sender: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      phone: true,
                      fcmToken: true,
                    },
                  },
                  reads: true,
                },
              },
            },
          },
          participants: {
            select: {
              participant: {
                select: {
                  id: true,
                  name: true,
                  dob: true,
                  email: true,
                  fcmToken: true,
                  image: true,
                  phone: true,
                },
              },
            },
          },
          lastMessage: {
            select: {
              text: true,
              type: true,
              createdAt: true,
            },
          },
          property: {
            select: {
              id: true,
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
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      const conversationsData = conversations.map((conv) => {
        const otherParticipants = conv.participants.filter((p) => p.participant.id !== req.user.id).map((p) => p.participant);
        const lastBooking = conv.conversationbookings[0] || null;
        const translatedDescriptions = findTranslation(conv.property.propertyDescription.propertyDescriptionTranslation, lang);
        const property = {
          id: conv.property.id,
          propertyDescription: {
            name: translatedDescriptions?.name,
          },
          propertyImages: conv.property.propertyImages,
        };
        return {
          conversationId: conv.id,
          conversationBookingId: lastBooking ? lastBooking?.id : null,
          property: property,
          participants: otherParticipants,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          lastBooking: lastBooking?.booking,
        };
      });

      res.json(conversationsData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getMessagesWithUser(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { conversationId } = req.params; // ID of the user you selected
      if (!conversationId) return res.status(400).json({ error: 'conversationId is required' });

      // Fetch conversation with bookings and messages
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: {
          id: true,
          conversationbookings: {
            orderBy: { createdAt: 'asc' }, // latest first
            select: {
              id: true,
              booking: {
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
                  reviews: true,
                  property: {
                    select: {
                      id: true,
                      slug: true,
                      bookType: true,
                      bookingType: true,
                      accommodates: true,
                      status: true,
                      isApproved: true,
                      propertyAddress: {
                        select: {
                          addressLine1: true,
                          addressLine2: true,
                        },
                      },
                      propertyType: {
                        select: {
                          id: true,
                          propertyTypeTranslation: {
                            select: {
                              locale: true,
                              name: true,
                            },
                          },
                        },
                      },
                      spaceType: {
                        select: {
                          id: true,
                          spaceTypeTranslation: {
                            select: {
                              locale: true,
                              name: true,
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
                  specialOffer: {
                    where: {
                      status: 'PENDING',
                    },
                  },
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
                },
              },
              messages: {
                orderBy: { createdAt: 'asc' },
                select: {
                  id: true,
                  text: true,
                  metadata: true,
                  type: true,
                  createdAt: true,
                  updatedAt: true,
                  sender: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      phone: true,
                      fcmToken: true,
                    },
                  },
                  reads: true,
                },
              },
            },
          },
          participants: {
            select: {
              participant: {
                select: {
                  id: true,
                  name: true,
                  dob: true,
                  email: true,
                  fcmToken: true,
                  image: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Flatten all messages across ConversationBookings
      let allMessages = [];
      conversation.conversationbookings.forEach((convBooking) => {
        convBooking.messages.forEach((msg) => {
          allMessages.push({
            id: msg.id,
            text: msg.text,
            metadata: msg.metadata,
            type: msg.type,
            sender: msg.sender,
            reads: msg.reads,
            createdAt: msg.createdAt,
          });
        });
      });

      // Group messages by date
      const grouped = {};
      allMessages.forEach((msg) => {
        const dateKey = format(msg.createdAt, 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(msg);
      });

      const otherParticipants = conversation.participants.filter((p) => p.participant.id !== req.user.id).map((p) => p.participant);
      // Check availability using last booking
      const lastBooking = conversation.conversationbookings.length > 0 ? conversation.conversationbookings[conversation.conversationbookings.length - 1] : null;
      const { isAvailable } = await checkAvailability(lastBooking?.booking);

      // ---------------- Guest and Host Overall Ratings ----------------
      const { guestOverallRating, guestReviewCount, guestTripsCount, guestCategoryRatings, hostOverallRating, hostReviewCount, hostCategoryRatings } = await getUserRatings(lastBooking?.booking);

      const { guestStatus, reviewDeadline, canReview, reviewFromGuest, reviewFromHost } = await getGuestStatus(lastBooking?.booking, req.user, isAvailable);

      const translatedDesc = findTranslation(lastBooking?.booking?.property?.propertyDescription?.propertyDescriptionTranslation, lang);
      const translatedCancellationPolicy = findTranslation(lastBooking?.booking?.cancellationPolicy?.cancellationPolicyTranslation, lang);
      const translatedPropertyTypes = findTranslation(lastBooking?.booking?.property?.propertyType?.propertyTypeTranslation, lang);
      const translatedSpaceTypes = findTranslation(lastBooking?.booking?.property?.spaceType?.spaceTypeTranslation, lang);

      const lastBookingData = {
        ...lastBooking?.booking,
        property: {
          id: lastBooking?.booking?.property?.id,
          bookType: lastBooking?.booking?.property?.bookType,
          bookingType: lastBooking?.booking?.property?.bookingType,
          accommodates: lastBooking?.booking?.property?.accommodates,
          propertyAddress: lastBooking?.booking?.property?.propertyAddress,
          propertyType: {
            id: lastBooking?.booking?.property?.propertyType?.id,
            name: translatedPropertyTypes?.name,
          },
          spaceType: {
            id: lastBooking?.booking?.property?.spaceType?.id,
            name: translatedSpaceTypes?.name,
          },
          propertyDescription: {
            name: translatedDesc?.name,
          },
          propertyImages: lastBooking?.booking?.property?.propertyImages,
          propertyPrice: lastBooking?.booking?.property?.propertyPrice,
          isAvailable,
        },
        cancellationPolicy: {
          name: translatedCancellationPolicy?.name,
          description: translatedCancellationPolicy?.description,
        },
      };

      res.json(
        convertDecimals({
          conversationId: conversation.id,
          conversationBookingId: lastBooking?.id,
          messages: grouped,
          participants: otherParticipants,
          lastBooking: lastBookingData,
          guestCategoryRatings,
          hostCategoryRatings,
          guestOverallRating,
          hostOverallRating,
          guestReviewCount,
          hostReviewCount,
          guestTripsCount,
          guestStatus,
          reviewFromGuest,
          reviewFromHost,
          reviewDeadline,
          canReview,
        }),
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },
};
