// contexts/notificationContext.js
import api from '@/lib/api';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './authContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }
    // Fetch initial unread notifications count from server
    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/api/user/notifications/unread-count', { withCredentials: true });
        setUnreadCount(data || 0);
      } catch (err) {
        console.error('Failed to fetch unread notifications count:', err);
      }
    };

    fetchUnreadCount();
  }, [user]);

  return <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);
