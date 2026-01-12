import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';

const IdentityVerification = ({ editingKey, setEditingKey }) => {
  const { trans } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log('Data', data);
  };

  return (
    <Box py={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {trans('Identity verification')}
      </Typography>
      {editingKey === 'identityVerification' && (
        <Typography variant="body2" color="text.secondary">
          {trans('This is how your first name will appear to hosts and guests.')} {trans('Learn more')}
        </Typography>
      )}
      {editingKey === 'identityVerification' ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mt={1}>
            <Controller
              name="identityVerification"
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
            {trans('Not started')}
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
            component={Link}
            href={'/account-settings/personal-info/identity-verification'}
            variant="text"
            size="small"
          >
            {trans('Start')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default IdentityVerification;
