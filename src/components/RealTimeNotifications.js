'use client';

import { useAuth } from '@/contexts/authContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { onMessage, useFirebaseMessaging } from '@/lib/firebase';
import { disconnectSocket, initSocket } from '@/lib/socket';
import { useEffect, useRef } from 'react';

const RealTimeNotifications = () => {
  const { user } = useAuth();
  const messaging = useFirebaseMessaging();
  const socketRef = useRef(null);
  const { setUnreadCount } = useNotifications();
  const recentNotifications = useRef(new Set()); // track recent notifications

  // Remove old notifications from cache every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      recentNotifications.current.clear();
    }, 10000); // clear every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      socketRef.current = initSocket();
    }
    const socket = socketRef.current;

    socket.emit('joinRoom', `user-${user.id}`);

    socket.on('connect', () => {
      console.log('✅ Connected as User:', socket.id);
    });

    const notificationHandler = (data) => {
      console.log('Socket notification:', data);
      maybeShowNotification(data);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', notificationHandler);

    return () => {
      socket.off('notification', notificationHandler);
    };
  }, [user]);

  // Handle FCM foreground notifications
  useEffect(() => {
    if (!messaging) return;

    const fcmHandler = (payload) => {
      console.log('FCM foreground message:', payload);

      const notification = payload.notification || {};
      const data = payload.data || {};

      const title = notification.title || data.title || 'Notification';
      const body = notification.body || data.body || 'You have a new message.';
      const icon = notification.icon || data.icon || '/images/notification-icon.png';
      const link = data.link || '/';

      maybeShowNotification({ title, body, icon, link });
      setUnreadCount((prev) => prev + 1);
    };

    const unsubscribe = onMessage(messaging, fcmHandler);
    return () => unsubscribe && unsubscribe();
  }, [messaging]);

  // Auto disconnect on logout
  useEffect(() => {
    if (!user) {
      disconnectSocket();
    }
  }, [user]);

  const maybeShowNotification = (data) => {
    // Use a simple hash (title + body + link)
    const key = `${data.title}|${data.body}|${data.link}`;
    if (recentNotifications.current.has(key)) {
      console.log('🟡 Duplicate notification ignored:', key);
      return;
    }
    recentNotifications.current.add(key);
    showBrowserNotification(data);
  };

  const showBrowserNotification = (data) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            data: { link: data.link || '/' },
          });
        }
      });
    }
  };

  return null;
};

export default RealTimeNotifications;
