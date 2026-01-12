import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

const PreferredName = ({ editingKey, setEditingKey, data }) => {
  const { trans } = useTranslation();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue('preferredName', data);
  }, [data, setValue]);

  const onSubmit = (data) => {
    console.log('Data', data);
  };

  return (
    <Box py={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {trans('Preferred first name')}
      </Typography>
      {editingKey === 'preferredName' && (
        <Typography variant="body2" color="text.secondary">
          {trans('This is how your first name will appear to hosts and guests.')} {trans('Learn more')}
        </Typography>
      )}
      {editingKey === 'preferredName' ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mt={1}>
            <Controller
              name="preferredName"
              control={control}
              rules={{
                maxLength: {
                  value: 50,
                  message: trans('Preferred name must be under 50 characters'),
                },
              }}
              render={({ field }) => <TextField {...field} label={trans('Preferred first name (optional)')} fullWidth size="small" />}
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
            {data ? data : trans('Not provided')}
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
            onClick={() => setEditingKey('preferredName')}
          >
            {trans('Edit')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PreferredName;
