// Photos.jsx
import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, IconButton, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';
import SortableGallery from './SortableGallery';

import { usePopups } from '@/contexts/PopupContext';
import { fetcher } from '@/lib/fetcher';
import useSWR, { mutate } from 'swr';

const Photos = ({ propertyData }) => {
  const { trans, lang } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { actions } = usePopups();
  const { id } = router.query;

  // SWR hook with fallbackData from SSR
  const { data } = useSWR(`/api/host/property/${id}?lang=${lang.code}`, fetcher, { fallbackData: propertyData });

  console.log('data?.propertyImages', data?.propertyImages);

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bedrooms_data: [],
    },
  });

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data: res, status } = await api.put(`/api/host/property/${id}/update/photos`, formData);
      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/descriptions?tab=space`);
      }
      enqueueSnackbar(res.message, { variant: 'success' });
      // refresh photos after save
      mutate(`/api/host/property/${id}?lang=${lang.code}`);
    } catch (error) {
      console.error('Error adding photos', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ml: conditionalMarginLeft }}>
          {/* Small device back button */}
          {propertyData.allStepsCompleted && (
            <Box component={Link} href={`/host/property/${id}?tab=space`} color={'text.primary'} sx={{ p: { xs: 1, md: 2 }, display: { md: 'none' } }}>
              <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          )}
          {data?.propertyImages?.length > 0 ? (
            <Box sx={{ width: { xs: '100%', lg: '50%' }, mx: 'auto' }}>
              <SortableGallery images={data?.propertyImages} actions={actions} />
            </Box>
          ) : (
            <Box sx={{ width: { xs: '100%', sm: '70%', lg: '50%' }, mx: 'auto', p: { xs: 1, md: 2 }, height: '100%' }}>
              <Box>
                <Box my={3} width={'100%'}>
                  <Typography variant="h2" gutterBottom>
                    Add some photos
                  </Typography>
                  <Typography variant="subtitle1">You'll need 5 photos to get started. You can add more or make changes later.</Typography>
                </Box>
                <Box
                  sx={[
                    (theme) => ({
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: theme.palette.grey[200],
                      height: { xs: 250, sm: 350, lg: 450 },
                      border: '1px dashed',
                      borderColor: theme.palette.grey[500],
                      borderRadius: 1,
                    }),
                    (theme) =>
                      theme.applyStyles('dark', {
                        bgcolor: theme.palette.grey[900],
                      }),
                  ]}
                >
                  {/* Button */}
                  <Button onClick={() => actions.openPopup('photoUpload', {})} component="label" variant="outlined" sx={{ textTransform: 'none' }} size="small" startIcon={<CloudUploadIcon />}>
                    {trans('Upload Files')}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

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
                  disabled={data?.propertyImages?.length < 5}
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
                  href={`/host/property/${id}/edit/amenities?tab=space`}
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
                  disabled={data?.propertyImages?.length < 5}
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

export default Photos;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const propertyData = await api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []);

    return {
      props: {
        propertyData,
      },
    };
  } catch (error) {
    console.error('Error fetching photos:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
