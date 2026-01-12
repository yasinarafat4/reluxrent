import { useTranslation } from '@/contexts/TranslationContext';
import { Box } from '@mui/material';

import { Paper, Typography } from '@mui/material';
import { TicketsPlane } from 'lucide-react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

const Passport = () => {
  const { trans } = useTranslation();
  const { setValue, watch } = useFormContext();

  const previewImage = watch('passport');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setValue('passport', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box width={'100%'}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {trans('Upload an image of your passport')}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {trans("Make sure your photos aren\'t blurry and the front of your driver\'s license clearly shows your face.")}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          component="label"
          htmlFor="passport-upload"
          sx={{
            width: '100%',
            height: 300,
            cursor: 'pointer',
          }}
        >
          {previewImage ? (
            <Box position={'relative'} width={'100%'} height={300} border={'1px solid'} borderColor={'divider'} borderRadius={1}>
              <input id="passport-upload" type="file" accept="image/jpeg, image/png" hidden onChange={(e) => handleFileChange(e, 'passport')} />
              <Image src={previewImage} fill style={{ objectFit: 'cover', borderRadius: '10px' }} alt="Passport Image" />
            </Box>
          ) : (
            <Paper
              component="label"
              variant="outlined"
              sx={{
                height: '100%',
                border: '1px dashed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <input id="passport-upload" type="file" accept="image/jpeg, image/png" hidden onChange={(e) => handleFileChange(e, 'passport')} />
                <TicketsPlane size={32} style={{ marginBottom: 8 }} />
                <Typography fontWeight={600}>{trans('Upload passport')}</Typography>
                <Typography fontSize="0.85rem" color="text.secondary">
                  {trans('JPEG or PNG only')}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Passport;
