import Layout from '@/components/layout/front/Layout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

export default function VerifyEmail() {
  const { trans } = useTranslation();
  const router = useRouter();
  const { token } = router.query;
  const [message, setMessage] = useState(null);

  async function verify() {
    try {
      const res = await api.post('/api/user/verify-email', { token });
      console.log('res', res);
      if (res.status == 200) {
        enqueueSnackbar(res.data.message, { variant: 'success' });
        router.replace('/login');
      }
    } catch (error) {
      setMessage({ type: 'error', message: error.response.data.error });
      enqueueSnackbar(error.response.data.error, { variant: 'error' });
      console.log(error);
    }
  }

  useEffect(() => {
    verify();
  }, []);

  return (
    <Layout>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: { xs: 0, sm: 3 },
          height: '100vh',
        }}
      >
        {message ? (
          <Stack sx={{ p: { xs: 2, md: 3 } }}>
            <Alert severity={message.type}>{message.message}</Alert>
          </Stack>
        ) : (
          <>
            <Stack gap={2} justifyContent={'center'} alignItems={'center'}>
              <CircularProgress />
              <Typography variant="body2">Please wait...</Typography>
            </Stack>
          </>
        )}
      </Box>
    </Layout>
  );
}
