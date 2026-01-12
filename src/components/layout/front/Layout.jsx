import { Box, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import Footer from './partial/Footer';
import Header from './partial/Header';
import MobileNavigation from './partial/MobileNavigation';

const Layout = ({ children }) => {
  const router = useRouter();

  return (
    <Fragment>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <Header />

        <Container
          maxWidth="xl"
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: router.pathname == '/' ? { xs: 13, sm: 15, md: 22 } : 10,
            pb: 3,
            px: { xs: 1.5, sm: 3, xl: 0 },
          }}
        >
          {children}
        </Container>

        <MobileNavigation />
        <Box flexShrink={0}>
          <Footer />
        </Box>
      </Box>
    </Fragment>
  );
};

export default Layout;
