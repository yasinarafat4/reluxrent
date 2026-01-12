import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, InputAdornment, Stack, Typography, useMediaQuery } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getCookie } from 'cookies-next';
import { SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';
const BASE_URL = 'http://localhost:3000/rooms/';

const CustomLink = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    trigger,
    formState: { errors },
  } = useForm({
    mode: 'all',
    defaultValues: {
      custom_link: propertyData?.slug,
    },
  });

  const watchCustomLink = watch('custom_link');
  console.log('watchCustomLink', watchCustomLink);

  const onSubmit = async (formData) => {
    const isValid = await trigger('custom_link');
    if (!isValid) return;

    try {
      setLoading(true);
      const { data } = await api.put(`/api/host/property/${id}/update/custom-link`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error updating times', error);
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
              {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=space`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
                <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>}
              {/* Title */}
              <Box my={3} width="100%">
                <Typography variant="h2" gutterBottom>
                  Custom link
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
                  Add a custom link to make it easier for them to access your listing.
                </Typography>
              </Box>

              <Stack spacing={1} width={{ xs: '100%', lg: '80%' }}>
                {/* Custom link*/}
                <Controller
                  name="custom_link"
                  control={control}
                  rules={{
                    required: 'Custom link is required!',
                    minLength: {
                      value: 3,
                      message: 'Must be at least 3 characters',
                    },
                    validate: async (value) => {
                      try {
                        const { data } = await api.post(`/api/host/check-custom-link`, { slug: value, id });
                        return data.available || data.message || 'This link is taken';
                      } catch (err) {
                        return 'Validation failed';
                      }
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      fullWidth
                      required
                      label="Custom link"
                      error={!!errors.custom_link}
                      helperText={errors.custom_link?.message}
                      sx={{
                        borderRadius: 2,
                        '& .MuiFormHelperText-root': {
                          ml: 0,
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment sx={{ p: 0, m: 0 }} position="start">
                              {process.env.NEXT_PUBLIC_API_URL}/rooms/
                            </InputAdornment>
                          ),
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
    </HostingLayout>
  );
};

export default CustomLink;

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
    console.error('Error fetching Custom Link:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
