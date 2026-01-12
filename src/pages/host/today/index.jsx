import RequiredTaskCard from '@/components/cards/RequiredTaskCard';
import TodaysReservationCard from '@/components/cards/TodaysReservationCard';
import HostingLayout from '@/components/layout/host/HostingLayout';
import NoDataFound from '@/components/NoDataFound';
import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Card, CardContent, Stack, Tab, Typography } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Avatar from 'react-avatar';
import useSWR from 'swr';

const Hosting = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { trans } = useTranslation();
  const { type } = router.query;
  const { actions } = usePopups();

  const { data: todaysReservationsData = [], isLoading: todaysReservationsLoading } = useSWR('/api/host/todays-reservations', fetcher);
  const { data: requestBookingsData = [], isLoading: requestBookingsLoading } = useSWR('/api/host/request-bookings', fetcher);
  const { data: followUpBookingsData = [], isLoading: followUpBookingsLoading } = useSWR('/api/host/follow-up-bookings', fetcher);
  const { data: upcomingReservationsData = [], isLoading: upcomingReservationsLoading } = useSWR('/api/host/upcoming-reservations', fetcher);
  console.log('todaysReservationsLoading', todaysReservationsLoading);
  return (
    <HostingLayout>
      {!user?.isVerified && <RequiredTaskCard />}

      <Box width={'100%'} pt={2} pb={10}>
        <TabContext value={type}>
          <Box width={'100%'} display={'flex'} justifyContent={'center'}>
            <TabList
              sx={{
                display: 'flex',
                gap: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: '999px',
                  minHeight: '32px',
                  minWidth: 'auto',
                  mr: 2,
                  px: 3,
                  py: 1.7,
                  fontSize: 14,
                  transition: 'all 0.3s ease',
                },
                '& .Mui-selected': {
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                },
                '& .MuiTab-root:not(.Mui-selected)': {
                  bgcolor: 'grey.200',
                  color: 'grey.800',
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              <Tab
                label="Today"
                value="today"
                component={Link}
                href={`/host/today?type=${'today'}`}
                sx={{
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: 'grey.100',
                  },
                }}
              />
              <Tab
                label="Upcoming"
                value="upcoming"
                component={Link}
                href={`/host/today?type=${'upcoming'}`}
                sx={{
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: 'grey.100',
                  },
                }}
              />
            </TabList>
          </Box>

          {!requestBookingsLoading ? (
            <TabPanel value="today" sx={{ p: 1 }}>
              {/* Requests */}
              {requestBookingsData.length > 0 && (
                <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                  <Typography variant="h3" py={2}>
                    Requests
                  </Typography>
                  <Box display={'flex'} width={'100%'} alignItems="center" justifyContent="center" flexWrap="wrap" gap={{ xs: 1, sm: 2 }}>
                    {requestBookingsData.map((booking, i) => (
                      <Box width={{ xs: '160px', sm: '200px' }} flexShrink={0} key={i}>
                        <TodaysReservationCard booking={booking} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Reservations */}
              {todaysReservationsData.length > 0 ? (
                <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                  <Typography variant="h3" py={2}>
                    Today's reservations
                  </Typography>
                  <Box display={'flex'} width={'100%'} alignItems="center" justifyContent="center" flexWrap="wrap" gap={{ xs: 1, sm: 2 }}>
                    {todaysReservationsData.map((booking, i) => (
                      <Box width={{ xs: '160px', sm: '200px' }} flexShrink={0} key={i}>
                        <TodaysReservationCard booking={booking} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <NoDataFound title={"No today's reservations available!"} subtitle={'Data will appear here once available.'} />
              )}

              {/* Follow-up */}
              {followUpBookingsData.length > 0 && (
                <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                  <Typography variant="h3" py={2}>
                    Follow-up
                  </Typography>
                  <Box display={'flex'} width={'100%'} alignItems="center" justifyContent="center" flexWrap="wrap" gap={{ xs: 1, sm: 2 }}>
                    {followUpBookingsData.map((booking, i) => (
                      <Box width={{ xs: '250px', sm: '300px' }} flexShrink={0} key={i}>
                        <Card
                          elevation={4}
                          sx={{
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                              transform: 'translateY(-3px)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Stack spacing={1.5}>
                              {/* Property Name */}
                              <Typography
                                component={Link}
                                href={`/host/reservations/details/${booking.id}`}
                                fontSize={15}
                                fontWeight={600}
                                color="text.primary"
                                sx={{
                                  textDecoration: 'none',
                                  textTransform: 'capitalize',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  '&:hover': { color: 'primary.main' },
                                }}
                              >
                                {booking?.property?.name}
                              </Typography>

                              {/* Guest Info */}
                              <Stack direction="row" justifyContent={'space-between'} spacing={1.5} alignItems="center">
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {booking?.guest?.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Guest
                                  </Typography>
                                </Box>

                                <Avatar src={booking?.guest?.image} name={booking?.guest?.name} alt={booking?.guest?.name} round={true} size="40" />
                              </Stack>

                              {/* Booking Dates */}
                              <Box bgcolor={(theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200')} borderRadius={2} px={1.5} py={0.5} textAlign="center">
                                <Typography variant="body2" fontWeight={500}>
                                  {format(new Date(booking?.startDate), 'MMM dd, yyyy')} - {format(new Date(booking?.endDate), 'MMM dd, yyyy')}
                                </Typography>
                              </Box>

                              {/* Follow-up CTA */}
                              <Button onClick={() => actions.openPopup('hostToGuestReview', booking)} variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                                Leave a Review
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </TabPanel>
          ) : null}

          {!upcomingReservationsLoading ? (
            <TabPanel value="upcoming" sx={{ p: 1 }}>
              {upcomingReservationsData.length > 0 ? (
                <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                  <Typography variant="h3" py={2}>
                    Upcoming reservations
                  </Typography>
                  <Box display={'flex'} width={'100%'} alignItems="center" justifyContent="center" flexWrap="wrap" gap={{ xs: 1, sm: 2 }}>
                    {upcomingReservationsData.map((booking, i) => (
                      <Box width={{ xs: '160px', sm: '200px' }} flexShrink={0} key={i}>
                        <TodaysReservationCard booking={booking} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <NoDataFound title={'No upcoming reservations available!'} subtitle={'Data will appear here once available.'} />
              )}
            </TabPanel>
          ) : null}
        </TabContext>
      </Box>
    </HostingLayout>
  );
};

export default Hosting;
