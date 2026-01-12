import Layout from '@/components/layout/front/Layout';
import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Box, Button, Card, Divider, Stack, Tab } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import LoginForm from './Partial/LoginForm';
import SignupForm from './Partial/SignupForm';

const Login = () => {
  const { trans } = useTranslation();
  const router = useRouter();
  const redirect = router.query.redirect || '/';
  const error = router.query.error;

  const { setUserState } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (error === 'banned') {
      enqueueSnackbar('Your account has been banned. Please contact support for assistance.', { variant: 'error' });
    }
  }, [error]);

  return (
    <Layout>
      {
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.default',
            p: { xs: 0, sm: 3 },
          }}
        >
          <Card
            sx={{
              maxWidth: 500,
              width: '100%',
              borderRadius: 2,
              bgcolor: 'common.white',
              boxShadow: { xs: 0, md: '0 4px 20px rgba(0, 0, 0, 0.2)' },
            }}
          >
            <TabContext value={activeTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', textAlign: 'center' }}>
                <TabList onChange={handleTabChange} centered aria-label="Login Signup tabs">
                  <Tab label="Login" value="login" />
                  <Tab label="Signup" value="signup" />
                </TabList>
              </Box>

              {/* Language Panel */}
              <TabPanel sx={{ padding: '0px' }} value="login">
                <Stack sx={{ p: { xs: 0, md: 3 } }} spacing={2}>
                  {error && <Alert severity="error">Your account has been banned. Please contact support for assistance.</Alert>}
                  <LoginForm />
                  <Divider>OR</Divider>

                  {/* Google Login */}
                  <Button onClick={() => (window.location.href = `/api/auth/google?redirect=${redirect}`)} fullWidth variant="contained" startIcon={<GoogleIcon />} color="inherit">
                    {trans('Sign in with Google')}
                  </Button>

                  {/* Apple Login */}
                  <Button onClick={() => (window.location.href = `/api/auth/apple?redirect=${redirect}`)} fullWidth variant="contained" startIcon={<AppleIcon />} color="inherit">
                    {trans(`Sign in with Apple`)}
                  </Button>
                </Stack>
              </TabPanel>
              <TabPanel sx={{ padding: '0px' }} value="signup">
                <Stack sx={{ p: 2 }} spacing={2}>
                  <SignupForm setActiveTab={setActiveTab} />
                  <Divider>OR</Divider>

                  {/* Google Login */}
                  <Button onClick={() => (window.location.href = '/api/auth/google')} fullWidth variant="contained" startIcon={<GoogleIcon />} color="inherit">
                    {trans('Sign up with Google')}
                  </Button>

                  {/* Apple Login */}
                  <Button onClick={() => (window.location.href = '/api/auth/apple')} fullWidth variant="contained" startIcon={<AppleIcon />} color="inherit">
                    {trans(`Sign up with Apple`)}
                  </Button>
                </Stack>
              </TabPanel>
            </TabContext>
          </Card>
        </Box>
      }
    </Layout>
  );
};

export default Login;
