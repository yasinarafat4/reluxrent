// socketManager.js
const prisma = require('./config/prisma');
const { saveMessages } = require('./services/messageService');
let io = null;

// Initialize Socket.IO server once
const initSocket = (server) => {
  if (!io) {
    const { Server } = require('socket.io');
    const allowedOrigin = process.env.BASE_URL;
    io = new Server(server, {
      cors: {
        origin: ['https://reluxrent.com'],
        methods: ['GET', 'POST'],
        credentials: true,
      }, // adjust to your frontend domain
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Identify admin clients
      socket.on('joinAdmin', () => {
        socket.join('admin_room');
        console.log('Admin joined room');
      });

      socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
      });

      socket.on('joinConversation', ({ conversationBookingId }) => {
        socket.join(`conversation-${conversationBookingId}`);
        console.log(`User joined conversation: ${conversationBookingId}`);
      });

      // Receive message from client
      socket.on('sendMessage', async (data) => {
        const { senderId, text, conversationBookingId } = data;
        // Save message to DB
        const savedMessage = await saveMessages(senderId, text, conversationBookingId);

        io.to('admin_room').emit('message', savedMessage);
        io.to(`conversation-${conversationBookingId}`).emit('message', savedMessage);
      });

      // Typing indicators
      socket.on('typing', ({ conversationBookingId, senderId }) => {
        socket.to(`conversation-${conversationBookingId}`).emit('typing', { senderId });
      });

      socket.on('stopTyping', ({ conversationBookingId, senderId }) => {
        socket.to(`conversation-${conversationBookingId}`).emit('stopTyping', { senderId });
      });

      // Mark messages as read
      socket.on('markAsRead', async ({ userId, conversationBookingId }) => {
        const unreadMessages = await prisma.conversationMessage.findMany({
          where: {
            conversationBookingId,
            NOT: { reads: { some: { userId } } },
            senderId: { not: userId },
          },
          include: { sender: true, reads: true },
        });

        if (unreadMessages.length === 0) return;

        await prisma.messageRead.createMany({
          data: unreadMessages.map((msg) => ({ messageId: msg.id, userId })),
          skipDuplicates: true,
        });

        // Notify all participants
        socket.to(`conversation-${conversationBookingId}`).emit('messagesRead', {
          userId,
          messageIds: unreadMessages.map((m) => m.id),
        });
      });

      socket.on('reservationUpdate', (data) => {
        // Broadcast to everyone in the same conversation
        io.to(`conversation-${data.conversationBookingId}`).emit('reservationUpdate', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  return io;
};

// Allow external access to the same socket instance
const getSocket = () => io;

module.exports = { initSocket, getSocket };
