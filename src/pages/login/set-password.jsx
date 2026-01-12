import Layout from '@/components/layout/front/Layout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Alert, Box, Button, Card, FormControl, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function SetPasswordPage() {
  const { trans } = useTranslation();

  const router = useRouter();
  const { token } = router.query;
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const res = await api.post('/api/user/set-password', { token, password });
      console.log('res', res);
      if (res.status == 200) {
        enqueueSnackbar(res.data.message, { variant: 'success' });
        setMessage({ type: 'success', message: res.data.message });
        router.replace('/login');
      }
    } catch (err) {
      enqueueSnackbar(err.response.data.error, { variant: 'error' });
      setMessage({ type: 'error', message: err.response.data.error });
    } finally {
      setLoading(false);
    }
  };

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
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            width: '100%',
            borderRadius: 2,
            boxShadow: { xs: 0, sm: 3 },
          }}
        >
          <Typography variant="h6" align="center" sx={{ p: { xs: 2, md: 3 }, borderBottom: 1, borderColor: 'divider' }}>
            {trans('Set Your Password')}
          </Typography>
          <Stack sx={{ p: { xs: 2, md: 3 } }} spacing={2}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
              <Box sx={{ p: { xs: 0, md: 1 } }}>
                {message && <Alert severity={message.type}>{message.message}</Alert>}
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
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        size="small"
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

                <Button sx={{ mt: 2 }} fullWidth variant="contained" color="primary" type="submit" loading={loading} loadingPosition="start">
                  {trans('Set Password')}
                </Button>
              </Box>
            </form>
          </Stack>
        </Card>
      </Box>
    </Layout>
  );
}
