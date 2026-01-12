const cron = require('node-cron');
const prisma = require('../config/prisma');



// Cron schedule: every 10 minutes
cron.schedule('0 * * * *', async () => {
  try {
    //Expire pending booking requests
    const expiredRequests = await prisma.booking.updateMany({
      where: { bookingStatus: 'ACCEPTED', expiredAt: { lt: new Date() } },
      data: { bookingStatus: 'EXPIRED' },
    });
    console.log(`[${new Date().toISOString()}] BookingRequests expired: ${expiredRequests.count}`);

    // Delete expired special offers
    const expiredSpecialOffers = await prisma.specialOffer.updateMany({
      where: { status: 'PENDING', expiredAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });

    console.log(`[${new Date().toISOString()}] SpecialOffers: ${expiredSpecialOffers.count}`);

    // Delete expired special offers
    const expiredInviteCoHost = await prisma.propertyCoHost.updateMany({
      where: { status: 'PENDING', expiredAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
    console.log(`[${new Date().toISOString()}] Invite CoHost: ${expiredInviteCoHost.count}`);
  } catch (error) {
    console.error('Error expiring requests/offers:', error);
  }
});
