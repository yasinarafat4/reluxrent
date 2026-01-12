import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { HousePlus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const RemoveListing = ({ propertyData }) => {
  console.log('RemoveListingPropertyData', propertyData);
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { trans } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/api/host/delete-listing/${propertyData.id}`);
      setOpenDeleteDialog(false);
      router.push('/host/listings?type=home&status=All'); // redirect after success
    } catch (err) {
      console.error('Failed to remove listing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 2, textAlign: 'center' },
          },
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: '#FFF4E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
          </Box>
        </Box>

        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.4rem', textAlign: 'center', p: 0 }}>Are you sure?</DialogTitle>

        <DialogContent sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
          <Typography>You won't be able to revert this!</Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleConfirmDelete} loading={loading} loadingPosition="end" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Yes, delete it!
          </Button>
          <Button variant="contained" color="error" onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Box px={2} pt={2} pb={12}>
        <Box py={2}>
          {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}

          <Box sx={{ ml: conditionalMarginLeft }}>
            <Box
              sx={{
                width: { xs: '100%', xl: '50%' },
                mx: 'auto',
              }}
            >
              {/* Small device back button */}
              {propertyData.allStepsCompleted && (
                <Box component={Link} href={`/host/property/${id}?tab=space`} color={'text.primary'} sx={{ p: { xs: 1, md: 2 }, display: { md: 'none' } }}>
                  <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              )}
              <Box my={3} width="100%">
                <Typography variant="h2" gutterBottom>
                  Remove Listing
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
                  Removing your listing will make it unavailable for new bookings and hide it from guest searches.
                </Typography>
              </Box>

              <Stack spacing={2} justifyContent={'center'} alignItems={'center'}>
                <Box sx={{ position: 'relative', display: 'inline-flex', width: 250, height: 250 }}>
                  <HousePlus size={250} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#303030' : 'white'),
                      borderRadius: '50%',
                    }}
                  >
                    <Trash2 size={90} strokeWidth={3} />
                  </Box>
                </Box>
                {/* Button */}
                <Button
                  onClick={() => setOpenDeleteDialog(true)}
                  size="small"
                  variant="outlined"
                  sx={{
                    px: 4,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 1,
                    transition: 'all 0.5s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: '#fff',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {trans('Remove Listing')}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default RemoveListing;

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
    console.error('Error fetching Remove listing:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
