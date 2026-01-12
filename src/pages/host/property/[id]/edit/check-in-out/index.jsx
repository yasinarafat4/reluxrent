import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const CheckInOut = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const suffix = i < 12 ? 'AM' : 'PM';
    return `${hour}:00${suffix}`;
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startCheckInTime: propertyData?.propertyRulesAndManual.startCheckInTime ?? null,
      endCheckInTime: propertyData?.propertyRulesAndManual.endCheckInTime ?? null,
      checkOutTime: propertyData?.propertyRulesAndManual.checkOutTime ?? null,
    },
  });

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/check-in-out`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error updating check in out', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                <Typography variant="h2" fontWeight={500} gutterBottom>
                  Check-in & Checkout Times
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
                  Set the time window when guests can check in and must check out of your property.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  my: 1,
                }}
              >
                <Stack width="100%" gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Check-in Time
                  </Typography>

                  {/* Start Check-in Time */}
                  <FormControl fullWidth>
                    <InputLabel id="start-time-label">Start time</InputLabel>
                    <Controller
                      name="startCheckInTime"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} labelId="start-time-label" label="Start time" MenuProps={{ PaperProps: { sx: { maxHeight: 400, zIndex: 1050 } } }}>
                          {timeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  {/* End Check-in Time */}
                  <FormControl fullWidth>
                    <InputLabel id="end-checkin-label">End time</InputLabel>
                    <Controller
                      name="endCheckInTime"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} labelId="end-checkin-label" label="End time" MenuProps={{ PaperProps: { sx: { maxHeight: 400, zIndex: 1050 } } }}>
                          {timeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Stack>

                {/* Checkout Time */}
                <Stack width="100%" gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Check-out Time
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="checkout-label">End time</InputLabel>
                    <Controller
                      name="checkOutTime"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} labelId="checkout-label" label="End time" MenuProps={{ PaperProps: { sx: { maxHeight: 400, zIndex: 1050 } } }}>
                          {timeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
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
                      borderRadius: 2,
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
      </Box>
    </HostingLayout>
  );
};

export default CheckInOut;

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
    console.error('Error fetching check-in/out page:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
