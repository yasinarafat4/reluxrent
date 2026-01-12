// main css
import '@/styles/global.css';
// aos
import Aos from 'aos';
import 'aos/dist/aos.css';
// nprogress
import PopupManager from '@/components/PopupManager';
import RealTimeNotifications from '@/components/RealTimeNotifications.js';
import { AuthProvider } from '@/contexts/authContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PopupProvider, usePopups } from '@/contexts/PopupContext';
import { ReluxRentAppProvider, useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { fetcher } from '@/lib/fetcher';
import '@/styles/CalendarStyles.css';
import '@/styles/nprogress.css';
import CustomScrollbarStyles from '@/utils/CustomScrollbarStyles';
import { getTheme } from '@/utils/customTheme';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter';
import { APIProvider } from '@vis.gl/react-google-maps';
import { setCookie } from 'cookies-next';
import Head from 'next/head';
import { Router, useRouter } from 'next/router';
import { SnackbarProvider } from 'notistack';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { Suspense, useEffect, useMemo } from 'react';
import useGeoLocation from 'react-ipgeolocation';
import { SWRConfig } from 'swr';

NProgress.configure({ showSpinner: false });

Router.events.on('routeChangeStart', (url, { shallow }) => {
  if (!shallow) NProgress.start();
});
Router.events.on('routeChangeComplete', (url, { shallow }) => {
  if (!shallow) NProgress.done();
});
Router.events.on('routeChangeError', (url, { shallow }) => {
  if (!shallow) NProgress.done();
});

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <ReluxRentAppProvider>
          <SWRConfig value={{ fetcher, revalidateOnFocus: false, fallback: pageProps.fallback, shouldRetryOnError: false }}>
            <TranslationProvider>
              <AppCacheProvider {...pageProps}>
                <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
                <AppWithContext Component={Component} pageProps={pageProps} session={session} />
              </AppCacheProvider>
            </TranslationProvider>
          </SWRConfig>
        </ReluxRentAppProvider>
      </AuthProvider>
    </Suspense>
  );
}

function AppWithContext({ Component, pageProps, session }) {
  const { country } = useGeoLocation();
  const { theme } = useReluxRentAppContext();
  const router = useRouter();

  const currentTheme = useMemo(() => getTheme(theme), [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (country) {
      setCookie('country', country.toLowerCase(), { maxAge: 60 * 60 * 24 * 365 });
    }
  }, [country]);

  useEffect(() => {
    Aos.init();
  }, []);

  return (
    <>
      <Head>
        <meta charset="utf-8" />
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="viewport-fit=cover" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta property="og:site_name" content="Reluxrent" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@reluxrent" />
        <meta name="twitter:app:name:googleplay" content="Reluxrent" />
        <meta name="twitter:app:id:iphone" content="" />
        <meta name="twitter:app:id:ipad" content="" />
        <meta name="twitter:app:id:googleplay" content="com.reluxrent.android" />
        <meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:standard" />
      </Head>
      <ThemeProvider theme={currentTheme}>
        <NotificationProvider>
          <CssBaseline />
          <CustomScrollbarStyles />
          <RealTimeNotifications />
          <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={['places']}>
              <WishlistProvider>
                <PopupProvider>
                  <Component {...pageProps} />
                  <GlobalPopupManager />
                </PopupProvider>
              </WishlistProvider>
            </APIProvider>
          </SnackbarProvider>
        </NotificationProvider>
      </ThemeProvider>
    </>
  );
}

function GlobalPopupManager() {
  const { popups, actions } = usePopups();
  return (
    <PopupManager
      popups={popups}
      dispatch={actions}
      popupData={popups.popupData} // dynamic data per popup
    />
  );
}

export default App;
