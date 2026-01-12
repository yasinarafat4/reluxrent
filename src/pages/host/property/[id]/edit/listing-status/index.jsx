import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import Sidebar from '../../Sidebar';

const ListingStatus = ({ propertyData }) => {
  console.log('ListingStatusPropertyData', propertyData);
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};
  const [listingStatus, setListingStatus] = useState(propertyData.status);

  const onListingChange = async (selectedStatus) => {
    setLoading(true);
    if (selectedStatus == listingStatus) {
      return;
    }
    try {
      setListingStatus(selectedStatus);
      const { data } = await api.put(`/api/host/property/${id}/update/status`, { status: selectedStatus });
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (err) {
      console.error('Error', err);
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
        <Box sx={{ ml: conditionalMarginLeft }}>
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
                Listing status
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
              ></Typography>
            </Box>

            {/* Listing status */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Box
                sx={{
                  borderRadius: '10px',
                  padding: { xs: 1.5, sm: 3 },
                  textAlign: 'start',
                  cursor: 'pointer',
                  border: '1px solid',
                  boxShadow: (theme) => (theme.palette.mode === 'dark' ? listingStatus == 'Listed' && `0 0 0 1px #fff` : listingStatus == 'Listed' && `0 0 0 1px #000`),
                  transition: '0.3s',
                  borderColor: listingStatus == 'Listed' ? 'common.black' : 'grey.400',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? (listingStatus == 'Listed' ? '#303030' : 'grey.900') : listingStatus == 'Listed' ? theme.palette.grey[100] : theme.palette.common.white,
                  '&:hover': {
                    boxShadow: (theme) => (theme.palette.mode === 'dark' ? `0 0 0 1px #fff` : `0 0 0 1px #000`),
                    borderColor: 'common.black',
                  },
                }}
                onClick={() => onListingChange('Listed')}
              >
                <Box>
                  <Typography variant="h6">Listed</Typography>
                  <Typography variant="body2">Your property is visible to guests and open for bookings.</Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  borderRadius: '10px',
                  padding: { xs: 1.5, sm: 3 },
                  textAlign: 'start',
                  cursor: 'pointer',
                  border: '1px solid',
                  boxShadow: (theme) => (theme.palette.mode === 'dark' ? listingStatus == 'Unlisted' && `0 0 0 1px #fff` : listingStatus == 'Unlisted' && `0 0 0 1px #000`),
                  transition: '0.3s',
                  borderColor: listingStatus == 'Unlisted' ? 'common.black' : 'grey.400',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? (listingStatus == 'Unlisted' ? '#303030' : 'grey.900') : listingStatus == 'Unlisted' ? theme.palette.grey[100] : theme.palette.common.white,
                  '&:hover': {
                    boxShadow: (theme) => (theme.palette.mode === 'dark' ? `0 0 0 1px #fff` : `0 0 0 1px #000`),
                    borderColor: 'common.black',
                  },
                }}
                onClick={() => onListingChange('Unlisted')}
              >
                <Box>
                  <Typography variant="h6">Unlisted</Typography>
                  <Typography variant="body2">Your property is hidden from guests and cannot receive new bookings.</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default ListingStatus;

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
    // Handle other errors (e.g., network, server errors)
    console.error('Error fetching Listing Status:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
