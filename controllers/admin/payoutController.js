const prisma = require('../../config/prisma');
const { processSeoImage } = require('../../helpers/uploadFileToStorage');
const { convertDecimals } = require('../../helpers/convertDecimals');
const { sendEmailWithRetry } = require('../../helpers/sendEmailWithRetry');
const { sendUserNotification } = require('../../helpers/notificationService');
const { format } = require('date-fns');

// Helper: group translations by locale
const groupTranslationsByLocale = (translations) => {
  const result = {};
  translations.forEach((t) => {
    const { locale, id, ...rest } = t;
    result[locale] = rest;
  });
  return result;
};

// GET /api/pages
exports.getAllPayouts = async (req, res) => {
  try {
    const { userId, bookingId } = req.query;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;
    const q = req.query.q ? req.query.q : '';
    const payoutStatus = req.query.payoutStatus;
    const sortField = req.query._sort || 'id';
    const sortOrder = req.query._order === 'DESC' ? 'desc' : 'asc';

    let filter = {};
    if (userId) {
      filter.userId = userId;
    }

    if (bookingId) {
      filter.bookingId = bookingId;
    }

    if (q) {
      filter = {
        ...filter,
        bookingId: { contains: q },
      };
    }

    if (payoutStatus) {
      filter.payoutStatus = payoutStatus;
    }

    const [data, total] = await Promise.all([
      prisma.payouts.findMany({
        where: filter,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          user: true,
          currency: true,
          payoutMethod: true,
        },
        skip: offset,
        take: limit,
      }),
      prisma.payouts.count({
        where: filter,
      }),
    ]);

    res.setHeader('Content-Range', `payouts ${offset}-${offset + data.length - 1}/${total}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

    res.json(
      convertDecimals({
        data,
        total,
      }),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Payouts' });
  }
};

// GET /api/pages/:id
exports.getPayout = async (req, res) => {
  try {
    const id = req.params.id;

    const payout = await prisma.payouts.findUnique({
      where: { id },
      include: {
        payoutMethod: true,
      },
    });

    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    res.json(payout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching Payout' });
  }
};

// POST /api/pages
exports.createPayout = async (req, res) => {
  try {
    const { translations, slug } = req.body;

    // Process translations
    const processedTranslations = await Promise.all(
      Object.entries(translations).map(async ([locale, fields]) => ({
        locale,
        title: fields.title,
        content: fields.content,
        canonical: fields.canonical,
        seoTitle: fields.seoTitle,
        seoDescription: fields.seoDescription,
        structuredData: fields.structuredData || {},
        seoImage: await processSeoImage(fields.seoImage),
      })),
    );

    // Create serviceSection
    const page = await prisma.page.create({
      data: {
        slug,
        PageTranslation: {
          create: processedTranslations,
        },
      },
      include: {
        PageTranslation: true,
      },
    });

    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create Page' });
  }
};

// PUT /api/pages/:id
exports.updatePayout = async (req, res) => {
  try {
    const id = req.params.id;
    const { payoutStatus, userId } = req.body;
    // Step 1: Update only fields on Blog (scalar only)
    // const updatedPayout = await prisma.payouts.update({
    //   where: { id },
    //   data: {
    //     payoutStatus: data.payoutStatus,
    //   }
    // });
    // console.log('updatePayoutData', updatedPayout);

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayout = await tx.payouts.update({
        where: { id },
        data: { payoutStatus: payoutStatus },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: updatedPayout.bookingId },
        data: { payoutStatus: payoutStatus },
      });

      return { updatedPayout, updatedBooking };
    });

    // Fetch host info
    const host = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Notification for Host
    const notificationData = {
      title: 'Payout Processed',
      body: `Your payout for booking #${result?.updatedPayout?.bookingId} has been ${result?.updatedPayout?.payoutStatus.toLowerCase()}.`,
      link: `/host/reservations/details/${result?.updatedPayout?.bookingId}`,
    };

    await sendUserNotification({ userId: host?.id, fcmToken: host?.fcmToken, notificationData });

    // Email to Host
    await sendEmailWithRetry({
      to: host?.email,
      subject: `Your payout has been ${result?.updatedPayout?.payoutStatus}`,
      templateName: 'payoutStatusHost',
      data: {
        year: new Date().getFullYear(),
        hostName: host?.name,
        bookingId: result?.updatedPayout?.bookingId,
        amount: result?.updatedPayout?.payoutAmount,
        status: result?.updatedPayout?.payoutStatus,
        date: format(result?.updatedPayout?.payoutDate, 'dd/MM/yyyy'),
      },
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Page' });
  }
};

// DELETE /api/pages/:id
exports.deletePayout = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.pageTranslation.deleteMany({ where: { pageId: id } });
    await prisma.page.delete({ where: { id } });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Page' });
  }
};
