import PhoneInputField from '@/components/PhoneInputField';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const EmergencyContact = ({ editingKey, setEditingKey, data }) => {
  const [language, setLanguage] = useState('English');
  const { trans } = useTranslation();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue('emergencyContact', data);
  }, [data, setValue]);

  const onSubmit = (data) => {
    console.log('Data', data);
  };

  return (
    <Box py={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {trans('Emergency Contact')}
      </Typography>
      {editingKey === 'emergencyContact' && (
        <Typography variant="body2" color="text.secondary">
          {trans('A trusted contact we can alert in an urgent situation.')}
        </Typography>
      )}
      {editingKey === 'emergencyContact' ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mt={2}>
            <TextField label="Name" fullWidth sx={{ mb: 2 }} size="small" />
            <TextField label="Relationship" fullWidth sx={{ mb: 2 }} size="small" />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Preferred Language</InputLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} size="small" label="Country/region">
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Bengali">Bengali</MenuItem>
                <MenuItem value="French">French</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Email" fullWidth size="small" />
            {/*  Phone Field */}
            <PhoneInputField control={control} name="phone" label={trans('Phone number')} />
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
            onClick={() => setEditingKey('emergencyContact')}
          >
            {trans('Add')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EmergencyContact;
