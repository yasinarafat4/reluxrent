import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, SaveIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const MapWithAutocomplete = dynamic(() => import('@/components/MapWithAutocomplete'), { ssr: false });

const Location = ({ propertyData, countriesData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const methods = useForm({
    defaultValues: {
      addressLine1: propertyData?.propertyAddress?.addressLine1 ?? '',
      addressLine2: propertyData?.propertyAddress?.addressLine2 ?? '',
      country: propertyData?.propertyAddress?.country ?? null,
      state: propertyData?.propertyAddress?.state ?? null,
      city: propertyData?.propertyAddress?.city ?? null,
      postal_code: propertyData?.propertyAddress?.postal_code ?? '',
      latitude: propertyData?.propertyAddress?.latitude,
      longitude: propertyData?.propertyAddress?.longitude,
    },
  });
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const watchCountries = methods.watch('country');
  const watchStates = methods.watch('state');
  const watchLatitude = methods.watch('latitude');
  const watchLongitude = methods.watch('longitude');

  useEffect(() => {
    if (!watchCountries?.id) return;
    const getStatesData = async (countryId) => {
      const res = await api.get(`/api/host/states/${countryId}`);
      setStates(res.data.data || []);
    };
    getStatesData(watchCountries?.id);
  }, [watchCountries]);

  useEffect(() => {
    if (!watchStates?.id) return;
    const getCitiesData = async (stateId) => {
      const res = await api.get(`/api/host/cities/${stateId}`);
      setCities(res.data.data || []);
    };
    getCitiesData(watchStates?.id);
  }, [watchStates]);

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  const onSubmit = async (formData) => {
    console.log('formData', formData);
    if (!watchLatitude || !watchLongitude) {
      enqueueSnackbar("Adjust the marker to set your property's precise position.", { anchorOrigin: { vertical: 'top', horizontal: 'right' }, variant: 'error' });
      return;
    }
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/location`, formData);
      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/floor-plan?tab=space`);
      }
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating property', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {/* Sidebar */}
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        <Box sx={{ ml: conditionalMarginLeft }}>
          <FormProvider {...methods}>
            <Box component="form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
              <Box
                sx={{
                  width: { xs: '100%', sm: '80%', xl: '60%' },
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
                  <Typography variant="h2" fontWeight={500} gutterBottom>
                    Where's your place located?
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
                    Use the search bar to find your address, then drag the map to fine-tune the marker's position and ensure it's placed exactly where your property is.
                  </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <MapWithAutocomplete />
                  <Stack gap={2}>
                    <Controller
                      name="addressLine1"
                      control={methods.control}
                      rules={{ required: 'Address Line 1 is required' }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          sx={[
                            (theme) => ({
                              '& .MuiFormHelperText-root': {
                                ml: 0,
                              },
                            }),
                            (theme) =>
                              theme.applyStyles('dark', {
                                '& .MuiInputLabel-root': {
                                  color: theme.palette.grey[400],
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: theme.palette.common.white,
                                },
                              }),
                          ]}
                          label="Address Line 1"
                          size="small"
                          variant="outlined"
                          fullWidth
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{ inputLabel: { shrink: !!field.value } }}
                        />
                      )}
                    />

                    <Controller
                      name="addressLine2"
                      control={methods.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          sx={[
                            (theme) => ({
                              '& .MuiFormHelperText-root': {
                                ml: 0,
                              },
                            }),
                            (theme) =>
                              theme.applyStyles('dark', {
                                '& .MuiInputLabel-root': {
                                  color: theme.palette.grey[400],
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: theme.palette.common.white,
                                },
                              }),
                          ]}
                          label="Address Line 2"
                          size="small"
                          variant="outlined"
                          fullWidth
                          slotProps={{ inputLabel: { shrink: !!field.value } }}
                        />
                      )}
                    />

                    {/* Country */}
                    <Controller
                      name="country"
                      control={methods.control}
                      rules={{ required: 'Country is required' }}
                      render={({ field, fieldState }) => (
                        <Autocomplete
                          size="small"
                          options={countriesData}
                          autoHighlight
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          value={field.value || null}
                          onChange={(_, data) => {
                            field.onChange(data);
                            methods.setValue('state', null);
                            methods.setValue('city', null);
                            setCities([]);
                          }}
                          renderInput={(params) => <TextField {...params} required label="Choose a country" error={!!fieldState.error} helperText={fieldState.error?.message} />}
                        />
                      )}
                    />

                    <Controller
                      name="state"
                      control={methods.control}
                      rules={{ required: 'State is required' }}
                      render={({ field, fieldState }) => (
                        <Autocomplete
                          size="small"
                          options={states}
                          disabled={!watchCountries}
                          autoHighlight
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          value={field.value || null}
                          onChange={(_, data) => {
                            field.onChange(data);
                            methods.setValue('city', null);
                          }}
                          renderInput={(params) => <TextField {...params} required label="Choose a state" error={!!fieldState.error} helperText={fieldState.error?.message} />}
                        />
                      )}
                    />

                    <Controller
                      name="city"
                      control={methods.control}
                      rules={{ required: 'City is required' }}
                      render={({ field, fieldState }) => (
                        <Autocomplete
                          size="small"
                          options={cities}
                          disabled={!watchStates}
                          autoHighlight
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          value={field.value || null}
                          onChange={(_, data) => field.onChange(data)}
                          renderInput={(params) => <TextField {...params} required label="Choose a city" error={!!fieldState.error} helperText={fieldState.error?.message} />}
                        />
                      )}
                    />

                    <Controller
                      name="postal_code"
                      control={methods.control}
                      rules={{ required: 'Postal Code is required' }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          sx={[
                            (theme) => ({
                              '& .MuiFormHelperText-root': {
                                ml: 0,
                              },
                            }),
                            (theme) =>
                              theme.applyStyles('dark', {
                                '& .MuiInputLabel-root': {
                                  color: theme.palette.grey[400],
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: theme.palette.common.white,
                                },
                              }),
                          ]}
                          label="ZIP / Postal Code"
                          size="small"
                          variant="outlined"
                          fullWidth
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{ inputLabel: { shrink: !!field.value } }}
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
                      href={`/host/property/${id}/edit/space-type?tab=space`}
                      size="small"
                      startIcon={<ChevronsLeft />}
                      variant="outlined"
                      sx={[
                        (theme) => ({
                          textTransform: 'none',
                          px: 2,
                        }),
                        (theme) => theme.applyStyles('dark', {}),
                      ]}
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
          </FormProvider>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default Location;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [propertyData, countriesData] = await Promise.all([
      api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
      api.get(`/api/host/countries`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
    ]);
    return {
      props: {
        propertyData,
        countriesData,
      },
    };
  } catch (error) {
    console.error('Error fetching property types:', error);
    return {
      props: {
        propertyData: [],
        countriesData: [],
      },
    };
  }
}
