import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsRight, SaveIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const PropertyType = ({ propertyTypesData, propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  console.log('propertyData', propertyData);
  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      propertyType: propertyData?.propertyTypeId,
    },
  });

  const watchSelected = watch('propertyType');

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/property-type`, formData);
      console.log('Data', data);

      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/space-type?tab=space`);
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
      <Box px={2} pt={2} pb={20}>
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
              <Typography variant="h2" fontWeight={500} gutterBottom>
                Tell us about your place
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
                Which of these best describes your place?
              </Typography>
            </Box>

            {/* Property Types */}
            <Controller
              name="propertyType"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                    },
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  {propertyTypesData.map((item) => {
                    const isSelected = watchSelected === item.id;
                    return (
                      <Box
                        key={item.id}
                        sx={{
                          borderRadius: '10px',
                          px: 2,
                          py: 1.5,
                          textAlign: 'start',
                          cursor: 'pointer',
                          border: '1px solid',
                          boxShadow: (theme) => (theme.palette.mode === 'dark' ? isSelected && `0 0 0 1px #fff` : isSelected && `0 0 0 1px #000`),
                          transition: '0.3s',
                          borderColor: isSelected ? 'common.black' : 'grey.400',
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? (isSelected ? '#303030' : 'grey.900') : isSelected ? theme.palette.grey[100] : theme.palette.common.white),
                          '&:hover': {
                            boxShadow: (theme) => (theme.palette.mode === 'dark' ? `0 0 0 1px #fff` : `0 0 0 1px #000`),
                            borderColor: 'common.black',
                          },
                        }}
                        onClick={() => onChange(item.id)}
                      >
                        <Stack gap={1}>
                          <Box sx={{ width: 45, height: 45, position: 'relative' }}>
                            <Image src={item.icon} alt={item.name} fill style={{ objectFit: 'cover' }} />
                          </Box>
                          <Typography sx={{ fontSize: { xs: '12px', md: '14px' }, fontWeight: 500 }}>{item.name}</Typography>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              )}
            />
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
                  disabled={!watchSelected}
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
                  type="submit"
                  size="small"
                  loading={loading}
                  loadingPosition="end"
                  endIcon={<ChevronsRight />}
                  disabled={!watchSelected}
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

export default PropertyType;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [propertyTypesData, propertyData] = await Promise.all([
      api.get(`/api/host/property-type?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
      api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
    ]);

    return {
      props: {
        propertyTypesData,
        propertyData,
      },
    };
  } catch (error) {
    console.error('Error fetching property types:', error);
    return {
      props: {
        propertyTypesData: [],
        propertyData: [],
      },
    };
  }
}
