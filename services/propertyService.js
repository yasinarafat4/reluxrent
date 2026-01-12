const { convertDecimals } = require('../helpers/convertDecimals.js');
const prisma = require('../config/prisma.js');
const { findTranslation } = require('../helpers/findTranslation.js');
const { format } = require('date-fns');

async function getPropertyById(id, lang) {
  const property = await prisma.property.findUnique({
    where: { id },
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

  const filteredReviews = property.reviews?.filter((r) => r.reviewSender.id !== property.host.id) || [];

  const overallRating = filteredReviews.length ? parseFloat((filteredReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) / filteredReviews.length).toFixed(1)) : null;
  const reviewCount = filteredReviews.length;

  const translatedDescriptions = findTranslation(property?.propertyDescription?.propertyDescriptionTranslation, lang);
  const translatedPropertyTypes = findTranslation(property?.propertyType?.propertyTypeTranslation, lang);
  const translatedSpaceTypes = findTranslation(property?.spaceType?.spaceTypeTranslation, lang);
  const translatedCancellationPolicies = findTranslation(property?.cancellationPolicy?.cancellationPolicyTranslation, lang);
  const translatedPropertyRulesAndManuals = findTranslation(property?.propertyRulesAndManual?.propertyRulesAndManualTranslation, lang);

  const propertyData = {
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

  console.log('propertyData', propertyData);
  return convertDecimals(propertyData);
}

module.exports = { getPropertyById };
