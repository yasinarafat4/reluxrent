const prisma = require('../../config/prisma');
const { processImage } = require('../../helpers/uploadFileToStorage');
const logActivity = require('../../helpers/logActivity');

module.exports = {
  async getVerificationsData(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const verifications = await prisma.userVerification.findFirst({
        where: { userId: req.user.id },
      });

      res.status(200).json(verifications);
    } catch (error) {}
  },

  async startVerification(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { userId } = req.body;

    try {
      const isExistingDocument = await prisma.userVerification.findFirst({
        where: {
          userId: req.user.id,
        },
      });
      if (isExistingDocument) {
        return res.status(500).json({ message: 'Document already exist' });
      }

      const document = await prisma.userVerification.create({
        data: {
          user: {
            connect: {
              id: req.user.id,
            },
          },
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Start Verification', {
        details: `${req.user.name} User ID (${userId}) started verification process`,
      });

      res.status(200).json({ message: 'Document add successfully', document });
    } catch (error) {
      console.error('Add Document error:', error);
      res.status(500).json({ error: 'Failed to Add Document' });
    }
  },

  async submitDocument(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { country, documentType, front, back, passport, verificationId } = req.body;
    const processPassportImage = await processImage(passport);
    const processFrontImage = await processImage(front);
    const processBackImage = await processImage(back);

    try {
      const document = await prisma.userVerification.update({
        where: {
          id: verificationId,
        },
        data: {
          country: {
            connect: {
              id: country.id,
            },
          },
          documentType,
          front: processFrontImage,
          back: processBackImage,
          passport: processPassportImage,
        },
      });

      // Activity log
      await logActivity(req, req.user.id, 'Document Submitted', {
        details: `${req.user.name} User ID (${req.user.id}) submitted document`,
      });
      res.status(200).json({ message: 'Document add successfully', document });
    } catch (error) {
      console.error('Add Document error:', error);
      res.status(500).json({ error: 'Failed to Add Document' });
    }
  },
};
