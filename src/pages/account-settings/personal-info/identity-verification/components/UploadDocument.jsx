import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Box, Button, Divider, Link as MuiLink, Paper, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';

export default function UploadDocument({ onNext }) {
  const { trans } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, setValue } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/api/host/start-verification', data);
      await mutate(
        '/api/host/verifications-data',
        async () => {
          const res = await api.get('/api/host/verifications-data');
          return res.data;
        },
        { revalidate: false },
      );
    } catch (error) {
      console.log('error', error);
      enqueueSnackbar(error?.response?.data?.message, { variant: 'error' });
      console.log('❌ Create error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setValue('userId', user?.id);
  }, [user]);

  return (
    <Box width={'100%'} mx="auto">
      <Button onClick={router.back} startIcon={<ArrowLeft size={18} color="#1e293b" />} variant="text" sx={{ textTransform: 'none', color: '#1e293b' }}>
        {trans('Back')}
      </Button>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 0, md: 2 },
        }}
      >
        {/* Left section */}
        <Box flex={1} sx={{ alignSelf: 'start' }}>
          <Typography sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} fontWeight={600} gutterBottom>
            {trans("Let's add your government ID")}
          </Typography>
          <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }} color="text.secondary" gutterBottom>
            {trans("We'll need you to add an official government ID. This step helps make sure you're really you.")}
          </Typography>
          <br />
          <Typography sx={{ fontSize: { xs: '13px', sm: '15px' } }} color="text.secondary">
            {trans("Depending on what country you're from, you can add a driver's license, passport, or national identity card.")}
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>
        {/* Right box */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            maxWidth: 300,
            borderRadius: 2,
          }}
          className="self-start"
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Your privacy
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {trans('We aim to keep the data you share during this process private, safe, and secure. Learn more in our')}{' '}
            <MuiLink href="/help/privacy-policy" underline="hover">
              {trans('Privacy Policy')}
            </MuiLink>
            .
          </Typography>
          <MuiLink href="#" underline="hover" fontSize={14}>
            {trans('How identity verification works')}
          </MuiLink>
        </Paper>
      </Box>
      {/* Navigation Button */}
      <Button onClick={handleSubmit(onSubmit)} variant="contained" color="inherit" sx={{ borderRadius: 1, fontWeight: 600, textTransform: 'none', mt: { xs: 2, md: 0 } }}>
        {trans('Upload Photo')}
      </Button>
    </Box>
  );
}
