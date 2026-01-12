const prisma = require('../../config/prisma');
const { findTranslation } = require('../../helpers/findTranslation');
const { format } = require('date-fns');
const { convertDecimals } = require('../../helpers/convertDecimals');
const { getPropertyById } = require('../../services/propertyService');

module.exports = {
  // Get
  async getFilteredProperties(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const properties = await prisma.property.findMany({
        where: {
          status: 'Listed',
          isApproved: true,
          host: {
            isVerified: true,
          },
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
                //
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
        return res.json([]);
      }

      const propertiesData = properties.map((property) => {
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

      res.json(convertDecimals(propertiesData));
    } catch (error) {
      console.error('Properties fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Properties' });
    }
  },

  async getPropertyTypes(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const propertyTypes = await prisma.propertyType.findMany({
        where: {
          status: true,
        },
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          icon: true,
          order: true,
          propertyTypeTranslation: {
            select: {
              locale: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (propertyTypes.length === 0) {
        return res.status(404).json([]);
      }

      const translatedPropertyTypes = propertyTypes
        .map((propertyType) => {
          let translation = findTranslation(propertyType.propertyTypeTranslation, lang);
          return translation
            ? {
                id: propertyType.id,
                icon: propertyType.icon,
                order: propertyType.order,
                name: translation.name,
                description: translation.description,
              }
            : null;
        })
        .filter(Boolean);

      if (translatedPropertyTypes.length === 0) {
        return res.status(404).json([]);
      }

      res.json(translatedPropertyTypes);
    } catch (error) {
      console.error('Property Types fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Property Types' });
    }
  },

  async getSpaceTypes(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();

      const spaceTypes = await prisma.spaceType.findMany({
        where: {
          status: true,
        },
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          icon: true,
          order: true,
          spaceTypeTranslation: {
            select: {
              locale: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (spaceTypes.length === 0) {
        return res.status(404).json([]);
      }

      const translatedSpaceTypes = spaceTypes
        .map((spaceType) => {
          let translation = findTranslation(spaceType.spaceTypeTranslation, lang);
          return translation
            ? {
                id: spaceType.id,
                icon: spaceType.icon,
                name: translation.name,
                description: translation.description,
                order: spaceType.order,
              }
            : null;
        })
        .filter(Boolean);

      if (translatedSpaceTypes.length === 0) {
        return res.status(404).json([]);
      }

      res.json(translatedSpaceTypes);
    } catch (error) {
      console.error('Space Types fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Space Types' });
    }
  },

  async getPropertyByCity(req, res) {
    try {
      const lang = (req.query.lang || 'en').trim();
      const cityId = parseInt(req.query.city);

      const properties = await prisma.property.findMany({
        where: {
          status: 'Listed',
          isApproved: true,
          propertyAddress: {
            cityId: cityId,
          },
          host: {
            isVerified: true,
          },
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

      const propertiesData = properties.map((property) => {
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

      res.json(convertDecimals(propertiesData));
    } catch (error) {
      console.error('Property By City fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Property By City' });
    }
  },

  async getProperty(req, res) {
    try {
      const id = req.params.id;
      const lang = (req.query.lang || 'en').trim();

      const property = await getPropertyById(id, lang || 'en');
      if (!property) return res.status(404).json({ message: 'Property not found' });

      res.json(property);

      // const property = await prisma.property.findUnique({
      //   where: { id },
      //   select: {
      //     id: true,
      //     slug: true,
      //     bookType: true,
      //     bookingType: true,
      //     bedrooms: true,
      //     bedrooms_data: true,
      //     bathrooms: true,
      //     accommodates: true,
      //     minimumStay: true,
      //     recommended: true,
      //     status: true,
      //     isApproved: true,
      //     createdAt: true,
      //     propertyType: {
      //       select: {
      //         id: true,
      //         icon: true,
      //         propertyTypeTranslation: {
      //           select: {
      //             locale: true,
      //             name: true,
      //             description: true,
      //           },
      //         },
      //       },
      //     },
      //     spaceType: {
      //       select: {
      //         id: true,
      //         icon: true,
      //         spaceTypeTranslation: {
      //           select: {
      //             locale: true,
      //             name: true,
      //             description: true,
      //           },
      //         },
      //       },
      //     },
      //     propertyDescription: {
      //       select: {
      //         propertyDescriptionTranslation: {
      //           //
      //           select: {
      //             locale: true,
      //             name: true,
      //             description: true,
      //             aboutPlace: true,
      //             placeIsGreatFor: true,
      //             guestCanAccess: true,
      //             interactionGuests: true,
      //             other: true,
      //             aboutNeighborhood: true,
      //             getAround: true,
      //           },
      //         },
      //       },
      //     },
      //     amenities: {
      //       select: {
      //         id: true,
      //         icon: true,
      //         amenitiesTranslation: {
      //           select: {
      //             locale: true,
      //             name: true,
      //             description: true,
      //           },
      //         },
      //         amenitiesType: {
      //           select: {
      //             amenitiesTypeTranslation: {
      //               select: {
      //                 locale: true,
      //                 name: true,
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //     propertyAddress: {
      //       select: {
      //         addressLine1: true,
      //         addressLine2: true,
      //         latitude: true,
      //         longitude: true,
      //         postal_code: true,
      //         country: { select: { id: true, name: true } },
      //         state: { select: { id: true, name: true } },
      //         city: { select: { id: true, name: true, latitude: true, longitude: true } },
      //       },
      //     },
      //     propertyImages: { orderBy: { serial: 'asc' } },

      //     propertyPrice: {
      //       select: {
      //         price: true,
      //         weeklyDiscount: true,
      //         monthlyDiscount: true,
      //         cleaningFee: true,
      //         guestAfter: true,
      //         guestAfterFee: true,
      //         securityFee: true,
      //         weekendPrice: true,
      //         currency: {
      //           select: {
      //             id: true,
      //             code: true,
      //             name: true,
      //             symbol: true,
      //             decimalPlaces: true,
      //             decimalSeparator: true,
      //             thousandSeparator: true,
      //             exchangeRate: true,
      //           },
      //         },
      //       },
      //     },
      //     propertyDates: true,
      //     propertyRulesAndManual: {
      //       select: {
      //         startCheckInTime: true,
      //         endCheckInTime: true,
      //         checkOutTime: true,
      //         quietHours: true,
      //         startQuietHoursTime: true,
      //         endQuietHoursTime: true,
      //         smokingAllowed: true,
      //         commercialAllowed: true,
      //         eventsAllowed: true,
      //         guest: true,
      //         wifiName: true,
      //         wifiPassword: true,
      //         propertyRulesAndManualTranslation: {
      //           select: {
      //             locale: true,
      //             additionalRules: true,
      //             directions: true,
      //             houseManual: true,
      //           },
      //         },
      //       },
      //     },
      //     checkInOutInstruction: {
      //       select: {
      //         // Check-in instructions
      //         smartLock: true,
      //         smartLockInstruction: true,
      //         keypad: true,
      //         keypadInstruction: true,
      //         lockbox: true,
      //         lockboxInstruction: true,
      //         buildingStaff: true,
      //         buildingStaffInstruction: true,
      //         inPersonGreeting: true,
      //         inPersonGreetingInstruction: true,
      //         other: true,
      //         otherInstruction: true,

      //         // Check-out instructions
      //         gatherUsedTowels: true,
      //         gatherUsedTowelsInstruction: true,
      //         throwTrashAway: true,
      //         throwTrashAwayInstruction: true,
      //         turnThingsOff: true,
      //         turnThingsOffInstruction: true,
      //         lockUp: true,
      //         lockUpInstruction: true,
      //         returnKeys: true,
      //         returnKeysInstruction: true,
      //         additionalRequests: true,
      //         additionalRequestsInstruction: true,
      //       },
      //     },
      //     cancellationPolicy: {
      //       select: {
      //         id: true,
      //         beforeDays: true,
      //         beforeDayPriorRefund: true,
      //         afterDayPriorRefund: true,
      //         cancellationPolicyTranslation: {
      //           select: {
      //             locale: true,
      //             name: true,
      //             description: true,
      //           },
      //         },
      //       },
      //     },
      //     host: {
      //       select: {
      //         id: true,
      //         name: true,
      //         preferredName: true,
      //         dob: true,
      //         email: true,
      //         fcmToken: true,
      //         image: true,
      //         phone: true,
      //         about: true,
      //         dreamPlace: true,
      //         funFact: true,
      //         myWork: true,
      //         obsessedWith: true,
      //         school: true,
      //         address: true,
      //         languages: true,
      //         isHost: true,
      //         hostAt: true,
      //         guestFee: true,
      //         hostFee: true,
      //         isVerified: true,
      //         isBanned: true,
      //         isDeactivated: true,
      //       },
      //     },
      //     bookings: {
      //       where: { bookingStatus: 'CONFIRMED' },
      //       select: {
      //         startDate: true,
      //         endDate: true,
      //         guests: true,
      //         totalNight: true,
      //         cleaningCharge: true,
      //         extraGuestCharge: true,
      //         totalGuestFee: true,
      //         totalHostFee: true,
      //         totalPrice: true,
      //         totalDiscount: true,
      //         discountType: true,
      //         bookingStatus: true,
      //         bookingType: true,
      //         paymentStatus: true,
      //         payoutStatus: true,
      //         confirmationCode: true,
      //         confirmedAt: true,
      //         acceptedAt: true,
      //         expiredAt: true,
      //         declinedAt: true,
      //         
      //         declinedBy: true,
      //         bookingDates: {
      //           select: {
      //             date: true,
      //             price: true,
      //           },
      //         },
      //       },
      //     },
      //     reviews: {
      //       select: {
      //         id: true,
      //         message: true,
      //         secretFeedback: true,
      //         improveMessage: true,
      //         publicResponse: true,
      //         publicResponseDate: true,
      //         overallRating: true,
      //         ratings: true,
      //         reviewSender: {
      //           select: {
      //             id: true,
      //             name: true,
      //             image: true,
      //             fcmToken: true,
      //             phone: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      // });

      // if (!property) return res.status(404).json({});

      // const totalBedsCount = property?.bedrooms_data?.reduce((total, bedroom) => {
      //   return total + bedroom.beds.reduce((bedTotal, bed) => bedTotal + Number(bed.quantity), 0);
      // }, 0);

      // const dateWisePrices = property?.propertyDates?.reduce((acc, dateEntry) => {
      //   const dateStr = format(dateEntry.date, 'yyyy-MM-dd'); // format date to YYYY-MM-DD
      //   acc[dateStr] = {
      //     price: dateEntry.price || property?.propertyPrice?.price,
      //     status: dateEntry.status,
      //   };
      //   return acc;
      // }, {});

      // const filteredReviews = property.reviews?.filter((r) => r.reviewSender.id !== property.host.id) || [];

      // const overallRating = filteredReviews.length ? parseFloat((filteredReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) / filteredReviews.length).toFixed(1)) : null;
      // const reviewCount = filteredReviews.length;

      // const translatedDescriptions = findTranslation(property?.propertyDescription?.propertyDescriptionTranslation, lang);
      // const translatedPropertyTypes = findTranslation(property?.propertyType?.propertyTypeTranslation, lang);
      // const translatedSpaceTypes = findTranslation(property?.spaceType?.spaceTypeTranslation, lang);
      // const translatedCancellationPolicies = findTranslation(property?.cancellationPolicy?.cancellationPolicyTranslation, lang);
      // const translatedPropertyRulesAndManuals = findTranslation(property?.propertyRulesAndManual?.propertyRulesAndManualTranslation, lang);

      // const propertyData = {
      //   ...property,
      //   propertyType: {
      //     id: property?.propertyType?.id,
      //     icon: property?.propertyType?.icon,
      //     name: translatedPropertyTypes?.name,
      //     description: translatedPropertyTypes?.description,
      //   },
      //   spaceType: {
      //     id: property?.spaceType?.id,
      //     icon: property?.spaceType?.icon,
      //     name: translatedSpaceTypes?.name,
      //     description: translatedSpaceTypes?.description,
      //   },
      //   propertyDescription: {
      //     name: translatedDescriptions?.name,
      //     description: translatedDescriptions?.description,
      //     aboutPlace: translatedDescriptions?.aboutPlace,
      //     placeIsGreatFor: translatedDescriptions?.placeIsGreatFor,
      //     guestCanAccess: translatedDescriptions?.guestCanAccess,
      //     interactionGuests: translatedDescriptions?.interactionGuests,
      //     aboutNeighborhood: translatedDescriptions?.aboutNeighborhood,
      //     getAround: translatedDescriptions?.getAround,
      //   },
      //   amenities: property?.amenities.map((aminity) => {
      //     const translatedAmenities = findTranslation(aminity?.amenitiesTranslation, lang);
      //     const translatedAmenityTypes = findTranslation(aminity?.amenitiesType?.amenitiesTypeTranslation, lang);

      //     return {
      //       id: aminity?.id,
      //       icon: aminity?.icon,
      //       name: translatedAmenities?.name,
      //       description: translatedAmenities?.description,
      //       type: translatedAmenityTypes?.name,
      //     };
      //   }),
      //   propertyRulesAndManual: {
      //     startCheckInTime: property?.propertyRulesAndManual?.startCheckInTime,
      //     endCheckInTime: property?.propertyRulesAndManual?.endCheckInTime,
      //     checkOutTime: property?.propertyRulesAndManual?.checkOutTime,
      //     quietHours: property?.propertyRulesAndManual?.quietHours,
      //     startQuietHoursTime: property?.propertyRulesAndManual?.startQuietHoursTime,
      //     endQuietHoursTime: property?.propertyRulesAndManual?.endQuietHoursTime,
      //     smokingAllowed: property?.propertyRulesAndManual?.smokingAllowed,
      //     commercialAllowed: property?.propertyRulesAndManual?.commercialAllowed,
      //     eventsAllowed: property?.propertyRulesAndManual?.eventsAllowed,
      //     guest: property?.propertyRulesAndManual?.guest,
      //     wifiName: property?.propertyRulesAndManual?.wifiName,
      //     wifiPassword: property?.propertyRulesAndManual?.wifiPassword,

      //     additionalRules: translatedPropertyRulesAndManuals?.additionalRules,
      //     directions: translatedPropertyRulesAndManuals?.directions,
      //     houseManual: translatedPropertyRulesAndManuals?.houseManual,
      //   },
      //   cancellationPolicy: {
      //     id: property?.cancellationPolicy?.id,
      //     beforeDays: property?.cancellationPolicy?.beforeDays,
      //     beforeDayPriorRefund: property?.cancellationPolicy?.beforeDayPriorRefund,
      //     afterDayPriorRefund: property?.cancellationPolicy?.afterDayPriorRefund,

      //     name: translatedCancellationPolicies?.name,
      //     description: translatedCancellationPolicies?.description,
      //   },
      //   beds: totalBedsCount,
      //   dateWisePrices,
      //   overallRating,
      //   reviewCount,
      //   reviews: filteredReviews,
      // };

      // res.json(convertDecimals(propertyData));
    } catch (error) {
      console.log('Property fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Property' });
    }
  },

  async getReviewsByProperty(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const propertyId = req.params.propertyId;
    const takeAmount = parseInt(req.params.take);
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { hostId: true },
      });

      const reviews = await prisma.reviews.findMany({
        where: {
          propertyId,
          senderId: { not: property.hostId },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          reviewSender: true,
          reviewReceiver: true,
          ratings: true,
        },
      });

      let categoryRatings = {};

      if (reviews.length) {
        const ratingSums = {};
        const ratingCounts = {};

        reviews.forEach((review) => {
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

        categoryRatings = Object.fromEntries(Object.entries(ratingSums).map(([key, sum]) => [key, parseFloat((sum / ratingCounts[key]).toFixed(1))]));
      }

      const takeReviews = !isNaN(takeAmount) && takeAmount > 0 ? reviews.slice(0, takeAmount) : reviews;

      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      // Count stars
      reviews.forEach((review) => {
        const rating = Math.round(parseFloat(review.overallRating));
        if (starCounts[rating] !== undefined) {
          starCounts[rating] += 1;
        }
      });

      const totalReviews = reviews.length;

      // ⭐ Percentage breakdown
      const starPercentages = {};
      Object.entries(starCounts).forEach(([star, count]) => {
        starPercentages[star] = totalReviews ? parseFloat(((count / totalReviews) * 100).toFixed(1)) : 0;
      });

      const reviewsData = {
        data: takeReviews,
        starPercentages,
        starCounts,
        categoryRatings,
      };

      res.json(reviewsData);
    } catch (error) {
      console.error('Reviews fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Reviews' });
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
      });

      if (amenities.length === 0) {
        return res.status(404).json([]);
      }

      const translatedAmenities = amenities
        .map((amenity) => {
          let translation = findTranslation(amenity.amenitiesTranslation, lang);
          const typeTrans = findTranslation(amenity?.amenitiesType?.amenitiesTypeTranslation, lang);
          return translation
            ? {
                id: amenity.id,
                icon: amenity.icon,
                name: translation.name,
                description: translation.description,
                type: typeTrans.name,
              }
            : null;
        })
        .filter(Boolean);

      if (translatedAmenities.length === 0) {
        return res.status(404).json([]);
      }

      res.json(translatedAmenities);
    } catch (error) {
      console.error('Amenities fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch Amenities' });
    }
  },
};
