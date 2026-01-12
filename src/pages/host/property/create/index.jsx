import HostingLayout from '@/components/layout/host/HostingLayout';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PublishIcon from '@mui/icons-material/Publish';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useRouter } from 'next/router';

const steps = [
  {
    number: 1,
    title: 'Set up your place',
    desc: 'Add some basic details, like location, type of place, and how many guests you can host.',
    icon: <HomeWorkIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: 'primary.main' }} />,
  },
  {
    number: 2,
    title: 'Make it shine',
    desc: "Upload photos, write a great title and description, we'll guide you along the way.",
    icon: <PhotoCameraIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: 'primary.main' }} />,
  },
  {
    number: 3,
    title: 'Publish and go live',
    desc: 'Choose your price, review your info, and list your place for guests to find.',
    icon: <PublishIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: 'primary.main' }} />,
  },
];

export default function CreateProperty() {
  const { trans } = useTranslation();
  const router = useRouter();
  const { activeCurrency } = useReluxRentAppContext();

  const onGetStartedClick = async () => {
    try {
      const { data, status } = await api.post('/api/host/property/create', { currencyId: activeCurrency.id });
      if (status == 201) {
        router.push(`/host/property/${data.id}/edit/property-type`);
      }
    } catch (error) {
      console.error('Error creating property', error);
    }
  };

  return (
    <HostingLayout>
      <Box sx={{ p: { xs: 1, md: 2 }, height: { lg: 'calc(100vh - 265px)' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, gap: 4, alignItems: { xs: 'start', xl: 'center' } }}>
          {/* Title */}
          <Box>
            <Typography sx={{ fontSize: { xs: '20px', xl: '35px' }, fontWeight: '700' }} gutterBottom>
              Now hosting is simple with ReluxRent
            </Typography>
          </Box>

          {/* Steps */}
          <Box flex={1}>
            <Box display="flex" flexDirection="column" gap={3}>
              {steps.map((step, i) => (
                <Box key={i}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box>{step.icon}</Box>
                    <Box flex={1}>
                      <Typography sx={{ fontSize: { xs: '16px', xl: '20px' }, fontWeight: '600' }}>
                        {step.number} {step.title}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: '13px', xl: '16px' } }} color="text.secondary">
                        {step.desc}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Bottom Fixed Button */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            zIndex: '9999',
            gap: 2,
            px: { xs: 2, md: 4 },
            py: 2,
          }}
        >
          <Button
            onClick={() => onGetStartedClick()}
            variant="contained"
            sx={{
              textTransform: 'none',
              px: 3,
            }}
          >
            {trans('Get Started')}
          </Button>
        </Box>
      </Box>
    </HostingLayout>
  );
}
