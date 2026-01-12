import Layout from '@/components/layout/front/Layout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Alert, Box, Button, Card, FormControl, IconButton, InputAdornment, TextField } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const PasswordReset = () => {
  const { trans } = useTranslation();
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

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

  const password = watch('password');

  const onSubmit = async () => {
    setLoading(true);
    try {
        const res = await api.post('/api/user/reset-forgot-password', {  token, password }, { withCredentials: true });
        console.log('res', res);
        if (res.status == 200) {
          // const user = res.data.user;
          // setUserState(user);
          setMessage({ type: 'success', message: res.data.message });
          enqueueSnackbar(res.data.message, { variant: 'success' });
          router.replace('/login');
        }
    } catch (err) {
        console.log('error', err);
        setMessage({ type: 'error', message: err.response.data.error });
        enqueueSnackbar(err.response.data.error, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
            <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
              <Box sx={{ p: { xs: 0, md: 1 } }}>
                 {message && <Alert severity={message.type}>{message.message}</Alert>}
                <FormControl fullWidth variant="outlined" margin="normal">
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
                        message: 'Password must include uppercase, lowercase, and a number',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Password"
                        placeholder="Password"
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
                                  {showPassword ? <EyeOff /> : <Eye />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </FormControl>

                <FormControl fullWidth variant="outlined" margin="normal">
                  <Controller
                    name="password_confirmation"
                    control={control}
                    rules={{
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        size="small"
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation?.message}
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
                                  {showPassword ? <EyeOff /> : <Eye />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </FormControl>
                <Button size="small" sx={{ mt: 1 }} fullWidth variant="contained" color="primary" type="submit" loading={loading} loadingPosition="start">
                  {trans('Reset your password')}
                </Button>
              </Box>
            </form>
          </Card>
        </Box>
      }
    </Layout>
  );
};

export default PasswordReset;
