import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, Minus, Plus, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const CounterRow = forwardRef(({ label, value, onChange, min = 0, max = Infinity, fieldState }, ref) => {
  const [inputValue, setInputValue] = useState(value || min);

  const onIncrement = () => {
    if (inputValue < max) {
      const newValue = inputValue + 1;
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  const onDecrement = () => {
    if (inputValue > min) {
      const newValue = inputValue - 1;
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <Box
      ref={ref}
      sx={[
        (theme) => ({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          bgcolor: 'background.paper',
          width: '100%',
          px: 2,
          py: 1.5,
          border: `1px solid ${fieldState?.error ? theme.palette.error.main : 'divider'} `,
          borderRadius: 1,
        }),
        (theme) =>
          theme.applyStyles('dark', {
            // bgcolor: theme.palette.common.black,
            // color: theme.palette.common.white,
          }),
      ]}
    >
      <Typography
        variant="subtitle1"
        sx={[
          (theme) => ({
            color: fieldState?.error ? theme.palette.error.main : '',
          }),
          (theme) =>
            theme.applyStyles('dark', {
              // bgcolor: theme.palette.common.black,
              // color: theme.palette.common.white,
            }),
        ]}
      >
        {label}
        {fieldState?.error && (
          <Typography
            variant="body2"
            sx={[
              (theme) => ({
                color: fieldState?.error ? theme.palette.error.main : '',
              }),
            ]}
          >
            {fieldState?.error?.message}
          </Typography>
        )}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          sx={[
            (theme) => ({
              '&.Mui-disabled': {
                pointerEvents: 'auto',
                cursor: 'not-allowed',
              },
            }),
            (theme) =>
              theme.applyStyles('dark', {
                color: theme.palette.common.white,
              }),
          ]}
          onClick={onDecrement}
          disabled={inputValue <= min}
        >
          <Minus size={16} />
        </IconButton>
        <Typography>{inputValue}</Typography>
        <IconButton
          sx={[
            (theme) => ({
              '&.Mui-disabled': {
                pointerEvents: 'auto',
                cursor: 'not-allowed',
              },
            }),
            (theme) =>
              theme.applyStyles('dark', {
                color: theme.palette.common.white,
              }),
          ]}
          onClick={onIncrement}
        >
          <Plus size={16} />
        </IconButton>
      </Box>
    </Box>
  );
});

const BookingSettings = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      minimumStay: propertyData?.minimumStay || 1,
      bookingType: propertyData?.bookingType,
    },
  });

  const watchSelected = watch('bookingType');

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/booking-settings`, formData);
      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/price?tab=space`);
      }
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating booking type', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {/* Sidebar */}
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ml: conditionalMarginLeft }}>
          <Box
            sx={{
              width: { xs: '100%', sm: '70%', lg: '50%' },
              mx: 'auto',
            }}
          >
            {/* Small device back button */}
            {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=space`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
              <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>}
            {/* Title */}
            <Box my={3} width={'100%'}>
              <Typography variant="h2" gutterBottom>
                What kind of space will you host?
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
                Let guests know what parts of the space they'll have access.
              </Typography>
            </Box>

            {/* Booking Settings */}
            <Stack gap={{ xs: 1, sm: 2 }}>
              {/* Minimum Stay */}
              <Controller
                name="minimumStay"
                control={control}
                rules={{ required: 'Required!', validate: (value) => value !== 0 || 'Required' }}
                render={({ field, fieldState }) => <CounterRow min={1} width={'100%'} fieldState={fieldState} {...field} label="Minimum stay" />}
              />

              {/* Booking Types */}
              <Box>
                <Typography mb={{ xs: 0.5, sm: 0.7 }} variant="h6">
                  Select booking type
                </Typography>
                <Controller
                  name="bookingType"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Box
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 1, sm: 2 },
                      }}
                    >
                      <Box
                        sx={[
                          (theme) => ({
                            borderRadius: 1,
                            padding: { xs: 1.5, sm: theme.spacing(3) },
                            textAlign: 'start',
                            cursor: 'pointer',
                            width: '100%',
                            mx: 'auto',
                            border: '1px solid',
                            boxShadow: watchSelected == 'request' && `0 0 0 1px ${theme.palette.common.black}`,
                            transition: '0.4s',
                            borderColor: watchSelected == 'request' ? theme.palette.common.black : theme.palette.grey[400],
                            bgcolor: watchSelected == 'request' ? theme.palette.grey[100] : theme.palette.common.white,
                            '&:hover': {
                              boxShadow: `0 0 0 1px ${theme.palette.common.black}`,
                              bgcolor: theme.palette.grey[50],
                              borderColor: theme.palette.common.black,
                            },
                          }),
                          (theme) =>
                            theme.applyStyles('dark', {
                              boxShadow: watchSelected == 'request' && `0 0 0 1px ${theme.palette.common.white}`,
                              borderColor: watchSelected == 'request' ? theme.palette.common.white : theme.palette.grey[500],
                              bgcolor: watchSelected == 'request' ? theme.palette.grey[900] : theme.palette.common.black,
                              '&:hover': {
                                boxShadow: `0 0 0 1px ${theme.palette.common.white}`,
                                bgcolor: theme.palette.grey[900],
                                borderColor: theme.palette.common.white,
                              },
                            }),
                        ]}
                        onClick={() => onChange('request')}
                      >
                        <Box>
                          <Typography variant="subtitle1">Review each request.</Typography>
                          <Typography
                            sx={[
                              (theme) => ({
                                color: theme.palette.grey[700],
                              }),
                              (theme) =>
                                theme.applyStyles('dark', {
                                  color: theme.palette.grey[500],
                                }),
                            ]}
                            variant="body2"
                          >
                            Review requests first, then enable Instant Book for automatic bookings.
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={[
                          (theme) => ({
                            borderRadius: 1,
                            padding: { xs: 1.5, sm: theme.spacing(3) },
                            textAlign: 'start',
                            cursor: 'pointer',
                            width: '100%',
                            mx: 'auto',
                            border: '1px solid',
                            boxShadow: watchSelected == 'instant' && `0 0 0 1px ${theme.palette.common.black}`,
                            transition: '0.4s',
                            borderColor: watchSelected == 'instant' ? theme.palette.common.black : theme.palette.grey[400],
                            bgcolor: watchSelected == 'instant' ? theme.palette.grey[100] : theme.palette.common.white,
                            '&:hover': {
                              boxShadow: `0 0 0 1px ${theme.palette.common.black}`,
                              bgcolor: theme.palette.grey[50],
                              borderColor: theme.palette.common.black,
                            },
                          }),
                          (theme) =>
                            theme.applyStyles('dark', {
                              boxShadow: watchSelected == 'instant' && `0 0 0 1px ${theme.palette.common.white}`,
                              borderColor: watchSelected == 'instant' ? theme.palette.common.white : theme.palette.grey[500],
                              bgcolor: watchSelected == 'instant' ? theme.palette.common.black : theme.palette.grey[900],
                              '&:hover': {
                                boxShadow: `0 0 0 1px ${theme.palette.common.white}`,
                                bgcolor: theme.palette.grey[900],
                                borderColor: theme.palette.common.white,
                              },
                            }),
                        ]}
                        onClick={() => onChange('instant')}
                      >
                        <Box>
                          <Typography variant="subtitle1">Guest book instantly.</Typography>
                          <Typography
                            sx={[
                              (theme) => ({
                                color: theme.palette.grey[700],
                              }),
                              (theme) =>
                                theme.applyStyles('dark', {
                                  color: theme.palette.grey[500],
                                }),
                            ]}
                            variant="body2"
                          >
                            Start allowing automatic bookings
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
            </Stack>
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
            {propertyData.allStepsCompleted ? (
              <Box>
                <Button
                  type="submit"
                  size="small"
                  loading={loading}
                  loadingPosition="end"
                  startIcon={<SaveIcon size={17} />}
                  sx={{
                    textTransform: 'none',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
                    color: (theme) => (theme.palette.mode === 'dark' ? 'black' : 'white'),
                    px: 2,
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                      bgcolor: 'divider',
                      color: 'common.white',
                    },
                  }}
                >
                  {trans('Save')}
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Button
                  component={Link}
                  href={`/host/property/${id}/edit/descriptions`}
                  size="small"
                  startIcon={<ChevronsLeft />}
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    px: 2,
                  }}
                >
                  {trans('Back')}
                </Button>

                <Button
                  type="submit"
                  size="small"
                  loading={loading}
                  loadingPosition="end"
                  endIcon={<ChevronsRight />}
                  variant="contained"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    px: 2,
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                      bgcolor: 'divider',
                    },
                  }}
                >
                  {trans('Next')}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default BookingSettings;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [spaceTypesData, propertyData] = await Promise.all([
      api.get(`/api/host/space-type?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
      api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
    ]);

    return {
      props: {
        spaceTypesData,
        propertyData,
      },
    };
  } catch (error) {
    // Handle other errors (e.g., network, server errors)
    console.error('Error fetching space types:', error);
    return {
      props: {
        spaceTypesData: [],
        propertyData: [],
      },
    };
  }
}
