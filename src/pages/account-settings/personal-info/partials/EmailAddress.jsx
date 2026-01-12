import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

const EmailAddress = ({ editingKey, setEditingKey, data }) => {
  const { trans } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log('Data', data);
  };

  //  Mask (***) Email
  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return email;

    const [user, domain] = email.split('@');

    if (user.length <= 2) {
      return `${user[0]}***@${domain}`;
    }

    return `${user[0]}***${user.slice(-1)}@${domain}`;
  };

  return (
    <Box py={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {trans('Email address')}
      </Typography>
      {editingKey === 'emailAddress' && (
        <Typography variant="body2" color="text.secondary">
          {trans('Use an address you’ll always have access to.')}
        </Typography>
      )}
      {editingKey === 'emailAddress' ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mt={1}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: trans('Email is required'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: trans('Please enter a valid email address'),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={trans('Email address')}
                  fullWidth
                  size="small"
                  slotProps={{
                    formHelperText: {
                      sx: { ml: 0 },
                    },
                  }}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Box>
          <Box mt={1} display="flex" gap={1}>
            <Button sx={{ textTransform: 'none' }} variant="contained" size="small" type="submit">
              {trans('Save')}
            </Button>
            <Button sx={{ textTransform: 'none' }} variant="outlined" size="small" onClick={() => setEditingKey(null)}>
              {trans('Cancel')}
            </Button>
          </Box>
        </form>
      ) : (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" color="text.secondary">
            {data ? maskEmail(data) : trans('Not provided')}
          </Typography>
          <Button
            sx={{
              textTransform: 'none',
              bgcolor: 'transparent',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            variant="text"
            size="small"
            onClick={() => setEditingKey('emailAddress')}
          >
            {trans('Edit')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EmailAddress;
