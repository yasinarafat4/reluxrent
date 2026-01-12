import HostingLayout from '@/components/layout/host/HostingLayout';
import { fetcher } from '@/lib/fetcher';
import EarningsSummary from '@/pages/[messageType]/messages/partial/HostReservationDetails/EarningsSummary';
import GuestInfo from '@/pages/[messageType]/messages/partial/HostReservationDetails/GuestInfo';
import ReservationDetails from '@/pages/[messageType]/messages/partial/HostReservationDetails/ReservationDetails';
import { Divider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import HostReservationsInfo from '../HostReservationsInfo';

import { IconButton, Stack } from '@mui/material';

import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { initSocket } from '@/lib/socket';
import { Ban, ChevronRight, FileQuestion, FlagOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const ReservationDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { trans } = useTranslation();
  const { user } = useAuth();
  const { actions } = usePopups();
  const { data: reservationData, isLoading } = useSWR(`/api/host/reservation-details/${id}`, fetcher);
  console.log('HostReservationDetailsData', reservationData);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !id || !reservationData) return;

    if (!socketRef.current) {
      socketRef.current = initSocket();
    }
    const socket = socketRef.current;
    socket.emit('joinConversation', { conversationBookingId: reservationData?.conversationBookingId });

    const reservationUpdateHandler = () => {
      console.log('ANNSASK');
      mutate(`/api/host/reservation-details/${id}`);
    };

    socket.on('reservationUpdate', reservationUpdateHandler);

    return () => {
      socket.off('reservationUpdate', reservationUpdateHandler);
    };
  }, [user, id, reservationData]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <HostingLayout>
      <Box bgcolor={'divider'} px={{ xs: 1, sm: 2 }} pt={2} pb={{ xs: 10, md: 2 }}>
        <Box bgcolor={'background.white'} borderRadius={1} width={{ sm: '70%', md: '50%', lg: '40%', xl: '30%' }} mx={'auto'} p={3}>
          {/* Host Info */}
          <HostReservationsInfo details={reservationData} />
          <Divider sx={{ my: 2 }} />

          {/* Guest Info */}
          <GuestInfo details={reservationData} />
          <Divider sx={{ my: 2 }} />

          {/* Booking details */}
          <ReservationDetails details={reservationData} />
          <Divider sx={{ my: 2 }} />

          {/* Earning summary */}
          <EarningsSummary details={reservationData} />

          {/* Support */}
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {trans('Support')}
            </Typography>
            {reservationData?.lastBooking?.specialOffer && (
              <>
                <Stack onClick={() => actions.openPopup('withdrawSpecialOffer', reservationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Stack direction={'row'} gap={1} alignItems={'center'}>
                    <IconButton sx={{ color: 'text.primary' }}>
                      <Ban size={18} />
                    </IconButton>
                    <Typography variant="subtitle2" fontWeight={500}>
                      {trans('Withdraw special offer')}
                    </Typography>
                  </Stack>
                  <IconButton sx={{ color: 'text.primary' }}>
                    <ChevronRight size={18} />
                  </IconButton>
                </Stack>
                <Divider sx={{ my: 2 }} />
              </>
            )}
            {['INQUIRY', 'REQUEST'].includes(reservationData?.lastBooking?.bookingType) &&
              reservationData?.lastBooking?.property?.bookingType == 'request' &&
              reservationData?.lastBooking?.bookingStatus == 'ACCEPTED' &&
              !reservationData?.lastBooking?.specialOffer && (
                <>
                  <Stack onClick={() => actions.openPopup('withdrawPreApproval', reservationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                    <Stack direction={'row'} gap={1} alignItems={'center'}>
                      <IconButton sx={{ color: 'text.primary' }}>
                        <Ban size={18} />
                      </IconButton>
                      <Typography variant="subtitle2" fontWeight={500}>
                        {trans('Withdraw Pre-approval')}
                      </Typography>
                    </Stack>
                    <IconButton sx={{ color: 'text.primary' }}>
                      <ChevronRight size={18} />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

            <Stack onClick={() => actions.openPopup('reportGuest', reservationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
              <Stack direction={'row'} gap={1} alignItems={'center'}>
                <IconButton sx={{ color: 'text.primary' }}>
                  <FlagOff size={18} />
                </IconButton>
                <Typography variant="subtitle2" fontWeight={500}>
                  {trans('Report this guest')}
                </Typography>
              </Stack>
              <IconButton sx={{ color: 'text.primary' }}>
                <ChevronRight size={18} />
              </IconButton>
            </Stack>
            <Divider sx={{ my: 2 }} />

            <Stack component={Link} href={'/help'} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
              <Stack direction={'row'} gap={1} alignItems={'center'}>
                <IconButton sx={{ color: 'text.primary' }}>
                  <ShieldAlert size={18} />
                </IconButton>
                <Typography variant="subtitle2" fontWeight={500}>
                  {trans('Get help with a safety issue')}
                </Typography>
              </Stack>
              <IconButton sx={{ color: 'text.primary' }}>
                <ChevronRight size={18} />
              </IconButton>
            </Stack>
            <Divider sx={{ my: 2 }} />

            <Stack component={Link} href={'/help'} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
              <Stack direction={'row'} gap={1} alignItems={'center'}>
                <IconButton sx={{ color: 'text.primary' }}>
                  <FileQuestion size={18} />
                </IconButton>
                <Typography variant="subtitle2" fontWeight={500}>
                  {trans('Visit the Help Center')}
                </Typography>
              </Stack>
              <IconButton sx={{ color: 'text.primary' }}>
                <ChevronRight size={18} />
              </IconButton>
            </Stack>

            {reservationData?.lastBooking?.bookingStatus == 'CONFIRMED' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Stack onClick={() => actions.openPopup('cancelReservation', reservationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Stack direction={'row'} gap={1} alignItems={'center'}>
                    <IconButton sx={{ color: 'text.primary' }}>
                      <Ban size={18} />
                    </IconButton>
                    <Typography variant="subtitle2" fontWeight={500}>
                      {trans('Cancel reservation')}
                    </Typography>
                  </Stack>
                  <IconButton sx={{ color: 'text.primary' }}>
                    <ChevronRight size={18} />
                  </IconButton>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack gap={0.5} px={1}>
                  <Typography variant="body2">
                    {trans(
                      ' If you cancel, you could be charged a fee and these dates could be blocked. If you cancel too often, you may not be eligible for Superhost status and your listing could be suspended or removed.',
                    )}
                  </Typography>
                  <Typography component={Link} href={'#'} pt={2} sx={{ textDecoration: 'underline', cursor: 'pointer' }} color={'text.primary'} variant="body2" fontWeight={500} target="_blank">
                    {trans('Read more about canceling')}
                  </Typography>
                </Stack>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default ReservationDetailsPage;
