import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const Address = ({ editingKey, setEditingKey, data }) => {
  const [country, setCountry] = useState('United States');
  const { trans } = useTranslation();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue('address', data);
  }, [data, setValue]);

  const onSubmit = (data) => {
    console.log('Data', data);
  };

  return (
    <Box py={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {trans('Address')}
      </Typography>
      {editingKey === 'address' && (
        <Typography variant="body2" color="text.secondary">
          {trans('Use a permanent address where you can receive mail.')}
        </Typography>
      )}
      {editingKey === 'address' ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mt={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Country/region</InputLabel>
              <Select value={country} onChange={(e) => setCountry(e.target.value)} size="small" label="Country/region">
                <MenuItem value="United States">United States</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="Mexico">Mexico</MenuItem>
              </Select>
            </FormControl>

            <TextField label="Street address" fullWidth sx={{ mb: 2 }} size="small" />
            <TextField label="Apt, suite. (optional)" fullWidth sx={{ mb: 2 }} size="small" />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <TextField label="City" fullWidth size="small" />
              <TextField label="State / Province / County / Region" fullWidth size="small" />
            </Box>

            <TextField label="ZIP code" sx={{ my: 2, width: { xs: '100%', md: '49%' } }} size="small" />
          </Box>
          <Box display="flex" gap={1}>
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
            {data ? data : trans('Not added')}
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
            onClick={() => setEditingKey('address')}
          >
            {trans('Add')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Address;
