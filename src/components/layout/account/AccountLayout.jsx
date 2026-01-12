import { Box, useMediaQuery, useTheme } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import AccountHeader from './AccountHeader';

export default function AccountLayout({ children }) {
  const router = useRouter();
  const theme = useTheme();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Fragment>
      <Head>
        <title>ReluxRent | Account</title>
        <meta name="keywords" content="ReluxRent" />
        <meta name="description" content="ReluxRent" />
      </Head>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <AccountHeader />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: 12,
            pb: 3,
            px: { xs: 2, lg: 5 },
          }}
        >
          <Box display={'flex'} justifyContent={'center'} gap={2} width={{ lg: '80%' }} mx={'auto'}>
            {children}
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
}
