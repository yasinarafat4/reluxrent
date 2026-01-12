import GuestLayout from '@/components/layout/guest/GuestLayout';
import NoDataFound from '@/components/NoDataFound';
import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { Box, Container, Pagination, Paper, Stack, Typography, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Avatar from 'react-avatar';
import useSWR from 'swr';

export default function Notifications() {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const router = useRouter();
  const { user } = useAuth();
  const page = Number(router.query.page) || 1;

  const { data: notificationsData = [], isLoading: notificationsDataLoading } = useSWR(`/api/front/notifications?page=${page}`, fetcher);
  console.log('notificationsData', notificationsData);

  useEffect(() => {
    const markAsRead = async () => {
      const { data } = await api.post('/api/front/notifications/mark-as-read');
    };
    markAsRead();
  }, [user]);

  const onDataChange = (e, value) => {
    const url = new URL(window.location.origin + router.asPath);
    url.searchParams.set('page', value);
    router.push(url.pathname + '?' + url.searchParams.toString(), undefined, { shallow: true });
  };

  if (notificationsDataLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <GuestLayout>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 10 }}>
        <Typography variant="h5" mb={2}>
          {trans('Notifications')}
        </Typography>

        {/* Notification Card */}
        {notificationsData.data.length > 0 ? (
          notificationsData?.data?.map((notification, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent={'center'} gap={2} overflow={'hidden'}>
                <Stack gap={1}>
                  <Avatar src={notification?.user?.image} name={notification?.user?.name} alt={notification?.user?.name} round={true} size="50" />
                </Stack>
                <Box>
                  <Typography flex={1} variant="subtitle2" color="error.main" fontWeight={600}>
                    {notification?.title}
                  </Typography>
                  {/* Time */}
                  <Typography variant="caption" color="text.secondary">
                    {format(notification.createdAt, 'dd MMM, yyyy hh:mm a')}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={400} overflow={'hidden'}>
                    {notification?.body}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))
        ) : (
          <NoDataFound title={'No notifications found!'} />
        )}

        {/* Pagination */}
        <Box display="flex" justifyContent="end" p={2}>
          {notificationsData?.data?.length > 0 && <Pagination onChange={onDataChange} page={page} count={notificationsData?.pagination?.totalPages} variant="outlined" shape="rounded" />}
        </Box>
      </Container>
    </GuestLayout>
  );
}
