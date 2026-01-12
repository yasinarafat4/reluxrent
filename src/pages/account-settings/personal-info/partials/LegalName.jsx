import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

const LegalName = ({ editingKey, setEditingKey, data }) => {
  const { trans } = useTranslation();
  // react-hook-form setup
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const [firstName, lastName] = data.split(' ');
    setValue('firstName', firstName);
    setValue('lastName', lastName);
  }, [data, setValue]);

  const onSubmit = (data) => {
    console.log('Data', data);
  };

  return (
    <Box py={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {trans('Legal name')}
      </Typography>
      {editingKey === 'legalName' && (
        <Typography variant="body2" color="text.secondary">
          {trans('Make sure this matches the name on your government ID.')}
        </Typography>
      )}
      {editingKey === 'legalName' ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" gap={1} mt={1}>
            <Controller
              name="firstName"
              control={control}
              rules={{ required: trans('First name is required') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={trans('First name')}
                  size="small"
                  fullWidth
                  slotProps={{
                    formHelperText: {
                      sx: { ml: 0 },
                    },
                  }}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              rules={{ required: trans('Last name is required') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={trans('Last name')}
                  size="small"
                  fullWidth
                  slotProps={{
                    formHelperText: {
                      sx: { ml: 0 },
                    },
                  }}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
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
            {data}
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
            onClick={() => setEditingKey('legalName')}
          >
            {trans('Edit')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LegalName;
