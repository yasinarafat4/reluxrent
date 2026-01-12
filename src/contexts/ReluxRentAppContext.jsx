import { getCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './authContext';
export const ReluxRentAppContext = createContext();

export const ReluxRentAppProvider = ({ children }) => {
  const { user } = useAuth();
  const [guestFee, setGuestFee] = useState(null);
  const [hostFee, setHostFee] = useState(null);
  const [activeCurrency, setActiveCurrency] = useState(null);
  const [defaultCurrency, setDefaultCurrency] = useState(null);
  const [allCurrency, setAllCurrency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = getCookie('siteTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setCookie('siteTheme', 'light', { maxAge: 60 * 60 * 24 * 365 });
    }
  }, []);

  const toggleTheme = () => {
    const savedTheme = getCookie('siteTheme');
    const newTheme = savedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setCookie('siteTheme', newTheme, { maxAge: 60 * 60 * 24 * 365 });
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/front/currencies`)
      .then((res) => res.json())
      .then((data) => {
        setAllCurrency(data);
        const savedCurrency = getCookie('siteCurrency');
        const defaultCurrency = data.find((c) => c.defaultCurrency === true);
        setDefaultCurrency(defaultCurrency);
        const currencyToUse = savedCurrency ? JSON.parse(savedCurrency) : defaultCurrency;

        if (currencyToUse) {
          setActiveCurrency(currencyToUse);
          setCookie('siteCurrency', JSON.stringify(currencyToUse), { maxAge: 60 * 60 * 24 * 365 });
        }

        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true);
      if (user?.guestFee > 0 && user?.hostFee > 0) {
        // Use user-specific fees
        setGuestFee(Number(user.guestFee));
        setHostFee(Number(user.hostFee));
      } else {
        // Fall back to API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/front/fees`);
        const data = await res.json();
        setGuestFee(data.guestFee);
        setHostFee(data.hostFee);
      }
      setLoading(false);
    };
    fetchFees();
  }, [user]);

  const setCurrency = (newCurrency) => {
    setActiveCurrency(newCurrency);
    setCookie('siteCurrency', JSON.stringify(newCurrency), { maxAge: 60 * 60 * 24 * 365 });
  };

  const isLoading = loading || defaultCurrency == null || activeCurrency === null || guestFee === null || hostFee === null;
  if (isLoading) {
    return (
      <></>
      // <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={true}>
      //   <CircularProgress color="inherit" />
      // </Backdrop>
    );
  }

  return <ReluxRentAppContext.Provider value={{ theme, toggleTheme, defaultCurrency, activeCurrency, allCurrency, setCurrency, guestFee, hostFee }}>{children}</ReluxRentAppContext.Provider>;
};

// export const useReluxRentAppContext = () => useContext( ReluxRentAppContext );
export const useReluxRentAppContext = () => {
  const context = useContext(ReluxRentAppContext);
  if (!context) {
    throw new Error('useReluxRentAppContext must be used within a ReluxRentAppProvider');
  }
  return context;
};
