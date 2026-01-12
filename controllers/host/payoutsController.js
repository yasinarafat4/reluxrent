const prisma = require('../../config/prisma');
const logActivity = require('../../helpers/logActivity');

module.exports = {
  async addPayoutMethod(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { method, bankName, accountHolder, accNumber, swiftCode, branchName, branchCity, country } = req.body;

    try {
      // Check if account number already exists
      const existingAccount = await prisma.payoutMethods.findFirst({
        where: { accNumber },
      });

      if (existingAccount) {
        return res.status(409).json({
          error: 'A payout method with this Account Number already exists.',
        });
      }

      //  Check if swift code already exists
      const existingSwift = await prisma.payoutMethods.findFirst({
        where: { swiftCode },
      });

      if (existingSwift) {
        return res.status(409).json({
          error: 'A payout method with this Swift Code already exists.',
        });
      }

      // Check if user already has a payout method
      const isPaymentMethod = await prisma.payoutMethods.findFirst({
        where: {
          userId: req.user.id,
        },
      });

      const payoutMethod = await prisma.payoutMethods.create({
        data: { userId: req.user.id, method, bankName, accountHolder, accNumber, swiftCode, branchName, branchCity, isDefault: isPaymentMethod ? false : true, countryId: country.id },
      });

      const payoutMethodsCount = await prisma.payoutMethods.count({
        where: {
          userId: req.user.id,
        },
      });

      if (payoutMethodsCount == 1) {
        await prisma.payouts.updateMany({
          where: {
            userId: req.user.id,
            payoutMethodId: null,
          },
          data: {
            payoutMethodId: payoutMethod.id,
          },
        });
      }

      // Activity log
      await logActivity(req, req.user.id, 'Payout Method Added', {
        details: `A new payout method (${method}) was added by ${req.user.name} (User ID: ${req.user.id}) — Bank: ${bankName || 'N/A'}, Account Number: ${accNumber || 'N/A'}, Account Holder: ${accountHolder || 'N/A'}, Country: ${country?.name || 'N/A'}.`,
      });

      

      res.status(200).json({ message: 'Payout method added successfully', review: payoutMethod });
    } catch (error) {
      console.error('Add Payout Method error:', error);
      res.status(500).json({ error: 'Failed to Added Payout Method' });
    }
  },

  async updatePayoutMethod(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { isDefault, payoutAmount } = req.body;
      console.log('payoutAmount$', payoutAmount);
      const id = parseInt(req.params.id);

      await prisma.payoutMethods.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });

      await prisma.payoutMethods.update({
        where: { id },
        data: {
          isDefault,
          payoutAmount,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Payout Method Updated', {
        details: `${req.user.name} (User ID: ${req.user.id}) updated payout method (ID: ${id}). Set Payout Amount ${payoutAmount}, and ${isDefault ? 'Set it as default' : 'Remove from default'}.`,
      });
      res.status(201).json({
        message: 'Payout method updated successfully!',
        status: 'successful',
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to update Payout method' });
    }
  },

  async getPayoutMethods(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payoutsData = await prisma.payoutMethods.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          country: true,
          user: true,
        },
      });

      res.status(200).json(payoutsData);
    } catch (error) {}
  },

  async getPaymentsData(req, res) {
    const lang = (req.query.lang || 'en').trim();
    const { type, status } = req.query;
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const paymentsData = await prisma.booking.findMany({
        where: { hostId: req.user.id, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' },
        include: {
          payment: true,
          host: {
            include: {
              payoutMethods: true,
            },
          },
          payouts: {
            include: {
              payoutMethod: true,
            },
          },
        },
      });

      res.status(200).json(paymentsData);
    } catch (error) {}
  },
};
