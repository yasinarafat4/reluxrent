import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Alert, Box, Button, FormControl, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const LoginForm = () => {
  const { trans } = useTranslation();
  const { setUserState } = useAuth();
  const router = useRouter();
  const { redirect } = router.query;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [showSetPasswordLink, setShowSetPasswordLink] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm();

  const email = watch('email');
  const password = watch('password');

  const onSubmit = async (formData) => {
    console.log('formData', formData);
    // console.log('password', password);
    setLoading(true);
    try {
      const res = await api.post('/api/user/login', { email, password }, { withCredentials: true });
      console.log('res', res);
      if (res.status == 200) {
        const user = res.data.user;
        setUserState(user);
        enqueueSnackbar(res.data.message, { variant: 'success' });
        router.replace(redirect || '/');
      }
    } catch (err) {
      console.log('Login err', err);
      setMessage({ type: 'error', message: err.response.data.error });
      enqueueSnackbar(err.response.data.error, { variant: 'error' });
      if (err.response.data.isSocialAccount) {
        setShowSetPasswordLink(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Request set-password link email
  const handleRequestLink = async () => {
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/api/user/request-set-password', { email });
      console.log('res', res);
      if (res.status == 200) {
        setMessage({ type: 'success', message: res.data.message });
        enqueueSnackbar(res.data.message, { variant: 'success' });
      }
    } catch (err) {
      console.log('request-set-password', err);
      setMessage({ type: 'error', message: err.response.data.error });
      enqueueSnackbar(err.response.data.error, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
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
        {!showSetPasswordLink ? (
          <>
            <FormControl fullWidth variant="outlined" margin="normal">
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Password is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    placeholder="Password"
                    autoComplete="current-password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    size="small"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'hide the password' : 'display the password'}
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              onMouseUp={handleMouseUpPassword}
                              edge="end"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </FormControl>
            <Stack direction={'row'} justifyContent={'end'}>
              <Typography
                component={Link}
                href={'/forgot-password'}
                variant="body2"
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                fontSize={{ xs: 12 }}
              >
                Forgot password?
              </Typography>
            </Stack>
            <Button size="small" sx={{ mt: 1 }} fullWidth variant="contained" color="primary" type="submit" loading={loading} loadingPosition="start">
              {trans('Login')}
            </Button>
          </>
        ) : (
          <Button sx={{ mt: 2 }} fullWidth variant="contained" color="primary" type="button" loading={loading} loadingPosition="start" onClick={handleRequestLink}>
            {trans('Send Set Password Link')}
          </Button>
        )}
      </Box>
    </form>
  );
};

export default LoginForm;
