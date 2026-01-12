import HostingLayout from '@/components/layout/host/HostingLayout';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Card, CardContent, IconButton, Skeleton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Avatar from 'react-avatar';
import useSWR from 'swr';
import Sidebar from '../../Sidebar';

const CoHost = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { actions } = usePopups();
  const router = useRouter();
  const { id } = router.query;

  const { data: cohostsData = [], isLoading: cohostsDataLoading } = useSWR(`/api/host/cohosts/${propertyData?.id}`, fetcher);

  console.log('cohostsData', cohostsData);

  if (cohostsDataLoading) {
    return (
      <Box height={'100vh'}>
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={'100%'} width={200} />

        {/* For other variants, adjust the size with `width` and `height` */}
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rectangular" width={210} height={60} />
        <Skeleton variant="rounded" width={210} height={60} />
      </Box>
    );
  }

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={{ xs: 18, md: 12 }} ml={{ md: '400px' }}>
        {/* Sidebar */}
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        {/* Small device back button */}
        {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=space`} color={'text.primary'} sx={{ p: 2, display: { md: 'none' } }}>
          <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>}
        {/* Main Contents */}
        {cohostsData.length > 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Co-hosts
            </Typography>

            <Stack display={'grid'} gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)', xl: 'repeat(7, 1fr)' }} gap={2}>
              {cohostsData.map((cohost, i) => (
                // Co host card
                <Card
                  key={i}
                  onClick={() => (cohost?.status == 'ACCEPTED' ? actions.openPopup('coHostInviteAcceptedDetails', cohost) : actions.openPopup('coHostInviteDetails', cohost))}
                  sx={{
                    width: { xs: '100%', sm: 200 },
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      border: '1px solid',
                      boxShadow: '0 0 0 1px',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar src={cohost?.user?.image || ''} alt={cohost?.user?.name} name={cohost?.user?.name} size="60" round={true}>
                      {!cohost?.user?.image && cohost?.user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ width: '100%', maxWidth: 180, overflow: 'hidden' }}>
                      <Typography Typography variant="subtitle2" fontWeight={500}>
                        {cohost?.user?.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontSize: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        noWrap
                        title={cohost?.user?.email}
                      >
                        {cohost?.user?.email}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 12,
                          color: cohost?.status === 'PENDING' ? 'warning.main' : cohost?.status === 'EXPIRED' ? 'error.main' : 'success.main',
                        }}
                      >
                        {cohost?.status == 'PENDING' ? 'Invite sent' : cohost?.status == 'EXPIRED' ? 'Expired' : 'Accepted'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Invite Card */}
              <Card
                onClick={() => actions.openPopup('inviteCoHost', propertyData)}
                sx={{
                  width: { xs: '100%', sm: 200 },
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    border: '1px solid',
                    boxShadow: '0 0 0 1px',
                    cursor: 'pointer',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#f5f5f5',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                    }}
                  >
                    <IconButton>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>
                    Invite a co-host
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              height: { xs: '100%', lg: '70vh' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              px: 2,
              gap: 5,
            }}
          >
            {/* Image */}
            <Box sx={{ mb: 4 }}>
              <Image src="/images/default-profile.png" alt="Invite Co-host" width={160} height={160} style={{ objectFit: 'contain' }} />
            </Box>

            <Stack gap={1}>
              {/* Heading */}
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {trans('Invite a co-host')}
              </Typography>

              {/* Subtext */}
              <Typography variant="body2" sx={{ maxWidth: 360, mb: 2 }}>
                {trans('A co-host can help you with everything from managing your calendar to welcoming guests.')}
              </Typography>
            </Stack>

            {/* Learn more link */}
            <Box component={Link} href={'#'} sx={{ textDecoration: 'underline' }} fontWeight={500} fontSize={14}>
              {trans('Learn about co-hosting')}
            </Box>

            {/* Button */}
            <Button onClick={() => actions.openPopup('inviteCoHost', propertyData)} size="small" variant="outlined" sx={{ px: 2, py: 1, borderRadius: 2, fontWeight: 500, textTransform: 'none' }}>
              {trans('Get started')}
            </Button>
          </Box>
        )}
      </Box>
    </HostingLayout>
  );
};

export default CoHost;

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
    console.error('Error fetching photos:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
