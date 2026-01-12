const prisma = require('../../config/prisma');
const cheerio = require('cheerio');
const { processImage } = require('../../helpers/uploadFileToStorage');
const fs = require('fs');
const path = require('path');
const { findTranslation, groupTranslationsByLocale } = require('../../helpers/findTranslation');
const { format, addDays } = require('date-fns');
const { sendEmail } = require('../../email/emailService');
const logActivity = require('../../helpers/logActivity');

const stepOrder = ['propertyType', 'spaceType', 'location', 'floorPlan', 'amenities', 'photos', 'descriptions', 'booking', 'price', 'discounts', 'cancellationPolicy'];

const stepSlugMap = {
  propertyType: 'property-type',
  spaceType: 'space-type',
  location: 'location',
  floorPlan: 'floor-plan',
  amenities: 'amenities',
  photos: 'photos',
  descriptions: 'descriptions',
  booking: 'booking-settings',
  price: 'price',
  discounts: 'discounts',
  cancellationPolicy: 'cancellation-policy',
};

module.exports = {
  // Get
  async getListingProperties(req, res) {
    const lang = (req.query.lang || 'en').trim();
    // If no req.user, return Unauthorized
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { page = 1 } = req.query;
      const rawStatus = String(req.query.status || '').trim();
      const limit = 6;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const normalizedStatus = !rawStatus || rawStatus === 'undefined' || rawStatus === 'All' ? null : rawStatus;
      console.log('normalizedStatus', normalizedStatus);

      const whereClause = {
        OR: [
          { hostId: req.user.id },
          {
            coHosts: {
              some: {
                userId: req.user.id,
                status: 'ACCEPTED',
              },
            },
          },
        ],
      };

      if (normalizedStatus) {
        whereClause.status = normalizedStatus;
      }

      const totalListings = await prisma.property.count({
        where: whereClause,
      });

      const listingProperties = await prisma.property.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        select: {
          id: true,
          slug: true,
          bookType: true,
          bookingType: true,
          bedrooms: true,
          bedrooms_data: true,
          bathrooms: true,
          accommodates: true,
          minimumStay: true,
          recommended: true,
          status: true,
          isApproved: true,
          createdAt: true,
          propertySteps: true,
          propertyType: {
            select: {
              id: true,
              icon: true,
              propertyTypeTranslation: {
                select: {
                  locale: true,
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
                select: {
                  locale: true,
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
          amenities: {
            select: {
              id: true,
              icon: true,
              amenitiesTranslation: {
                select: {
                  locale: true,
                  name: true,
                  description: true,
                },
              },
              amenitiesType: {
                select: {
                  amenitiesTypeTranslation: {
                    select: {
                      locale: true,
                      name: true,
                    },
                  },
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
          propertyRulesAndManual: {
            select: {
              startCheckInTime: true,
              endCheckInTime: true,
              checkOutTime: true,
              quietHours: true,
              startQuietHoursTime: true,
              endQuietHoursTime: true,
              smokingAllowed: true,
              commercialAllowed: true,
              eventsAllowed: true,
              guest: true,
              wifiName: true,
              wifiPassword: true,
              propertyRulesAndManualTranslation: {
                select: {
                  locale: true,
                  additionalRules: true,
                  directions: true,
                  houseManual: true,
                },
              },
            },
          },
          checkInOutInstruction: {
            select: {
              // Check-in instructions
              smartLock: true,
              smartLockInstruction: true,
              keypad: true,
              keypadInstruction: true,
              lockbox: true,
              lockboxInstruction: true,
              buildingStaff: true,
              buildingStaffInstruction: true,
              inPersonGreeting: true,
              inPersonGreetingInstruction: true,
              other: true,
              otherInstruction: true,

              // Check-out instructions
              gatherUsedTowels: true,
              gatherUsedTowelsInstruction: true,
              throwTrashAway: true,
              throwTrashAwayInstruction: true,
              turnThingsOff: true,
              turnThingsOffInstruction: true,
              lockUp: true,
              lockUpInstruction: true,
              returnKeys: true,
              returnKeysInstruction: true,
              additionalRequests: true,
              additionalRequestsInstruction: true,
            },
          },
          cancellationPolicy: {
            select: {
              id: true,
              beforeDays: true,
              beforeDayPriorRefund: true,
              afterDayPriorRefund: true,
              cancellationPolicyTranslation: {
                select: {
                  locale: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          host: {
            select: {
              id: true,
              name: true,
              preferredName: true,
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
              guestFee: true,
              hostFee: true,
              isVerified: true,
              isBanned: true,
              isDeactivated: true,
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
              // exchangeRateToBase: true,
              // exchangeRatePropertyToBase: true,
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
              reviewSender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  fcmToken: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      const listingPropertiesData = listingProperties.map((property) => {
        const steps = property?.propertySteps;
        let nextStep = 'property-type';
        if (steps) {
          for (let i = 0; i < stepOrder.length; i++) {
            const step = stepOrder[i];
            if (!steps[step]) {
              nextStep = stepSlugMap[step];
              break;
            }
          }
        }
        const allStepsCompleted = Object.values(steps || {})
          .filter((value) => typeof value === 'boolean')
          .every(Boolean);

        const totalBedsCount = property?.bedrooms_data?.reduce((total, bedroom) => {
          return total + bedroom.beds.reduce((bedTotal, bed) => bedTotal + Number(bed.quantity), 0);
        }, 0);

        const dateWisePrices = property?.propertyDates?.reduce((acc, dateEntry) => {
          const dateStr = format(dateEntry.date, 'yyyy-MM-dd'); // format date to YYYY-MM-DD
          acc[dateStr] = {
            price: dateEntry.price || property?.propertyPrice?.price,
            status: dateEntry.status,
          };
          return acc;
        }, {});

        const filteredReviews = property.reviews?.filter((r) => r.senderId !== property.host.id) || [];
        const overallRating = filteredReviews.length ? parseFloat((filteredReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) / filteredReviews.length).toFixed(1)) : null;
        const reviewCount = filteredReviews.length;

        const translatedDescriptions = findTranslation(property?.propertyDescription?.propertyDescriptionTranslation, lang);
        const translatedPropertyTypes = findTranslation(property?.propertyType?.propertyTypeTranslation, lang);
        const translatedSpaceTypes = findTranslation(property?.spaceType?.spaceTypeTranslation, lang);
        const translatedCancellationPolicies = findTranslation(property?.cancellationPolicy?.cancellationPolicyTranslation, lang);
        const translatedPropertyRulesAndManuals = findTranslation(property?.propertyRulesAndManual?.propertyRulesAndManualTranslation, lang);
        return {
          ...property,
          nextStep,
          allStepsCompleted,
          propertyType: {
            id: property?.propertyType?.id,
            icon: property?.propertyType?.icon,
            name: translatedPropertyTypes?.name,
            description: translatedPropertyTypes?.description,
          },
          spaceType: {
            id: property?.spaceType?.id,
            icon: property?.spaceType?.icon,
            name: translatedSpaceTypes?.name,
            description: translatedSpaceTypes?.description,
          },
          propertyDescription: {
            name: translatedDescriptions?.name,
            description: translatedDescriptions?.description,
            aboutPlace: translatedDescriptions?.aboutPlace,
            placeIsGreatFor: translatedDescriptions?.placeIsGreatFor,
            guestCanAccess: translatedDescriptions?.guestCanAccess,
            interactionGuests: translatedDescriptions?.interactionGuests,
            aboutNeighborhood: translatedDescriptions?.aboutNeighborhood,
            getAround: translatedDescriptions?.getAround,
          },
          amenities: property?.amenities.map((aminity) => {
            const translatedAmenities = findTranslation(aminity?.amenitiesTranslation, lang);
            const translatedAmenityTypes = findTranslation(aminity?.amenitiesType?.amenitiesTypeTranslation, lang);

            return {
              id: aminity?.id,
              icon: aminity?.icon,
              name: translatedAmenities?.name,
              description: translatedAmenities?.description,
              type: translatedAmenityTypes?.name,
            };
          }),
          propertyRulesAndManual: {
            startCheckInTime: property?.propertyRulesAndManual?.startCheckInTime,
            endCheckInTime: property?.propertyRulesAndManual?.endCheckInTime,
            checkOutTime: property?.propertyRulesAndManual?.checkOutTime,
            quietHours: property?.propertyRulesAndManual?.quietHours,
            startQuietHoursTime: property?.propertyRulesAndManual?.startQuietHoursTime,
            endQuietHoursTime: property?.propertyRulesAndManual?.endQuietHoursTime,
            smokingAllowed: property?.propertyRulesAndManual?.smokingAllowed,
            commercialAllowed: property?.propertyRulesAndManual?.commercialAllowed,
            eventsAllowed: property?.propertyRulesAndManual?.eventsAllowed,
            guest: property?.propertyRulesAndManual?.guest,
            wifiName: property?.propertyRulesAndManual?.wifiName,
            wifiPassword: property?.propertyRulesAndManual?.wifiPassword,

            additionalRules: translatedPropertyRulesAndManuals?.additionalRules,
            directions: translatedPropertyRulesAndManuals?.directions,
            houseManual: translatedPropertyRulesAndManuals?.houseManual,
          },
          cancellationPolicy: {
            id: property?.cancellationPolicy?.id,
            beforeDays: property?.cancellationPolicy?.beforeDays,
            beforeDayPriorRefund: property?.cancellationPolicy?.beforeDayPriorRefund,
            afterDayPriorRefund: property?.cancellationPolicy?.afterDayPriorRefund,

            name: translatedCancellationPolicies?.name,
            description: translatedCancellationPolicies?.description,
          },
          beds: totalBedsCount,
          dateWisePrices,
          overallRating,
          reviewCount,
          reviews: filteredReviews,
        };
      });

      res.status(200).json({
        data: listingPropertiesData,
        pagination: {
          total: totalListings,
          page: Number(page),
          totalPages: Math.ceil(totalListings / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Properties fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Properties' });
    }
  },

  async getPropertiesByHost(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const hostId = req.params.hostId;

      const properties = await prisma.property.findMany({
        where: {
          hostId,
          status: 'Listed',
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          slug: true,
          bookType: true,
          bookingType: true,
          bedrooms: true,
          bedrooms_data: true,
          bathrooms: true,
          accommodates: true,
          minimumStay: true,
          recommended: true,
          status: true,
          isApproved: true,
          createdAt: true,
          propertyType: {
            select: {
              id: true,
              icon: true,
              propertyTypeTranslation: {
                select: {
                  locale: true,
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
                select: {
                  locale: true,
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
          amenities: {
            select: {
              id: true,
              icon: true,
              amenitiesTranslation: {
                select: {
                  locale: true,
                  name: true,
                  description: true,
                },
              },
              amenitiesType: {
                select: {
                  amenitiesTypeTranslation: {
                    select: {
                      locale: true,
                      name: true,
                    },
                  },
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
          propertyRulesAndManual: {
            select: {
              startCheckInTime: true,
              endCheckInTime: true,
              checkOutTime: true,
              quietHours: true,
              startQuietHoursTime: true,
              endQuietHoursTime: true,
              smokingAllowed: true,
              commercialAllowed: true,
              eventsAllowed: true,
              guest: true,
              wifiName: true,
              wifiPassword: true,
              propertyRulesAndManualTranslation: {
                select: {
                  locale: true,
                  additionalRules: true,
                  directions: true,
                  houseManual: true,
                },
              },
            },
          },
          checkInOutInstruction: {
            select: {
              // Check-in instructions
              smartLock: true,
              smartLockInstruction: true,
              keypad: true,
              keypadInstruction: true,
              lockbox: true,
              lockboxInstruction: true,
              buildingStaff: true,
              buildingStaffInstruction: true,
              inPersonGreeting: true,
              inPersonGreetingInstruction: true,
              other: true,
              otherInstruction: true,

              // Check-out instructions
              gatherUsedTowels: true,
              gatherUsedTowelsInstruction: true,
              throwTrashAway: true,
              throwTrashAwayInstruction: true,
              turnThingsOff: true,
              turnThingsOffInstruction: true,
              lockUp: true,
              lockUpInstruction: true,
              returnKeys: true,
              returnKeysInstruction: true,
              additionalRequests: true,
              additionalRequestsInstruction: true,
            },
          },
          cancellationPolicy: {
            select: {
              id: true,
              beforeDays: true,
              beforeDayPriorRefund: true,
              afterDayPriorRefund: true,
              cancellationPolicyTranslation: {
                select: {
                  locale: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          host: {
            select: {
              id: true,
              name: true,
              preferredName: true,
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
              guestFee: true,
              hostFee: true,
              isVerified: true,
              isBanned: true,
              isDeactivated: true,
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
              reviewSender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  fcmToken: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      if (properties.length === 0) {
        return res.status(404).json({ error: 'No Property found' });
      }

      const propertiesData = properties
        .map((property) => {
          const translatedDescriptions = findTranslation(property?.propertyDescription?.propertyDescriptionTranslation, lang);
          const translatedPropertyTypes = findTranslation(property?.propertyType?.propertyTypeTranslation, lang);
          const translatedSpaceTypes = findTranslation(property?.spaceType?.spaceTypeTranslation, lang);
          const translatedCancellationPolicies = findTranslation(property?.cancellationPolicy?.cancellationPolicyTranslation, lang);

          const amenities = property?.amenities?.map((amenity) => {
            const amenityTrans = findTranslation(amenity?.amenitiesTranslation, lang);
            return {
              id: amenity.id,
              icon: amenity.icon,
              name: amenityTrans.name,
              description: amenityTrans.description,
            };
          });

          const dateWisePrices = property?.propertyDates?.reduce((acc, dateEntry) => {
            const dateStr = format(dateEntry.date, 'yyyy-MM-dd'); // format date to YYYY-MM-DD
            acc[dateStr] = {
              price: dateEntry.price || property?.propertyPrice?.price,
              status: dateEntry.status,
            };
            return acc;
          }, {});

          return {
            id: property?.id,
            createdAt: property?.createdAt,
            accommodates: property?.accommodates,
            bookType: property?.bookType,
            bookingType: property?.bookingType,
            checkInAfter: property?.checkInAfter,
            checkOutBefore: property?.checkOutBefore,
            cancellationPolicy: {
              id: property?.cancellationPolicy?.id,
              beforeDays: property?.cancellationPolicy?.beforeDays,
              beforeDayPriorRefund: property?.cancellationPolicy?.beforeDayPriorRefund,
              afterDayPriorRefund: property?.cancellationPolicy?.afterDayPriorRefund,

              name: translatedCancellationPolicies?.name,
              description: translatedCancellationPolicies?.description,
            },
            minimumStay: property?.minimumStay,
            bedrooms: property?.bedrooms,
            bathrooms: property?.bathrooms,
            status: property?.status,
            propertyType: translatedPropertyTypes,
            spaceType: translatedSpaceTypes,
            amenities: amenities,
            propertyDescription: translatedDescriptions,
            propertyPrice: property?.propertyPrice,
            isApproved: property?.isApproved,
            recommended: property?.recommended,
            address: property?.propertyAddress || null,
            images: property?.propertyImages || null,
            bookings: property?.bookings,
            dateWisePrices,
          };
        })
        .filter(Boolean);

      res.json(propertiesData);
    } catch (error) {
      console.error('Properties fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Properties' });
    }
  },

  async getCountries(req, res) {
    try {
      const countriesData = await prisma.country.findMany({
        where: {
          status: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json(countriesData);
    } catch (error) {
      console.error('Countries fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch countries' });
    }
  },

  async getStatesByCountry(req, res) {
    try {
      const countryId = parseInt(req.params.countryId);

      if (isNaN(countryId)) {
        return res.status(400).json({ error: 'Invalid countryId' });
      }

      const statesData = await prisma.state.findMany({
        where: {
          countryId,
          status: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        data: statesData,
      });
    } catch (error) {
      console.error('States fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch states' });
    }
  },

  async getCitiesByState(req, res) {
    try {
      const stateId = parseInt(req.params.stateId);

      if (isNaN(stateId)) {
        return res.status(400).json({ error: 'Invalid stateId' });
      }

      const citiesData = await prisma.city.findMany({
        where: {
          stateId,
          status: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        data: citiesData,
      });
    } catch (error) {
      console.error('Cities fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch cities' });
    }
  },

  async getProperty(req, res) {
    try {
      const id = req.params.id;
      const lang = (req.query.lang || 'en').trim();

      const property = await prisma.property.findUnique({
        where: {
          id,
        },
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
          propertyRulesAndManual: {
            include: {
              propertyRulesAndManualTranslation: true,
            },
          },
          propertyPrice: {
            include: {
              currency: true,
            },
          },
          host: true,
          cancellationPolicy: true,
          checkInOutInstruction: true,
          propertySteps: true,
          propertyImages: { orderBy: { serial: 'asc' } },
          propertyDates: true,
        },
      });
      if (property?.length === 0) {
        return res.status(404).json({ error: 'No Property found' });
      }

      const translatedPropertyDescription = groupTranslationsByLocale(property?.propertyDescription?.propertyDescriptionTranslation || []);
      const translatedPropertyType = findTranslation(property?.propertyType?.propertyTypeTranslation, lang);
      const translatedSpaceType = findTranslation(property?.spaceType?.spaceTypeTranslation, lang);
      const translatedRulesAndManuals = groupTranslationsByLocale(property?.propertyRulesAndManual?.propertyRulesAndManualTranslation || []);

      const propertyRulesAndManual = {
        id: property?.propertyRulesAndManual?.id,
        eventsAllowed: property?.propertyRulesAndManual?.eventsAllowed,
        smokingAllowed: property?.propertyRulesAndManual?.smokingAllowed,
        quietHours: property?.propertyRulesAndManual?.quietHours,
        commercialAllowed: property?.propertyRulesAndManual?.commercialAllowed,
        startQuietHoursTime: property?.propertyRulesAndManual?.startQuietHoursTime,
        endQuietHoursTime: property?.propertyRulesAndManual?.endQuietHoursTime,
        startCheckInTime: property?.propertyRulesAndManual?.startCheckInTime,
        endCheckInTime: property?.propertyRulesAndManual?.endCheckInTime,
        checkOutTime: property?.propertyRulesAndManual?.checkOutTime,
        wifiName: property?.propertyRulesAndManual?.wifiName,
        wifiPassword: property?.propertyRulesAndManual?.wifiPassword,
        rulesAndManuals: translatedRulesAndManuals,
      };

      const amenities = property?.amenities?.map((amenity) => {
        const trans = findTranslation(amenity?.amenitiesTranslation, lang);
        return {
          id: amenity.id,
          icon: amenity.icon,
          name: trans.name,
          description: trans.description,
        };
      });

      const allStepsCompleted = Object.values(property.propertySteps)
        .filter((value) => typeof value === 'boolean')
        .every(Boolean);

      // Process propertyDates to create a dictionary of date-specific prices and statuses
      const dateWisePrices = property?.propertyDates?.reduce((acc, dateEntry) => {
        const dateStr = format(dateEntry.date, 'yyyy-MM-dd'); // format date to YYYY-MM-DD
        acc[dateStr] = {
          price: dateEntry.price || property?.propertyPrice?.price,
          status: dateEntry.status,
        };
        return acc;
      }, {});

      const data = {
        id: property?.id,
        hostId: property?.hostId,
        slug: property?.slug,
        accommodates: property?.accommodates,
        amenities: amenities,
        allStepsCompleted,
        bedrooms: property?.bedrooms,
        bedrooms_data: property?.bedrooms_data,
        bathrooms: property?.bathrooms,
        bookType: property?.bookType,
        bookingType: property?.bookingType,
        minimumStay: property?.minimumStay,
        cancellationPolicyId: property?.cancellationPolicyId,
        cancellationPolicy: property?.cancellationPolicy,
        checkInAfter: property?.checkInAfter,
        checkOutBefore: property?.checkOutBefore,
        propertyRulesAndManual: propertyRulesAndManual,
        isApproved: property?.isApproved,
        propertyTypeId: property?.propertyTypeId,
        propertyType: translatedPropertyType,
        propertyAddress: property?.propertyAddress,
        propertyDates: property?.propertyDates,
        propertyDescription: translatedPropertyDescription,
        propertyImages: property?.propertyImages,
        propertyPrice: property?.propertyPrice,

        checkInOutInstructions: property?.checkInOutInstruction,
        propertySteps: property?.propertySteps,
        recommended: property?.recommended,
        spaceTypeId: property?.spaceTypeId,
        spaceType: translatedSpaceType,
        status: property?.status,
        host: property.host,
        dateWisePrices,
        createdAt: property?.createdAt,
        updatedAt: property?.updatedAt,
      };

      res.json(data);
    } catch (error) {
      console.error('Property fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Property' });
    }
  },

  async getPropertyType(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const propertyTypes = await prisma.propertyType.findMany({
        include: {
          propertyTypeTranslation: true,
        },
        where: {
          status: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      if (propertyTypes.length === 0) {
        return res.status(404).json({ error: 'No Property Types found' });
      }

      const translatedPropertyTypes = propertyTypes
        .map((pType) => {
          let translation = findTranslation(pType.propertyTypeTranslation, lang);
          return translation
            ? {
                id: pType.id,
                icon: pType.icon,
                name: translation.name,
                description: translation.description,
                order: pType.order,
                createdAt: pType.createdAt,
              }
            : null;
        })
        .filter(Boolean);

      if (translatedPropertyTypes.length === 0) {
        return res.status(404).json({ error: 'No translated Property Types found' });
      }

      res.json(translatedPropertyTypes);
    } catch (error) {
      console.error('Property Types fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Property Types' });
    }
  },

  async getSpaceType(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const spaceTypes = await prisma.spaceType.findMany({
        include: {
          spaceTypeTranslation: true,
        },
        where: {
          status: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      if (spaceTypes.length === 0) {
        return res.status(404).json({ error: 'No Space Types found' });
      }

      const translatedSpaceTypes = spaceTypes
        .map((sType) => {
          let translation = findTranslation(sType.spaceTypeTranslation, lang);
          return translation
            ? {
                id: sType.id,
                order: sType.order,
                icon: sType.icon,
                name: translation.name,
                description: translation.description,
                createdAt: sType.createdAt,
              }
            : null;
        })
        .filter(Boolean);

      if (translatedSpaceTypes.length === 0) {
        return res.status(404).json({ error: 'No translated Space Types found' });
      }

      res.json(translatedSpaceTypes);
    } catch (error) {
      console.error('Space Types fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Space Types' });
    }
  },

  async getBedTypes(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const bedTypes = await prisma.bedType.findMany({
        where: {
          status: true,
        },
        orderBy: {
          order: 'asc',
        },
        include: {
          bedTypeTranslation: true,
        },
      });

      if (bedTypes.length === 0) {
        return res.status(404).json({ error: 'No Bed Types found' });
      }

      const translatedBedTypes = bedTypes
        .map((bedType) => {
          let translation = findTranslation(bedType.bedTypeTranslation, lang);
          return translation
            ? {
                id: bedType.id,
                order: bedType.order,
                name: translation.name,
                createdAt: bedType.createdAt,
              }
            : null;
        })
        .filter(Boolean);

      if (translatedBedTypes.length === 0) {
        return res.status(404).json({ error: 'No translated Bed Types found' });
      }

      res.json(translatedBedTypes);
    } catch (error) {
      console.error('Bed Types fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Bed Types' });
    }
  },

  async getAmenities(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const amenities = await prisma.amenities.findMany({
        where: {
          status: true,
        },
        orderBy: {
          order: 'asc',
        },
        include: {
          amenitiesTranslation: true,
          amenitiesType: {
            include: {
              amenitiesTypeTranslation: true,
            },
          },
        },
      });

      if (amenities.length === 0) {
        return res.status(404).json({ error: 'No Amenities found' });
      }

      const translatedAmenities = amenities
        .map((amenity) => {
          let translation = findTranslation(amenity.amenitiesTranslation, lang);
          return translation
            ? {
                id: amenity.id,
                order: amenity.order,
                icon: amenity.icon,
                createdAt: amenity.createdAt,
                name: translation.name,
                description: translation.description,
                amenitiesType: { id: amenity.amenitiesType.id, translations: findTranslation(amenity.amenitiesType.amenitiesTypeTranslation) },
              }
            : null;
        })
        .filter(Boolean);

      if (translatedAmenities.length === 0) {
        return res.status(404).json({ error: 'No translated Amenities Type found' });
      }

      res.json(translatedAmenities);
    } catch (error) {
      console.error('Amenities fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Amenities' });
    }
  },

  async getCancellationPolicy(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const cancellationPolicy = await prisma.cancellationPolicy.findMany({
        include: {
          cancellationPolicyTranslation: true,
        },
      });

      if (cancellationPolicy.length === 0) {
        return res.status(404).json({ error: 'No Cancellation Policy found' });
      }

      const translatedCancellationPolicy = cancellationPolicy
        .map((cPolicy) => {
          console.log('$CPolicy', cPolicy);
          let translation = findTranslation(cPolicy.cancellationPolicyTranslation, lang);
          return translation
            ? {
                id: cPolicy.id,
                createdAt: cPolicy.createdAt,
                name: translation.name,
                description: translation.description,
              }
            : null;
        })
        .filter(Boolean);

      if (translatedCancellationPolicy.length === 0) {
        return res.status(404).json({ error: 'No translated Cancellation Policy found' });
      }

      res.json(translatedCancellationPolicy);
    } catch (error) {
      console.error('Cancellation Policy fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Cancellation Policy' });
    }
  },

  // Create & Update
  async addProperty(req, res) {
    try {
      const { currencyId } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // If user is not a host, update them
      if (!req.user.isHost) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            isHost: true,
            hostAt: new Date(),
          },
        });
      }

      const property = await prisma.property.create({
        data: {
          host: {
            connect: { id: req.user.id },
          },
        },
      });

      await prisma.propertyDescription.create({
        data: {
          property: {
            connect: { id: property.id },
          },
        },
      });

      await prisma.propertyAddress.create({
        data: {
          property: {
            connect: { id: property.id },
          },
        },
      });

      await prisma.propertyPrice.create({
        data: {
          property: {
            connect: { id: property.id },
          },
          currency: {
            connect: { id: currencyId },
          },
        },
      });

      await prisma.propertyRulesAndManual.create({
        data: {
          property: {
            connect: { id: property.id },
          },
        },
      });

      await prisma.checkInOutInstruction.create({
        data: {
          property: {
            connect: { id: property.id },
          },
        },
      });

      await prisma.propertySteps.create({
        data: {
          property: {
            connect: { id: property.id },
          },
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Property Created', {
        details: `Property (ID: ${property?.id}) was created by ${req.user.name} (User ID: ${req.user.id}).`,
      });

      res.status(201).json(property);
    } catch (error) {
      console.error('Error when Creating Property:', error);
      res.status(500).json({ error: 'Failed creating Property' });
    }
  },

  async checkCustomLink(req, res) {
    try {
      const { slug, id } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const existingProperty = await prisma.property.findUnique({
        where: {
          slug: slug,
          NOT: {
            id: id,
          },
        },
      });

      if (!existingProperty) {
        return res.status(200).json({ available: true, message: '' });
      }

      return res.status(200).json({ available: false, message: 'This link is already taken.' });
    } catch (error) {
      console.error('Error when Checking Property:', error);
      res.status(500).json({ error: 'Failed checking Property' });
    }
  },

  async updatePropertyType(req, res) {
    try {
      const { propertyType } = req.body;
      const id = req.params.id;

      const property = await prisma.property.update({
        where: {
          id,
        },
        data: {
          propertyType: {
            connect: { id: propertyType },
          },
        },
      });

      await updatePropertySteps(id, 'propertyType');

      // Activity log
      await logActivity(req, req.user.id, 'Property Type Updated', {
        details: `Property Type successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Propert Type updated successfully!', property });
    } catch (error) {
      console.error('Error when updating Propert Type:', error);
      res.status(500).json({ error: 'Failed updating Property Type' });
    }
  },

  async updateSpaceType(req, res) {
    try {
      const { spaceType } = req.body;
      const id = req.params.id;

      const space = await prisma.property.update({
        where: {
          id,
        },
        data: {
          spaceType: {
            connect: { id: spaceType },
          },
        },
      });

      await updatePropertySteps(id, 'spaceType');

      // Activity log
      await logActivity(req, req.user.id, 'Space Type Updated', {
        details: `Space Type successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Space Type updated successfully!', space });
    } catch (error) {
      console.error('Error when Creating Space Type:', error);
      res.status(500).json({ error: 'Failed creating Space Type' });
    }
  },

  async updateLocation(req, res) {
    try {
      const { addressLine1, addressLine2, country, state, city, postal_code, latitude, longitude } = req.body;
      const id = req.params.id;

      const propertyAddress = await prisma.propertyAddress.update({
        where: {
          propertyId: id,
        },
        data: {
          postal_code,
          addressLine1,
          addressLine2,
          latitude,
          longitude,

          country: {
            connect: {
              id: country.id,
            },
          },

          state: {
            connect: {
              id: state.id,
            },
          },

          city: {
            connect: {
              id: city.id,
            },
          },
        },
      });

      await updatePropertySteps(id, 'location');

      // Activity log
      await logActivity(req, req.user.id, 'Location Updated', {
        details: `Location successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Location updated successfully!', propertyAddress });
    } catch (error) {
      console.error('Error when Creating property Address:', error);
      res.status(500).json({ error: 'Failed creating property Address' });
    }
  },

  async updateFloorPlan(req, res) {
    try {
      const { bedrooms, bedrooms_data, bathrooms, accommodates } = req.body;
      const id = req.params.id;

      const propertyFloorPlan = await prisma.property.update({
        where: {
          id,
        },
        data: {
          bedrooms,
          bedrooms_data,
          bathrooms,
          accommodates,
        },
      });

      await updatePropertySteps(id, 'floorPlan');

      // Activity log
      await logActivity(req, req.user.id, 'Floor Plan Updated', {
        details: `Floor Plan successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Floor Plan updated successfully!', propertyFloorPlan });
    } catch (error) {
      console.error('Error when Creating property FloorPlan:', error);
      res.status(500).json({ error: 'Failed creating property FloorPlan' });
    }
  },

  async updateAmenities(req, res) {
    try {
      const { amenities } = req.body;
      const id = req.params.id;

      const amenits = await prisma.property.update({
        where: { id },
        data: {
          amenities: {
            set: amenities.map((p) => (typeof p === 'object' ? { id: p.id } : { id: p })),
          },
        },
      });

      await updatePropertySteps(id, 'amenities');

      // Activity log
      await logActivity(req, req.user.id, 'Amenities Updated', {
        details: `Amenities successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Amenities updated successfully!', amenits });
    } catch (error) {
      console.error('Error when Creating property amenities:', error);
      res.status(500).json({ error: 'Failed creating property amenities' });
    }
  },

  async updatePhotos(req, res) {
    try {
      const id = req.params.id;

      await updatePropertySteps(id, 'photos');

      // Activity log
      await logActivity(req, req.user.id, 'Property Images Updated', {
        details: `Property Images successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Photos updated successfully!' });
    } catch (error) {
      console.error('Error when updating photos:', error);
      res.status(500).json({ error: 'Failed updating photos' });
    }
  },

  async uploadPhotos(req, res) {
    try {
      const { images } = req.body;
      const id = req.params.id;

      if (!images || !Array.isArray(images)) {
        return res.status(400).json({ error: 'Invalid images array' });
      }

      // Process all images
      const lastImage = await prisma.propertyImages.findFirst({
        where: { propertyId: id },
        orderBy: { serial: 'desc' },
      });

      let startSerial = lastImage?.serial || 0;

      const createdImages = await Promise.all(
        images.map(async (image, index) => {
          const processedImage = await processImage(image);
          return prisma.propertyImages.create({
            data: {
              propertyId: id,
              image: processedImage,
              serial: startSerial + index + 1,
            },
          });
        }),
      );

      // Activity log
      await logActivity(req, req.user.id, 'Property Image Uploaded', {
        details: `Property Image successfully uploaded by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ data: createdImages });
    } catch (error) {
      console.error('Error when creating property photos:', error);
      res.status(500).json({ error: 'Failed to create property photos' });
    }
  },

  async reorderPhotos(req, res) {
    try {
      const { images, propertyId } = req.body;
      if (!images || !Array.isArray(images)) {
        return res.status(400).json({ error: 'Invalid images array' });
      }

      const updateTasks = images.map((img) =>
        prisma.propertyImages.update({
          where: { id: img.id },
          data: { serial: img.serial },
        }),
      );
      console.log('$updateTasks$', updateTasks);

      await Promise.all(updateTasks);

      // Activity log
      await logActivity(req, req.user.id, 'Property Image Reordered', {
        details: `Property Image successfully reordered by ${req.user.name} (ID: ${req.user.id}) for property ID: ${propertyId}.`,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error reordering photos:', error);
      res.status(500).json({ error: 'Failed to reorder photos' });
    }
  },

  async updatePropertyDescriptions(req, res) {
    try {
      const { groupedData } = req.body;
      const id = req.params.id;

      const propertyDescription = await prisma.propertyDescription.findUnique({
        where: { propertyId: id },
      });

      for (const [locale, filds] of Object.entries(groupedData)) {
        await prisma.propertyDescriptionTranslation.upsert({
          where: {
            propertyDescriptionId_locale: {
              propertyDescriptionId: propertyDescription.id,
              locale: locale,
            },
          },
          create: {
            propertyDescriptionId: propertyDescription.id,
            locale: locale,
            name: filds.name,
            description: filds.description,
            aboutPlace: filds.aboutPlace,
            placeIsGreatFor: filds.placeIsGreatFor,
            guestCanAccess: filds.guestCanAccess,
            interactionGuests: filds.interactionGuests,
            aboutNeighborhood: filds.aboutNeighborhood,
            getAround: filds.getAround,
          },
          update: {
            name: filds.name,
            description: filds.description,
            aboutPlace: filds.aboutPlace,
            placeIsGreatFor: filds.placeIsGreatFor,
            guestCanAccess: filds.guestCanAccess,
            interactionGuests: filds.interactionGuests,
            aboutNeighborhood: filds.aboutNeighborhood,
            getAround: filds.getAround,
          },
        });
      }

      await updatePropertySteps(id, 'descriptions');

      // Activity log
      await logActivity(req, req.user.id, 'Property Description Updated', {
        details: `Property Description successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Description updated successfully!', propertyDescription });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Property Description' });
    }
  },

  async updateBookingSettings(req, res) {
    try {
      const { bookingType, minimumStay } = req.body;
      const id = req.params.id;

      const bookingTyp = await prisma.property.update({
        where: { id },
        data: {
          bookingType,
          minimumStay,
        },
      });

      await updatePropertySteps(id, 'booking');

      // Activity log
      await logActivity(req, req.user.id, 'Booking Settings Updated', {
        details: `Booking Settings successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Booking settings updated successfully!', bookingTyp });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Booking settings' });
    }
  },

  async updatePropertyPrice(req, res) {
    try {
      const { currencyId, price, cleaningFee, guestAfter, guestAfterFee } = req.body;
      const id = req.params.id;

      const propertyPrice = await prisma.propertyPrice.update({
        where: { propertyId: id },
        data: {
          price,
          cleaningFee,
          guestAfter,
          guestAfterFee,
          currencyId,
        },
      });

      await updatePropertySteps(id, 'price');

      // Activity log
      await logActivity(req, req.user.id, 'Property Price Updated', {
        details: `Property Price successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Property Price updated successfully!', propertyPrice });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Property Prices' });
    }
  },

  async updateDailyPrice(req, res) {
    try {
      const { price, date, status } = req.body;
      const id = req.params.id;

      const dailyPrice = await prisma.propertyDates.upsert({
        where: { propertyId_date: { propertyId: id, date } },
        create: {
          propertyId: id,
          price,
          date,
          status,
        },
        update: {
          price,
          date,
          status,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Property Daily Price Updated', {
        details: `Property Daily Price successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Daily Price updated successfully!', propertyPrice: dailyPrice });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Daily Price' });
    }
  },

  async updatePropertyDiscounts(req, res) {
    try {
      const { weeklyDiscount, monthlyDiscount } = req.body;
      const id = req.params.id;

      const discounts = await prisma.propertyPrice.update({
        where: { propertyId: id },
        data: {
          weeklyDiscount,
          monthlyDiscount,
        },
      });

      await updatePropertySteps(id, 'discounts');

      // Activity log
      await logActivity(req, req.user.id, 'Discounts Updated', {
        details: `Discounts successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Discounts updated successfully!', discounts });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Property Discounts' });
    }
  },

  async updateCancellationPolicy(req, res) {
    try {
      const { cancellationPolicyId } = req.body;
      const id = req.params.id;

      const cancellationPolicy = await prisma.property.update({
        where: {
          id,
        },
        data: {
          cancellationPolicy: {
            connect: { id: cancellationPolicyId },
          },
        },
      });

      await updatePropertySteps(id, 'cancellationPolicy');

      // Activity log
      await logActivity(req, req.user.id, 'Cancellation Policy Updated', {
        details: `Cancellation Policy successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Cancellation Policy updated successfully!', space: cancellationPolicy });
    } catch (error) {
      console.error('Error when updating Cancellation Policy:', error);
      res.status(500).json({ error: 'Failed updating Cancellation Policy' });
    }
  },

  async updateCustomLink(req, res) {
    try {
      const { custom_link } = req.body;
      const id = req.params.id;

      const customLink = await prisma.property.update({
        where: {
          id,
        },
        data: {
          slug: custom_link,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Custom Link Updated', {
        details: `Custom Link successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({ message: 'Custom link saved successfully!', customLink });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Custom Link' });
    }
  },

  async validateCohost(req, res) {
    try {
      const { email, propertyId } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Auth check
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        return res.status(422).json({ error: 'User with this email does not exist.' });
      }

      // Prevent inviting ownself
      if (user.id === req.user.id) {
        return res.status(422).json({ error: 'You cannot invite yourself as a co-host.' });
      }

      // if this user is already a co-host for this property
      const existingCohost = await prisma.propertyCoHost.findFirst({
        where: {
          propertyId,
          userId: user.id,
        },
      });

      if (existingCohost) {
        return res.status(422).json({
          error: 'This user is already a co-host for this property.',
        });
      }

      res.status(200).json({
        message: 'User is valid to be invited as co-host.',
        user, // optional: you can send back some info for step 2 preview
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to validate co-host' });
    }
  },

  async invitePropertyCoHost(req, res) {
    try {
      const { permissions, email, action } = req.body;
      const propertyId = req.params.id;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });

      // upsert
      const cohost = await prisma.propertyCoHost.upsert({
        where: {
          propertyId_userId: { propertyId, userId: user.id },
        },
        update: {
          permissions,
          expiredAt: addDays(new Date(), 15),
          status: 'PENDING',
        },
        create: {
          propertyId,
          userId: user.id,
          permissions,
          expiredAt: addDays(new Date(), 15),
        },
        include: {
          user: true,
        },
      });

      if (cohost) {
        const hostEmail = req.user.email;
        const cohostEmail = cohost.user.email;
        const acceptInviteUrl = `${process.env.NEXT_PUBLIC_API_URL}/co-host/accept-invitation/${cohost.user.id}/${cohost.id}`;
        console.log('acceptInviteUrl', acceptInviteUrl);

        // 1️⃣ Send invite email to the co-host
        await sendEmail({
          to: cohostEmail,
          subject: "You've been invited as a Co-Host!",
          templateName: 'inviteCoHost',
          data: {
            year: new Date().getFullYear(),
            propertyId,
            invitedBy: hostEmail,
            cohostName: cohost.user.name || cohost.user.email,
            acceptInviteUrl,
          },
        });

        // 2️⃣ Send notification email to the host
        if (hostEmail) {
          await sendEmail({
            to: hostEmail,
            subject: 'Co-Host invitation sent successfully!',
            templateName: 'inviteCoHostNotification',
            data: {
              year: new Date().getFullYear(),
              cohostEmail,
              propertyId,
            },
          });
        }
      }

      // Activity logs
      if (action == 'create') {
        await logActivity(req, req.user.id, 'Invite Co-host', {
          details: `Co-host invite to ${cohost.user.email}`,
        });
      } else if (action == 'update') {
        await logActivity(req, req.user.id, 'Invite resent to Co-host', {
          details: `Co-host invite resent to ${cohost.user.email}`,
        });
      }

      res.status(201).json({
        message: 'Co-host invited successfully!',
        cohost,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to invite co-host' });
    }
  },

  async getActivityLogs(req, res) {
    try {
      const { userId } = req.params;
      const activityLogs = await prisma.activityLog.findMany({
        where: { userId },
        // include: {
        //   user: true,
        // },
      });
      res.status(200).json(activityLogs);
    } catch (error) {
      console.error('Getting Activity Logs error:', error);
      res.status(500).json({ error: 'Failed to Getting Activity Logs' });
    }
  },

  async getPropertyCoHost(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const propertyId = req.params.propertyId;
      const coHosts = await prisma.propertyCoHost.findMany({
        where: { propertyId },
        include: {
          user: true,
        },
      });
      res.status(200).json(coHosts);
    } catch (error) {
      console.error('Getting Property CoHost error:', error);
      res.status(500).json({ error: 'Failed to Getting Property CoHost' });
    }
  },

  async deletePropertyCoHost(req, res) {
    try {
      const id = parseInt(req.params.id);
      // 3. Delete from DB
      const deletedCoHost = await prisma.propertyCoHost.delete({
        where: { id },
        include: {
          user: true,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Cancelled Co-host', {
        details: `Co-host invite to ${deletedCoHost.user.email} cancelled`,
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  },

  async updatePropertyRules(req, res) {
    try {
      const {
        eventsAllowed,
        smokingAllowed,
        quietHours,
        commercialAllowed,
        startQuietHoursTime,
        endQuietHoursTime,
        startCheckInTime,
        endCheckInTime,
        checkOutTime,
        guest,
        wifiName,
        wifiPassword,
        Translations,
      } = req.body;

      const id = req.params.id;

      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          accommodates: guest,
        },
      });
      // const updatedPropertyRules = await prisma.propertyRulesAndManual.update({
      //   where: { propertyId: id },
      //   data: {
      //     eventsAllowed,
      //     smokingAllowed,
      //     quietHours,
      //     commercialAllowed,
      //     startQuietHoursTime,
      //     endQuietHoursTime,
      //     startCheckInTime,
      //     endCheckInTime,
      //     checkOutTime,
      //     guest,
      //     wifiName,
      //     wifiPassword,
      //   },
      // });
      const updatedPropertyRules = await prisma.propertyRulesAndManual.upsert({
        where: { propertyId: id },
        update: {
          eventsAllowed,
          smokingAllowed,
          quietHours,
          commercialAllowed,
          startQuietHoursTime,
          endQuietHoursTime,
          startCheckInTime,
          endCheckInTime,
          checkOutTime,
          guest,
          wifiName,
          wifiPassword,
        },
        create: {
          propertyId: id,
          eventsAllowed,
          smokingAllowed,
          quietHours,
          commercialAllowed,
          startQuietHoursTime,
          endQuietHoursTime,
          startCheckInTime,
          endCheckInTime,
          checkOutTime,
          guest,
          wifiName,
          wifiPassword,
        },
      });

      if (Translations && typeof Translations === 'object') {
        for (const [locale, filds] of Object.entries(Translations)) {
          await prisma.propertyRulesAndManualTranslation.upsert({
            where: {
              propertyRulesId_locale: {
                propertyRulesId: updatedPropertyRules.id,
                locale: locale,
              },
            },
            create: {
              propertyRulesId: updatedPropertyRules.id,
              locale: locale,
              additionalRules: filds.additionalRules,
              directions: filds.directions,
              houseManual: filds.houseManual,
            },
            update: {
              additionalRules: filds.additionalRules,
              directions: filds.directions,
              houseManual: filds.houseManual,
            },
          });
        }
      }

      // Activity log
      await logActivity(req, req.user.id, 'Property Rules Updated', {
        details: `Property Rules successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });

      res.status(201).json({
        message: 'Property rules saved successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Property rules and guest count' });
    }
  },

  async updateCheckInOut(req, res) {
    try {
      const { startCheckInTime, endCheckInTime, checkOutTime } = req.body;
      const id = req.params.id;

      const updatedCheckInOut = await prisma.propertyRulesAndManual.update({
        where: { propertyId: id },
        data: {
          startCheckInTime,
          endCheckInTime,
          checkOutTime,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Check-in & Checkout Times Updated', {
        details: `Check-in & Checkout times successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });

      res.status(201).json({
        message: 'Check-in & Checkout times saved successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Check In Out' });
    }
  },

  async updateCheckInOutInstructions(req, res) {
    try {
      const {
        smartLock,
        smartLockInstruction,
        keypad,
        keypadInstruction,
        lockbox,
        lockboxInstruction,
        buildingStaff,
        buildingStaffInstruction,
        inPersonGreeting,
        inPersonGreetingInstruction,
        other,
        otherInstruction,
        gatherUsedTowels,
        gatherUsedTowelsInstruction,
        throwTrashAway,
        throwTrashAwayInstruction,
        turnThingsOff,
        turnThingsOffInstruction,
        lockUp,
        lockUpInstruction,
        returnKeys,
        returnKeysInstruction,
        additionalRequests,
        additionalRequestsInstruction,
      } = req.body;
      const id = req.params.id;

      const updatedCheckInOutInstructions = await prisma.checkInOutInstruction.update({
        where: { propertyId: id },
        data: {
          smartLock,
          smartLockInstruction,
          keypad,
          keypadInstruction,
          lockbox,
          lockboxInstruction,
          buildingStaff,
          buildingStaffInstruction,
          inPersonGreeting,
          inPersonGreetingInstruction,
          other,
          otherInstruction,
          gatherUsedTowels,
          gatherUsedTowelsInstruction,
          throwTrashAway,
          throwTrashAwayInstruction,
          turnThingsOff,
          turnThingsOffInstruction,
          lockUp,
          lockUpInstruction,
          returnKeys,
          returnKeysInstruction,
          additionalRequests,
          additionalRequestsInstruction,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Checkin - Checkout Instructions Updated', {
        details: `Checkin - Checkout Instructions successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({
        message: 'Instruction saved successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Check In Out instructions' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const id = req.params.id;

      const updatedStatus = await prisma.property.update({
        where: { id },
        data: {
          status,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Property Status Updated', {
        details: `Property Status successfully updated by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
      });
      res.status(201).json({
        message: 'Status updated successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Status' });
    }
  },

  // Delete
  async deletePropertyImage(req, res) {
    try {
      const id = parseInt(req.params.id);

      const propertyImage = await prisma.propertyImages.findFirst({
        where: { id },
      });

      if (!propertyImage) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const imagePath = path.join(__dirname, '../../public', propertyImage.image);

      fs.unlink(imagePath, async (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Failed to delete file:', err);
          return res.status(500).json({ error: 'Failed to delete image file' });
        }

        // 3. Delete from DB
        const deletedImage = await prisma.propertyImages.delete({
          where: { id },
        });

        // Activity log
        await logActivity(req, req.user.id, 'Property Image Deleted', {
          details: `Property Image successfully deleted by ${req.user.name} (ID: ${req.user.id}) for property ID: ${id}.`,
        });
        res.json({ success: true, deletedImage });
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  },

  async acceptCohostInvite(req, res) {
    try {
      const id = parseInt(req.body.id);

      const updatedStatus = await prisma.propertyCoHost.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
        },
      });

      res.status(201).json({
        message: 'Invitation accepted successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to accept' });
    }
  },

  async isCohost(req, res) {
    try {
      const id = req.params.id;

      const isCohost = await prisma.propertyCoHost.findFirst({
        where: {
          id,
          status: 'ACCEPTED',
        },
      });

      res.status(200).json(isCohost);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to check cohost' });
    }
  },

  async deleteListing(req, res) {
    try {
      const propertyId = req.params.id;
      const userId = req.user.id;

      // Find property
      const property = await prisma.property.findFirst({
        where: { id: propertyId },
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found.' });
      }

      // Only the host can remove the listing
      if (property.hostId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to remove this listing.' });
      }

      // Already deleted check
      if (property.deletedAt) {
        return res.status(400).json({ error: 'This listing has already been removed.' });
      }

      // Soft delete
      const updatedProperty = await prisma.property.delete({
        where: { id: propertyId },
      });

      // Activity log
      await logActivity(req, userId, 'Removed Property Listing', {
        details: `Property ID ${propertyId} has been soft deleted.`,
      });

      res.json({
        success: true,
        message: 'Your listing has been successfully removed and is no longer visible to guests.',
        data: updatedProperty,
      });
    } catch (error) {
      console.error('Soft delete error:', error);
      res.status(500).json({ error: 'Failed to remove the listing. Please try again later.' });
    }
  },
};

async function updatePropertySteps(propertyId, stepName) {
  return await prisma.propertySteps.upsert({
    where: {
      propertyId,
    },
    update: { [stepName]: true },
    create: {
      propertyId,
      [stepName]: true,
    },
  });
}
