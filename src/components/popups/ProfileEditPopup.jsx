import PhoneInputField from '@/components/PhoneInputField';
import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { CameraAlt } from '@mui/icons-material';
import { Avatar, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, Link, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ProfileEditPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPreferredName, setShowPreferredName] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'all',
  });

  const avatarSrc = watch('image');
  const watchPreferredName = watch('preferredName');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setValue('image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fullName = user.name || '';
    const [firstName, lastName] = fullName.split(' ');
    setValue('firstName', firstName);
    setValue('lastName', lastName);
    setValue('preferredName', user.preferredName);
    setValue('image', user.image);
    setValue('email', user.email);
    setValue('phone', user.phone);
    setValue('dob', user.dob ? user.dob.split('T')[0] : '');
  }, [user, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/user/profile', formData);
      closeModal();
    } catch (error) {
      if (error.response?.data?.error == 'exists') {
        // If API error mentions phone, set error on phone field
        setError('phone', {
          type: 'manual',
          message: 'This phone number is already in use',
        });
      } else {
        console.log('error', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showModal} maxWidth="sm" fullWidth component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {trans('Complete Your Profile First')}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box
          noValidate
          sx={{
            padding: 0,
          }}
        >
          {/* Profile Picture */}
          <Box
            sx={{
              width: { xs: 100, lg: 150 },
              height: { xs: 100, lg: 150 },
              margin: 'auto',
              textAlign: 'center',
            }}
          >
            <Avatar
              alt="Profile"
              src={avatarSrc}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: 1,
                borderColor: '#A270FF',
              }}
            />
            <Button variant="outlined" type="button" size="small" component="label" startIcon={<CameraAlt />} sx={{ mt: 1 }}>
              {trans('Edit')}
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            </Button>
          </Box>
          <Typography variant="h6" fontWeight={700} mt={7}>
            {trans('My profile')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {trans('Hosts and guests can see your profile and it may appear across ReluxRent to help us build trust in our community.')} <Link href="/help">{trans('Learn more')}</Link>
          </Typography>
          {/* Legal Name Section */}
          <Typography variant="subtitle2" fontWeight={600} mt={1}>
            {trans('Legal Name')}{' '}
          </Typography>{' '}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            {/* First Name Field */}
            <FormControl sx={{ mt: 1 }} fullWidth size="small" margin="normal">
              <Controller
                name="firstName"
                control={control}
                rules={{ required: trans('First name is required!') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required={true}
                    label={trans('First Name')}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    slotProps={{
                      formHelperText: {
                        sx: { ml: 0 },
                      },
                      inputLabel: {
                        shrink: true,
                        sx: {
                          fontSize: '0.9rem',
                        },
                      },
                    }}
                  />
                )}
              />
            </FormControl>
            {/* Last Name Field */}
            <FormControl sx={{ mt: 1 }} fullWidth size="small" margin="normal">
              <Controller
                name="lastName"
                control={control}
                rules={{ required: trans('Last name is required!') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required={true}
                    label={trans('Last Name')}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    slotProps={{
                      formHelperText: {
                        sx: { ml: 0 },
                      },
                      inputLabel: {
                        shrink: true,
                        sx: {
                          fontSize: '0.9rem',
                        },
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Box>
          {/* Preferred Name */}
          <Typography variant="caption" color="text.secondary" mt={1}>
            {trans('Make sure this matches the name on your government ID. If you go by another name, you can add a')}{' '}
            <Link href="#" onClick={() => setShowPreferredName(!showPreferredName)}>
              {trans('preferred name')}
            </Link>
          </Typography>
          {showPreferredName || watchPreferredName ? (
            <FormControl sx={{ mt: 1 }} fullWidth size="small" margin="normal">
              <Controller
                name="preferredName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={trans('Preferred name (optional)')}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                        sx: {
                          fontSize: '0.9rem',
                        },
                      },
                    }}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                )}
              />
              <FormHelperText sx={{ ml: 0 }}>{trans('This is how your first name will appear to hosts and guests.')}</FormHelperText>
            </FormControl>
          ) : null}
          {/* Contact Info Section */}
          <Typography variant="subtitle2" fontWeight={600} mt={1}>
            {trans('Contact Info')}{' '}
          </Typography>
          {/* Email Field */}
          <FormControl sx={{ mt: 1 }} fullWidth size="small" margin="normal">
            <Controller
              name="email"
              control={control}
              rules={{
                required: trans('Email is required!'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: trans('Enter a valid email address'),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required={true}
                  label={trans('Email')}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.email}
                  helperText={errors?.email?.type != 'manual' && errors.email?.message}
                  slotProps={{
                    formHelperText: {
                      sx: { ml: 0 },
                    },
                    inputLabel: {
                      shrink: true,
                      sx: {
                        fontSize: '0.9rem',
                      },
                    },
                  }}
                />
              )}
            />

            <FormHelperText sx={{ ml: 0 }}>{trans("Use an address you'll always have access to. We'll email you trip confirmations and receipts.")}</FormHelperText>
          </FormControl>
          {/*  Phone Field */}
          <PhoneInputField control={control} name="phone" label={trans('Phone Number')} helperText={"Use a number you'll always have access to."} />
          {/*  Date of Birth Field */}
          <FormControl sx={{ mt: 3 }} fullWidth size="small" margin="normal">
            <Controller
              name="dob"
              control={control}
              rules={{
                validate: (value) => {
                  if (!value) return 'Date of birth is required';

                  const birthDate = new Date(value);
                  if (isNaN(birthDate.getTime())) return 'Invalid date';

                  const today = new Date();
                  const age = today.getFullYear() - birthDate.getFullYear();
                  const hasBirthdayPassed = today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

                  const actualAge = hasBirthdayPassed ? age : age - 1;

                  if (actualAge < 18) return 'You must be at least 18 years old';

                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required={true}
                  label={trans('Date of birth')}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true },
                    formHelperText: {
                      sx: { ml: 0 },
                    },
                  }}
                  error={!!errors.dob}
                  helperText={errors.dob?.message}
                />
              )}
            />
            <FormHelperText sx={{ ml: 0 }}>{trans('To sign up, you need to be at least 18. Your birthday won’t be shared with other people who use ReluxRent.')}</FormHelperText>
          </FormControl>
          <FormControlLabel control={<Checkbox color="secondary" />} label={<Typography fontSize={13}>{trans("I don' want to receive marketing messages from ReluxRent.")}</Typography>} />
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        {/* Done Button Fixed for Mobile */}
        <Box
          sx={{
            width: '100%',
            padding: 2,
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-end' },
          }}
        >
          <Button variant="contained" sx={{ width: { xs: '100%', sm: '20%' } }} color="primary" type="submit" loading={loading} loadingPosition="start">
            {trans('Done')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
