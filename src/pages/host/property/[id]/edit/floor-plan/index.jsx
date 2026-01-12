import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Add, Delete } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, Minus, Plus, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const BedroomBeds = ({ bedTypes, bedroomIndex, control, trans }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `bedrooms_data.${bedroomIndex}.beds`,
  });

  return (
    <Box mb={1} sx={{ width: '100%', border: '1px solid', borderColor: 'divider', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', bgcolor: 'background.paper', px: 2, py: 1.5, borderRadius: 1 }}>
      <Typography variant="body1" mb={1}>
        {trans('Bedroom')} {bedroomIndex + 1}
      </Typography>

      {fields.map((field, bedIndex) => (
        <Box key={field.id} mb={1}>
          <Stack direction={'row'} justifyContent={'center'} alignItems={'start'} gap={1}>
            <Controller
              name={`bedrooms_data.${bedroomIndex}.beds.${bedIndex}.bed_type`}
              control={control}
              rules={{ required: 'Required!' }}
              render={({ field, fieldState }) => (
                <FormControl sx={{ width: '250px' }} size="small" error={!!fieldState.error}>
                  <InputLabel id={`bed-label-${bedIndex}`}>Bed Type</InputLabel>
                  <Select labelId={`bed-label-${bedIndex}`} id={`bed-select-${bedIndex}`} {...field} label="Bed Type">
                    {bedTypes.map((bedtype) => (
                      <MenuItem key={bedtype.id} value={bedtype.name}>
                        {bedtype.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name={`bedrooms_data.${bedroomIndex}.beds.${bedIndex}.quantity`}
              control={control}
              rules={{ required: 'Required!' }}
              render={({ field, fieldState }) => <TextField type="number" label="Quantity" fullWidth {...field} error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />}
            />
            <IconButton
              color="error"
              onClick={() => remove(bedIndex)}
              disabled={fields.length === 1}
              sx={{
                '&.Mui-disabled': {
                  pointerEvents: 'auto',
                  cursor: 'not-allowed',
                  bgcolor: 'divider',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Stack>
        </Box>
      ))}

      <Box mt={1}>
        <Button
          onClick={() =>
            append({
              bed_type: '',
              quantity: 1,
            })
          }
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none' }}
          startIcon={<Add />}
        >
          {trans('Add Bed')}
        </Button>
      </Box>
    </Box>
  );
};

const CounterRow = forwardRef(({ label, value, onChange, min = 0, max = 100, fieldState }, ref) => {
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
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          bgcolor: 'background.paper',
          width: '100%',
          px: 2,
          py: 1.5,
          border: `1px solid ${fieldState?.error ? theme.palette.error.main : 'divider'} `,
          borderRadius: 1,
        }),
      ]}
    >
      <Typography
        variant="subtitle1"
        sx={[
          (theme) => ({
            color: fieldState?.error ? theme.palette.error.main : '',
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

const FloorPlan = ({ bedTypes, propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      accommodates: propertyData?.accommodates,
      bedrooms: propertyData?.bedrooms,
      bathrooms: propertyData?.bathrooms,
      bedrooms_data: propertyData?.bedrooms_data || [],
    },
  });

  const watchBedroomsData = watch('bedrooms_data');
  const watchBedrooms = watch('bedrooms');

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  useEffect(() => {
    if (watchBedrooms === undefined) return;

    const current = getValues('bedrooms_data') || [];
    if (current.length === watchBedrooms) return;

    const updated = Array.from({ length: watchBedrooms }, (_, index) => ({
      beds: current?.[index]?.beds?.length ? current[index].beds : [{ bed_type: '', quantity: 1 }],
    }));

    setValue('bedrooms_data', updated);
  }, [watchBedrooms]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/floor-plan`, formData);

      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/amenities?tab=space`);
      }
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating', error);
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
                Basic information first
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
                You can add details like beds, bathrooms, and guests later.
              </Typography>
            </Box>

            <Stack gap={2}>
              {/* Floor Plans */}
              <Controller
                name="bedrooms"
                control={control}
                rules={{ required: 'Required!', validate: (value) => value !== 0 || 'Required' }}
                render={({ field, fieldState }) => <CounterRow width={'100%'} fieldState={fieldState} {...field} label="Bedrooms" />}
              />

              {watchBedroomsData.map((_, bedroomIndex) => (
                <BedroomBeds width={'100%'} key={bedroomIndex} control={control} trans={trans} bedroomIndex={bedroomIndex} bedTypes={bedTypes} />
              ))}

              <Controller
                name="bathrooms"
                control={control}
                rules={{ required: 'Required!', validate: (value) => value !== 0 || 'Required' }}
                render={({ field, fieldState }) => <CounterRow width={'100%'} fieldState={fieldState} {...field} label="Bathrooms" />}
              />

              <Controller
                name="accommodates"
                control={control}
                rules={{ required: 'Required!', validate: (value) => value !== 0 || 'Required' }}
                render={({ field, fieldState }) => <CounterRow width={'100%'} fieldState={fieldState} {...field} label="Guests" />}
              />
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
                  href={`/host/property/${id}/edit/location?tab=space`}
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
      </Box>
    </HostingLayout>
  );
};

export default FloorPlan;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [bedTypes, propertyData] = await Promise.all([
      api.get(`/api/host/bedtypes?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
      api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
    ]);
    return {
      props: {
        bedTypes,
        propertyData,
      },
    };
  } catch (error) {
    console.error('SSR error:', error);
    return {
      props: {
        bedTypes: [],
        propertyData: [],
      },
    };
  }
}
