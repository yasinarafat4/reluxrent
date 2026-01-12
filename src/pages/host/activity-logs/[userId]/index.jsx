import HostingLayout from '@/components/layout/host/HostingLayout';
import NoDataFound from '@/components/NoDataFound';
import { fetcher } from '@/lib/fetcher';
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const ActivityLogs = () => {
  const router = useRouter();
  const { userId } = router.query;

  const { data: activityLogsData = [], isLoading: activityLogsDataLoading } = useSWR(userId ? `/api/host/activity-logs/${userId}` : null, fetcher);

  if (activityLogsDataLoading) {
    return (
      <HostingLayout>
        <Box display="flex" justifyContent="center" alignItems={'center'} mt={4}>
          <CircularProgress />
        </Box>
      </HostingLayout>
    );
  }

  // --- Group logs by date ---
  const groupedLogs = activityLogsData.reduce((acc, log) => {
    const dateKey = format(parseISO(log.createdAt), 'MMMM d, yyyy');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  return (
    <HostingLayout>
      <Container maxWidth={'lg'} sx={{p: 2}}>
        <Typography variant="h3" fontWeight={600} mb={3}>
          Activity Log
        </Typography>

        {Object.keys(groupedLogs).length > 0 ? <Stack spacing={4}>
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <Box key={date}>
              {/* Date Heading */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary', mb: 1 }}>
                {date}
              </Typography>

              {/* Each Log Item */}
              <Stack spacing={2} pl={2}>
                {logs.map((log, index) => (
                  <Box key={index} display="flex" alignItems="flex-start" gap={1.5}>
                    {/* Timeline Dot */}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'text.secondary',
                        mt: '7px',
                        flexShrink: 0,
                      }}
                    />

                    {/* Details */}
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {log.meta.details}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        By {log.meta.by}&nbsp;•&nbsp;
                        {format(parseISO(log.createdAt), 'h:mm a')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>: <NoDataFound title={'No activity logs found!'}/> }
      </Container>
    </HostingLayout>
  );
};

export default ActivityLogs;
