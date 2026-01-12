const { createAdminActivityLog } = require('../../helpers/adminActivityLogger');
const prisma = require('../../config/prisma');
const { processImage, saveBase64Image } = require('../../helpers/uploadFileToStorage');
const { format } = require('date-fns');

const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, amenitiesId, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// List all Properties
exports.getProperties = async (req, res) => {
  try {
    const ids = req.query.id ? (Array.isArray(req.query.id) ? req.query.id : [req.query.id]) : [];
    const hostId = req.query.hostId;
    const q = req.query.q ? req.query.q : '';
    const { status, isApproved } = req.query;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let filter = {};
    if (ids.length > 0) {
      filter = { id: { in: ids.map((id) => id) } }; // Handle multiple IDs or a single ID
    }
    if (hostId) {
      filter.hostId = hostId;
    }
    if (q) {
      // filter = {
      //   ...filter,
      //   OR: [
      //     {
      //       amenitiesTranslation: {
      //         some: {
      //           name: { contains: q },
      //         },
      //       },
      //     },
      //     {
      //       amenitiesTranslation: {
      //         some: {
      //           description: { contains: q },
      //         },
      //       },
      //     },
      //   ],
      // };
    }

    if (status) {
      filter = {
        ...filter,
        status: status,
      };
    }

    if (isApproved) {
      filter = {
        ...filter,
        isApproved: isApproved == 'true' ? true : false,
      };
    }

    const queryOptions = {
      where: filter,
      orderBy: {
        [sortField]: sortOrder,
      },
      include: {
        propertyDescription: {
          include: {
            propertyDescriptionTranslation: true,
          },
        },
        host: true,
        propertyPrice: true,
      },
    };

    // Apply pagination if page and limit are provided
    if (page && limit) {
      const offset = (page - 1) * limit;
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [data, total] = await Promise.all([prisma.property.findMany(queryOptions), prisma.property.count({ where: filter })]);
    res.setHeader('Content-Range', `properties ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    const formatted = data.map((property) => ({
      id: property.id,
      hostId: property.hostId,
      propertyTypeId: property.propertyTypeId,
      spaceTypeId: property.spaceTypeId,
      accommodates: property.accommodates,
      recommended: property.recommended,
      host: property.host,
      price: property.propertyPrice.price,
      cleaningFee: property.propertyPrice.cleaningFee,
      guestAfter: property.propertyPrice.guestAfter,
      guestAfterFee: property.propertyPrice.guestAfterFee,
      status: property.status,
      isApproved: property.isApproved,
      createdAt: property.createdAt,
      translations: groupTranslationsByLocale(property?.propertyDescription?.propertyDescriptionTranslation),
    }));

    res.json({
      data: formatted,
      total: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

// Get single Property
exports.getProperty = async (req, res) => {
  const id = req.params.id;
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyDescription: {
          include: {
            propertyDescriptionTranslation: true,
          },
        },
        propertyAddress: true,
        propertyPrice: {
          include: {
            currency: true,
          },
        },
        propertyRulesAndManual: {
          include: {
            propertyRulesAndManualTranslation: true,
          },
        },
        host: true,
        cancellationPolicy: true,
        checkInOutInstruction: true,
        amenities: true,
        propertyImages: { orderBy: { serial: 'asc' } },
        propertyDates: true,
        coHosts: true,
        propertyRulesAndManual: {
          include: {
            propertyRulesAndManualTranslation: true,
          },
        },
      },
    });

    if (!property) return res.status(404).json({ error: 'Property not found' });

    const dateWisePrices = property?.propertyDates?.reduce((acc, dateEntry) => {
      const dateStr = format(dateEntry.date, 'yyyy-MM-dd'); // format date to YYYY-MM-DD
      acc[dateStr] = {
        price: dateEntry.price || property?.propertyPrice?.price,
        status: dateEntry.status,
      };
      return acc;
    }, {});

    res.json({
      id: property.id,
      userId: property.userId,
      propertyTypeId: property.propertyTypeId,
      spaceTypeId: property.spaceTypeId,
      accommodates: property.accommodates,
      bedrooms: property.bedrooms,
      bedrooms_data: property.bedrooms_data,
      bathrooms: property.bathrooms,
      bookType: property.bookType,
      bookingType: property.bookingType,
      minimumStay: property.minimumStay,
      cancellationPolicyId: property.cancellationPolicyId,
      recommended: property.recommended,
      status: property.status,
      isApproved: property.isApproved,
      host: property.host,
      translations: groupTranslationsByLocale(property?.propertyDescription?.propertyDescriptionTranslation),
      amenities: property.amenities,
      propertyAddress: property?.propertyAddress,
      propertyDates: property?.propertyDates,
      propertyImages: property?.propertyImages,
      propertyPrice: property?.propertyPrice,
      checkInOutInstructions: property?.checkInOutInstruction,
      propertyRulesAndManual: property?.propertyRulesAndManual,
      rulesAndManualTranslations: groupTranslationsByLocale(property?.propertyRulesAndManual?.propertyRulesAndManualTranslation),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      dateWisePrices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Property' });
  }
};

// Create Property
exports.createProperty = async (req, res) => {
  try {
    const { userId, propertyTypeId, spaceTypeId, accommodates, city, state, country, latitude, longitude, postal_code } = req.body;

    const property = await prisma.property.create({
      data: {
        user: {
          connect: { id: userId },
        },
        propertyType: {
          connect: { id: propertyTypeId },
        },
        spaceType: {
          connect: { id: spaceTypeId },
        },
        accommodates,
      },
    });

    const propertyAddress = await prisma.propertyAddress.create({
      data: {
        propertyId: property.id,
        country,
        state,
        city,
        latitude,
        longitude,
        postal_code,
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create Property' });
  }
};

// Update Property
exports.updateProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const { bedrooms, bedrooms_data, bathrooms, propertyTypeId, spaceTypeId, accommodates, recommended } = req.body;

    const existing = await prisma.property.findUnique({
      where: { id },
    });
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        bedrooms,
        bedrooms_data,
        bathrooms,
        propertyType: {
          connect: { id: propertyTypeId },
        },
        spaceType: {
          connect: { id: spaceTypeId },
        },
        accommodates,
        recommended,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property' });
  }
};

// Update PropertyDescription
exports.updatePropertyDescription = async (req, res) => {
  try {
    const id = req.params.id;
    const { translations } = req.body;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyDescription: {
          include: {
            propertyDescriptionTranslation: true,
          },
        },
      },
    });
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...existingProperty, ...req.body };

    const propertyDescription = await prisma.propertyDescription.findFirst({
      where: { propertyId: id },
    });

    for (const [locale, filds] of Object.entries(translations)) {
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
        },
        update: {
          name: filds.name,
          description: filds.description,
        },
      });
    }

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Description ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(propertyDescription);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Description' });
  }
};

// Update Property Details
exports.updatePropertyDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const { translations } = req.body;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      // include: {
      //   propertyDescription: {
      //     include: {
      //       propertyDescriptionTranslation: true,
      //     },
      //   },
      // },
      select: {
        id: true,
        propertyDescription: {
          select: {
            propertyDescriptionTranslation: {
              select: {
                locale: true,
                aboutPlace: true,
                placeIsGreatFor: true,
                guestCanAccess: true,
                other: true,
                interactionGuests: true,
                aboutNeighborhood: true,
                getAround: true,
              },
            },
          },
        },
      },
    });
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...req.body };

    const propertyDetails = await prisma.propertyDescription.findFirst({
      where: { propertyId: id },
    });

    for (const [locale, filds] of Object.entries(translations)) {
      await prisma.propertyDescriptionTranslation.upsert({
        where: {
          propertyDescriptionId_locale: {
            propertyDescriptionId: propertyDetails.id,
            locale: locale,
          },
        },
        create: {
          propertyDescriptionId: propertyDetails.id,
          locale: locale,
          aboutPlace: filds.aboutPlace,
          placeIsGreatFor: filds.placeIsGreatFor,
          guestCanAccess: filds.guestCanAccess,
          interactionGuests: filds.interactionGuests,
          other: filds.other,
          aboutNeighborhood: filds.aboutNeighborhood,
          getAround: filds.getAround,
        },
        update: {
          aboutPlace: filds.aboutPlace,
          placeIsGreatFor: filds.placeIsGreatFor,
          guestCanAccess: filds.guestCanAccess,
          interactionGuests: filds.interactionGuests,
          aboutNeighborhood: filds.aboutNeighborhood,
          other: filds.other,
          getAround: filds.getAround,
        },
      });
    }

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Details ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(propertyDetails);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Description' });
  }
};

// Update Property Location
exports.updatePropertyLocation = async (req, res) => {
  try {
    const id = req.params.id;
    const { country, city, state, postal_code, addressLine1, addressLine2, latitude, longitude } = req.body;
    console.log('REQ$', req.body);

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyAddress: true,
      },
    });
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...existingProperty, ...req.body };

    const propertyAddress = await prisma.propertyAddress.upsert({
      where: {
        propertyId: id,
      },
      update: {
        countryId: country,
        cityId: city,
        stateId: state,
        postal_code,
        addressLine1,
        addressLine2,
        latitude,
        longitude,
      },
      create: {
        propertyId: id,
        countryId: country,
        cityId: city,
        stateId: state,
        postal_code,
        addressLine1,
        addressLine2,
        latitude,
        longitude,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Location ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(propertyAddress);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Address' });
  }
};

// Update Property Amenity
exports.updatePropertyAmenity = async (req, res) => {
  try {
    const id = req.params.id;
    const { amenities } = req.body;

    if (!Array.isArray(amenities) || amenities.length === 0) {
      return res.status(400).json({ error: 'Amenities should be a non-empty array.' });
    }

    const existing = await prisma.property.findUnique({
      where: { id },
      include: {
        amenities: true,
      },
    });
    // compute changes
    const before = existing;
    const after = { ...existing, ...req.body };

    const property = await prisma.property.update({
      where: { id },
      data: {
        amenities: {
          set: amenities.map((p) => (typeof p === 'object' ? { id: p.id } : { id: p })),
        },
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Amenities ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Amenities' });
  }
};

// Update Property Photos
exports.updatePropertyPhotos = async (req, res) => {
  try {
    const id = req.params.id;
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyImages: true,
      },
    });
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...existingProperty, ...req.body };

    // Update Query

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Images ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(existingProperty);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Address' });
  }
};

// Update Property Pricing
exports.updatePropertyPricing = async (req, res) => {
  try {
    const id = req.params.id;
    const { cleaningFee, guestAfter, guestAfterFee, monthlyDiscount, price, weeklyDiscount } = req.body;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyPrice: true,
      },
    });
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...req.body };

    const propertyPrice = await prisma.propertyPrice.update({
      where: { propertyId: id },
      data: {
        price,
        cleaningFee,
        guestAfter,
        guestAfterFee,
        monthlyDiscount,
        weeklyDiscount,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Price ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(propertyPrice);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Address' });
  }
};

// Update Property Booking
exports.updatePropertyBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const { bookType, bookingType } = req.body;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...existingProperty, ...req.body };

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        bookType,
        bookingType,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Booking ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Address' });
  }
};

// Update Property Rules
exports.updatePropertyTermsAndRules = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      cancellationPolicyId,
      eventsAllowed,
      smokingAllowed,
      commercialAllowed,
      quietHours,
      startQuietHoursTime,
      endQuietHoursTime,
      wifiName,
      wifiPassword,
      startCheckInTime,
      endCheckInTime,
      checkOutTime,
      rulesAndManualTranslations,
    } = req.body;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        cancellationPolicy: true,
        propertyRulesAndManual: true,
      },
    });

    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...existingProperty, ...req.body };

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        cancellationPolicy: {
          connect: { id: cancellationPolicyId },
        },
      },
    });

    const updatedPropertyRules = await prisma.propertyRulesAndManual.update({
      where: { propertyId: id },
      data: {
        eventsAllowed,
        smokingAllowed,
        quietHours,
        commercialAllowed,
        startQuietHoursTime,
        endQuietHoursTime,
        startCheckInTime,
        endCheckInTime,
        checkOutTime,
        wifiName,
        wifiPassword,
      },
    });

    if (rulesAndManualTranslations && typeof rulesAndManualTranslations === 'object') {
      for (const [locale, filds] of Object.entries(rulesAndManualTranslations)) {
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
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Rules ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Rules' });
  }
};

// Update Property Calender
exports.updatePropertyCalender = async (req, res) => {
  try {
    const id = req.params.id;
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Calender ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });
    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Calender' });
  }
};

// Update Property Calender
exports.updatePropertyActions = async (req, res) => {
  try {
    const id = req.params.id;
    const { status, recommended, isApproved } = req.body;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // compute changes
    const before = existingProperty;
    const after = { ...existingProperty, ...req.body };

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status,
        recommended,
        isApproved,
      },
    });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Actions ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Address' });
  }
};

// Update Property Date Wise Price
exports.updatePropertyDateWisePrice = async (req, res) => {
  try {
    const { id, status, price, date } = req.body;
    console.log('req.body', req.body);
    // const property = await prisma.property.fi

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyDates: true,
      },
    });

    // compute changes
    const before = existingProperty;
    const after = { ...req.body };

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
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'update',
      resource: 'Properties',
      resourceId: String(id),
      message: `Updated Property Calender Date Wise Price ${id}`,
      changes: { before, after },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json(dailyPrice);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to update Property Date Wise Price' });
  }
};

// Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedProperty = await prisma.property.delete({ where: { id } });

    // Activity log
    await createAdminActivityLog({
      adminId: req.session?.admin?.id ?? null,
      action: 'delete',
      resource: 'Properties',
      resourceId: String(id),
      message: `Deleted Property ${id}`,
      changes: { before: deletedProperty },
      meta: { ip: req.ip, route: req.originalUrl },
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete Property' });
  }
};
