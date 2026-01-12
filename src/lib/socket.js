// lib/socket.js
import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_API_URL;
    socket = io(url, {
      transports: ['websocket'], // stable real-time connection
      autoConnect: true, // connects immediately
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
