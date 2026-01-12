import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, SaveIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const SpaceType = ({ spaceTypesData, propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      spaceType: propertyData?.spaceTypeId,
    },
  });

  const watchSelected = watch('spaceType');

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/space-type`, formData);
      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/location?tab=space`);
      }
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating property space type', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {/* Sidebar */}
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        {/* Main Contents */}
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

            {/* Space Types */}
            <Controller
              name="spaceType"
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
                  {spaceTypesData.map((item) => {
                    const isSelected = watchSelected === item.id;

                    return (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: { xs: 1, sm: 5 },
                          borderRadius: '10px',
                          padding: { xs: 1.5, sm: 3 },
                          textAlign: 'start',
                          cursor: 'pointer',
                          width: '100%',
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
                        <Box>
                          <Typography variant="h6">{item.name}</Typography>
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
                            {item.description}
                          </Typography>
                        </Box>
                        <Box>
                          <Box sx={{ width: 30, height: 30, position: 'relative' }}>
                            <Image src={item.icon} alt={item.name} fill style={{ objectFit: 'cover' }} />
                          </Box>
                        </Box>
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
                  component={Link}
                  href={`/host/property/${id}/edit/property-type?tab=space`}
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

export default SpaceType;

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
