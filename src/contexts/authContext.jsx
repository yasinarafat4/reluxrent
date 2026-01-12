import api from '@/lib/api';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  needProfileUpdate: false,
  unreadNotifications: null,
  setUserState: async () => {},
  handleLogout: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Check if user profile is incomplete
const isProfileIncomplete = (user) => !user?.name || !user?.email || !user?.phone || !user?.dob;

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needProfileUpdate, setNeedProfileUpdate] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState(null);

  // -------------------------------
  // Initialize auth on page load / reload
  // -------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get('/api/user/profile', { withCredentials: true });
        // 🚫 Check banned user before setting state
        if (data.user?.isBanned) {
          console.log('Banned user detected, logging out...');
          await handleLogout('/login?error=banned');
          return;
        }
        setUserState(data.user);
        setUnreadNotifications(data.unreadNotifications);
        setupAutoRefresh();
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    return () => clearTimeout(refreshTimeout);
  }, []);

  // -------------------------------
  // Helper: Set user state & check profile completeness
  // -------------------------------
  const setUserState = (userData) => {
    setUser(userData);
    setNeedProfileUpdate(isProfileIncomplete(userData));
  };

  // -------------------------------
  // Auto-refresh JWT token
  // -------------------------------
  const setupAutoRefresh = async () => {
    try {
      const { data } = await api.get('/api/user/token', { withCredentials: true });
      if (!data.token) return;

      // const decoded = jwtDecode(data.token);
      const decoded = decodeJWT(data.token);
      const expiresIn = decoded.exp * 1000 - Date.now();
      const refreshIn = expiresIn - 2 * 60 * 1000; // 2 minutes before expiry
      if (refreshIn <= 0) return refreshToken();

      setRefreshTimeout(setTimeout(refreshToken, refreshIn));
    } catch (err) {
      console.error('Auto refresh setup failed', err);
    }
  };

  const refreshToken = async () => {
    try {
      const { data } = await api.get('/api/user/refresh-token', { withCredentials: true });

      // 🚫 Check again if banned
      if (data.user?.isBanned) {
        console.log('Banned user detected during refresh, logging out...');
        await handleLogout('/login?error=banned');
        return;
      }
      setUserState(data.user);
      setupAutoRefresh();
    } catch {
      handleLogout();
    }
  };

  // -------------------------------
  // Logout
  // -------------------------------
  const handleLogout = async (redirectTo = '/login') => {
    try {
      await api.post('/api/user/logout', {}, { withCredentials: true });
    } catch {}
    clearTimeout(refreshTimeout);
    setUser(null);
    setNeedProfileUpdate(false);
    router.replace(redirectTo);
  };

  // -------------------------------
  // Update user profile via API
  // -------------------------------
  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.post('/api/user/profile', profileData, { withCredentials: true });
      setUserState(data.user);
    } catch (err) {
      console.error('Profile update error:', err.message);
    }
  };

  return <AuthContext.Provider value={{ user, isLoading, needProfileUpdate, setUserState, unreadNotifications, handleLogout, updateProfile }}>{children}</AuthContext.Provider>;
};

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]; // get the middle part of JWT
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('JWT decode error', err);
    return null;
  }
}
