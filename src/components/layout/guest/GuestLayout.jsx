import { useAuth } from '@/contexts/authContext';
import { useLogger } from '@/hooks/useLogger';
import { Box } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useEffect } from 'react';
import MobileNavigation from '../front/partial/MobileNavigation';
import GuestHeader from './GuestHeader';

const GuestLayout = ({ children }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { info, error } = useLogger();
  // info(`🟢 Full user: ${JSON.stringify(user, null, 2)}`);
  info(`🟢Logged in User: ${user?.name}, Id: ${user?.id}`);
  useEffect(() => {
    if (isLoading) return; // 👈 Wait for auth to load
    if (!user) router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
  }, [user, isLoading]);

  return (
    <Fragment>
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <title>ReluxRent | Guest</title>
        <meta name="keywords" content="Clippasia, image editing, edit, react" />
        <meta name="description" content="Clipping Path Service React NextJs Template" />
      </Head>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <GuestHeader />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            pt: 8,
          }}
        >
          {children}
        </Box>
        <MobileNavigation />
      </Box>
    </Fragment>
  );
};

export default GuestLayout;
