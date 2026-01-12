import api from '@/lib/api';
import { createContext, useContext, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { useAuth } from './authContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  // Load wishlist on mount

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/api/guest/wishlists');
      setWishlist(data || []);
    } catch (err) {
      console.log('Failed to load wishlist', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const toggleWishlist = async (propertyId) => {
    const isWishlisted = wishlist.some((item) => item.id === propertyId);

    if (isWishlisted) {
      await api.delete(`/api/guest/remove-wishlist/${propertyId}`);
      mutate(`/api/guest/wishlists`);
    } else {
      const { data } = await api.post(`/api/guest/add-wishlist/${propertyId}`);
      mutate(`/api/guest/wishlists`);
    }
    fetchWishlist();
  };

  return <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside a WishlistProvider');
  }
  return context;
}
