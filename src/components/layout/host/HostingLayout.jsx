import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLogger } from '@/hooks/useLogger';
import { Box } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useEffect } from 'react';
import MobileNavigation from '../front/partial/MobileNavigation';
import HostingHeader from './HostingHeader';
const HostingLayout = ({ children }) => {
  const { trans } = useTranslation();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { info, error } = useLogger();
  // info(`🟢 Full user: ${JSON.stringify(user, null, 2)}`);
  useEffect(() => {
    if (isLoading) return; // 👈 Wait for auth to load
    if (!user) router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    info(`🟢Logged in User: ${user.name}, Id: ${user.id}`);
  }, [user, isLoading]);

  return (
    <Fragment>
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <title>ReluxRent | Hosting</title>
        <meta name="keywords" content="ReluxRent, hosting, listings, reservations" />
        <meta name="description" content="Host your home on PixelBNB with powerful tools and features." />
      </Head>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <HostingHeader />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            pt: 8
          }}
        >
          {/* <RequiredTaskCard /> */}
          {children}
        </Box>
        <MobileNavigation />
      </Box>
    </Fragment>
  );
};

export default HostingLayout;
