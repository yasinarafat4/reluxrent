import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getCookie } from 'cookies-next';
import { SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const WifiDetails = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      wifiName: propertyData?.propertyRulesAndManual?.wifiName,
      wifiPassword: propertyData?.propertyRulesAndManual?.wifiPassword,
    },
  });

  const onSubmit = async (formData) => {
    console.log('Submitted Data:', formData);
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/property-rules`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error updating property rules', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate py={2}>
          {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}

          <Box sx={{ ml: { md: '400px' } }}>
            <Box
              sx={{
                width: { xs: '100%', sm: '70%', lg: '50%' },
                mx: 'auto',
              }}
            >
              {/* Small device back button */}
              {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=arrival`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
                <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>}

              {/* Title */}
              <Box my={3} width="100%">
                <Typography variant="h2" gutterBottom>
                  Wifi details
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={[
                    (theme) => ({
                      color: theme.palette.grey[700],
                    }),
                    (theme) =>
                      theme.applyStyles('dark', {
                        color: theme.palette.grey[500],
                      }),
                  ]}
                >
                  Share your Wi-Fi name and password so guests can stay connected.
                </Typography>
              </Box>

              <Stack spacing={1} width={{ xs: '100%', lg: '80%' }}>
                {/* Network Name */}
                <Controller
                  name="wifiName"
                  control={control}
                  rules={{ required: 'Network name is required!' }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      fullWidth
                      required
                      label="Network name"
                      error={!!errors.networkName}
                      helperText={errors.networkName?.message}
                      sx={{
                        borderRadius: 2,
                        '& .MuiFormHelperText-root': {
                          ml: 0,
                        },
                      }}
                      slotProps={{
                        input: {
                          sx: { borderRadius: 2 },
                        },
                      }}
                    />
                  )}
                />

                {/* Password */}
                <Controller
                  name="wifiPassword"
                  control={control}
                  rules={{ required: 'Password is required!' }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      fullWidth
                      required
                      label="Password"
                      type="text"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      sx={{
                        borderRadius: 2,
                        '& .MuiFormHelperText-root': {
                          ml: 0,
                        },
                      }}
                      slotProps={{
                        input: {
                          sx: { borderRadius: 2 },
                        },
                      }}
                    />
                  )}
                />
              </Stack>
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
            <Box>
              <Button
                type="submit"
                size="small"
                loading={loading}
                loadingPosition="end"
                startIcon={<SaveIcon size={17} />}
                sx={[
                  (theme) => ({
                    textTransform: 'none',
                    px: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
                    color: (theme) => (theme.palette.mode === 'dark' ? 'black' : 'white'),
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                      bgcolor: theme.palette.grey[600],
                      color: theme.palette.grey[100],
                      opacity: 0.7,
                    },
                  }),
                ]}
              >
                {trans('Save')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default WifiDetails;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [propertyData] = await Promise.all([api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || [])]);

    return {
      props: {
        propertyData,
      },
    };
  } catch (error) {
    console.error('Error fetching Wifi details:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
