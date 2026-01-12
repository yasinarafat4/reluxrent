import Layout from '@/components/layout/front/Layout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Alert, Box, Button, Card, FormControl, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const ForgotPassword = () => {
  const { trans } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm();

  const email = watch('email');

  const onSubmit = async () => {
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/api/user/request-forgot-password', { email });
      console.log('res', res);
      if (res.status == 200) {
        setMessage({ type: 'success', message: res.data.message });
        enqueueSnackbar(res.data.message, { variant: 'success' });
      }
    } catch (err) {
      console.log('request-forgot-password', err);
      setMessage({ type: 'error', message: err.response.data.error });
      enqueueSnackbar(err.response.data.error, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // const handleRequestLink = async () => {
  //     setMessage('');
  //     setLoading(true);
  //     try {
  //       const res = await api.post('/api/user/request-set-password', { email });
  //       console.log('res', res);
  //       if (res.status == 200) {
  //         setMessage({ type: 'success', message: res.data.message });
  //         enqueueSnackbar(res.data.message, { variant: 'success' });
  //       }
  //     } catch (err) {
  //       console.log('request-set-password', err);
  //       setMessage({ type: 'error', message: err.response.data.error });
  //       enqueueSnackbar(err.response.data.error, { variant: 'error' });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

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
              p: 2,
              bgcolor: 'common.white',
              boxShadow: { xs: 0, md: '0 4px 20px rgba(0, 0, 0, 0.2)' },
            }}
          >
            <Typography variant="subtitle2" textAlign={'center'}>
              Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
              <Box sx={{ p: { xs: 0, md: 1 } }}>
                {message && <Alert severity={message.type}>{message.message}</Alert>}
                <FormControl fullWidth margin="normal">
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[^@ ]+@[^@ ]+\.[^@ ]+$/,
                        message: 'Enter a valid email',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Enter Email"
                        placeholder="you@example.com"
                        autoComplete="username"
                        variant="outlined"
                        size="small"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </FormControl>
                <Button size="small" sx={{ mt: 1 }} fullWidth variant="contained" color="primary" type="submit" loading={loading} loadingPosition="start">
                  {trans('Email Password Reset Link')}
                </Button>
              </Box>
            </form>
          </Card>
        </Box>
      }
    </Layout>
  );
};

export default ForgotPassword;
