import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Alert, Box, Button, FormControl, IconButton, InputAdornment, TextField } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const SignupForm = ({ setActiveTab }) => {
  const { trans } = useTranslation();
  const { setUserState } = useAuth();
  const router = useRouter();
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

  const name = watch('name');
  const email = watch('email');
  const password = watch('password');

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/user/register', { name, email, password }, { withCredentials: true });
      console.log('RES', res);
      if (res.status == 200) {
        setMessage({
          type: 'success',
          message: res.data.message,
        });
        enqueueSnackbar(res.data.message, { variant: 'success' });
        setActiveTab('login');
      }
    } catch (err) {
      console.log('Login err', err);
      setMessage({
        type: 'error',
        message: err.response.data.error,
      });
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
            name="name"
            control={control}
            rules={{
              required: 'name is required',
            }}
            render={({ field }) => <TextField {...field} label="Enter Name" placeholder="Your name" variant="outlined" size="small" error={!!errors.name} helperText={errors.name?.message} />}
          />
        </FormControl>

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
            render={({ field }) => <TextField {...field} label="Enter Email" placeholder="you@example.com" variant="outlined" size="small" error={!!errors.email} helperText={errors.email?.message} />}
          />
        </FormControl>
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
          {trans('Sign Up')}
        </Button>
      </Box>
    </form>
  );
};

export default SignupForm;
