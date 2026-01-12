const prisma = require('../config/prisma.js');

// TODO: Email & Notification
async function saveMessages(senderId, text, conversationBookingId) {
  const savedMessage = await prisma.conversationMessage.create({
    data: {
      conversationBookingId,
      senderId,
      text: text,
    },
    include: {
      sender: true,
      reads: true,
      conversationBooking: {
        include: { conversation: true },
      },
    },
  });

  await prisma.conversation.update({
    where: { id: savedMessage.conversationBooking.conversationId },
    data: {
      lastMessageId: savedMessage.id,
      lastMessageAt: savedMessage.createdAt,
    },
  });

  return savedMessage;
}

module.exports = { saveMessages };
