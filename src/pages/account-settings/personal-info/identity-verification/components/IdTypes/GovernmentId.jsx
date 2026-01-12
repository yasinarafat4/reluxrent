import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Paper, Typography } from '@mui/material';
import { CreditCard, IdCard } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

const GovernmentId = () => {
  const { trans } = useTranslation();
  const [backImage, setBackImage] = useState(null);

  const { setValue, watch } = useFormContext();

  const watchFrontImage = watch('front');
  const watchBackImage = watch('back');

  const handleFileChange = (e, side) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        side === 'front' ? setValue('front', base64String) : setValue('back', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box width={'100%'}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {trans('Upload images of your identity card')}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {trans("Make sure your photos aren\'t blurry and the front of your NID card clearly shows your face.")}
      </Typography>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Front */}
        <Box
          component="label"
          htmlFor="front-upload"
          sx={{
            width: '100%',
            height: 200,
            cursor: 'pointer',
          }}
        >
          {watchFrontImage ? (
            <Box position={'relative'} width={'100%'} height={200} border={'1px solid'} borderColor={'divider'} borderRadius={1}>
              <input id="front-upload" type="file" accept="image/jpeg, image/png" hidden onChange={(e) => handleFileChange(e, 'front')} />
              <Image src={watchFrontImage} fill style={{ objectFit: 'cover', borderRadius: '10px' }} alt="Front Image" />
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
                <input id="front-upload" type="file" accept="image/jpeg, image/png" hidden onChange={(e) => handleFileChange(e, 'front')} />
                <IdCard size={32} style={{ marginBottom: 8 }} />
                <Typography fontWeight={600}>{trans('Upload front')}</Typography>
                <Typography fontSize="0.85rem" color="text.secondary">
                  {trans('JPEG or PNG only')}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
        {/* Back */}
        <Box
          component="label"
          htmlFor="back-upload"
          sx={{
            width: '100%',
            height: 200,
            cursor: 'pointer',
          }}
        >
          {watchBackImage ? (
            <Box position={'relative'} width={'100%'} height={200} border={'1px solid'} borderColor={'divider'} borderRadius={1}>
              <input id="back-upload" type="file" accept="image/jpeg, image/png" hidden onChange={(e) => handleFileChange(e, 'back')} />
              <Image src={watchBackImage} fill style={{ objectFit: 'cover', borderRadius: '10px' }} alt="Front Image" />
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
                <input id="back-upload" type="file" accept="image/jpeg, image/png" hidden onChange={(e) => handleFileChange(e, 'back')} />
                <CreditCard size={32} style={{ marginBottom: 8 }} />
                <Typography fontWeight={600}>{trans('Upload back')}</Typography>
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

export default GovernmentId;
