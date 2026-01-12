import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { getSocket, initSocket } from '@/lib/socket';
import { CountdownTimer } from '@/utils/CountdownTimer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import { addHours } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { mutate } from 'swr';

export default function GuestPropertyDetails({ details }) {
  const { trans } = useTranslation();
  const { actions } = usePopups();
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [openDeclineByGuestDialog, setOpenDeclineByGuestDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log('GuestPropertyDetails', details);

  const lastBooking = details?.lastBooking;
  const hostName = lastBooking?.host?.name || 'the host';
  const isAvailable = lastBooking?.property?.isAvailable;

  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      socketRef.current = initSocket();
    }
    const socket = socketRef.current;

    socket.emit('joinConversation', { conversationBookingId: details?.conversationBooking?.id });

    const reservationUpdateHandler = () => {
      mutate(`/api/guest/booking-details/${lastBooking?.id}`);
    };

    socket.on('reservationUpdate', reservationUpdateHandler);

    return () => {
      socket.off('reservationUpdate', reservationUpdateHandler);
    };
  }, [user, lastBooking]);

  const handleConfirmDeclineByGuest = async () => {
    try {
      setLoading(true);
      const { data } = await api.put(`/api/guest/decline-booking-request/${lastBooking?.id}`, { conversationBookingId: details?.conversationBooking?.id });
      console.log('Decline Data', data);
      setOpenDeclineByGuestDialog(false);
      const socket = getSocket();
      socket.emit('reservationUpdate', {
        bookingId: lastBooking?.id,
        conversationBookingId: details?.conversationBooking?.id,
        status: 'PENDING',
      });
    } catch (err) {
      console.error('Failed to decline:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!lastBooking) return null;
  return (
    <>
      {/* Guest Decline Confirmation Dialog */}
      <Dialog
        open={openDeclineByGuestDialog}
        onClose={() => setOpenDeclineByGuestDialog(false)}
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
          <Button variant="contained" color="primary" onClick={handleConfirmDeclineByGuest} loading={loading} loadingPosition="end" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Yes, decline it!
          </Button>
          <Button variant="contained" color="error" onClick={() => setOpenDeclineByGuestDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Section */}
      <Box mb={2}>
        <Box sx={{ width: '100%', height: { xs: '200px', sm: '400px', md: '200px', xl: '250px' }, position: 'relative' }}>
          <Image src={lastBooking?.property?.propertyImages[0]?.image} priority alt={''} fill style={{ objectFit: 'cover', borderRadius: '16px' }} />

          <Box position={'absolute'} left={10} top={10} px={1.5} py={'3px'} borderRadius={2} fontSize={10} bgcolor={'primary.main'} color={'text.primary'}>
            <Typography variant="subtitle2" color="common.white" fontSize={12}>
              {details?.guestStatus}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Decline Texts */}
      {lastBooking?.bookingStatus == 'DECLINED' ? (
        <Box>
          {lastBooking?.declinedBy == 'Host' ? (
            <Stack
              alignItems="center"
              spacing={2}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
                textAlign: 'center',
                mt: 3,
              }}
            >
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                Your booking request wasn't accepted
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                Unfortunately, the host declined your booking request. Don't worry — there are many great places to stay nearby!
              </Typography>
              <Box component={Link} href={'/'} sx={{ textTransform: 'none', mt: 1, fontSize: 14, bgcolor: 'primary.main', color: 'white', px: 2, py: 0.5, borderRadius: 0.5 }}>
                Find another place
              </Box>
            </Stack>
          ) : (
            <Stack
              alignItems="center"
              spacing={2}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
                textAlign: 'center',
                mt: 3,
              }}
            >
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                The guest canceled the booking request
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                The guest decided to cancel this request. You can explore other potential guests or adjust your availability.
              </Typography>
            </Stack>
          )}
        </Box>
      ) : (
        // Buttons
        <Stack gap={2} mb={2}>
          {lastBooking?.bookingStatus !== 'CONFIRMED' && !isAvailable ? (
            // ❌ Dates no longer available (highest priority if not confirmed)
            <>
              <Stack gap={2} mb={1}>
                <Typography variant="h6">{trans('Your dates are no longer available')}</Typography>
                <Typography variant="body2">{hostName}'s place is no longer available for your travel dates. Try searching for another place to stay.</Typography>
              </Stack>
              <Button component={Link} href="/search/homes" size="small" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
                {trans('Keep searching')}
              </Button>
            </>
          ) : lastBooking?.bookingStatus === 'CONFIRMED' ? (
            // ✅ Booking confirmed
            <>
              {details?.guestStatus == 'Upcoming Stay' ? (
                <>
                  <Stack gap={2} mb={1}>
                    <Typography variant="h6">{trans('Your booking is confirmed')}</Typography>
                    <Typography variant="body2">Great news! Your upcoming stay at {hostName}'s place is confirmed. You can view your booking details anytime in your bookings section.</Typography>
                  </Stack>
                </>
              ) : details?.guestStatus == 'Currently Staying' ? (
                <>
                  <Stack gap={2} mb={1}>
                    <Typography variant="body2">Enjoy your stay! You're currently checked in at {hostName}'s place. If you need any assistance, please reach out to your host.</Typography>
                  </Stack>
                </>
              ) : details?.guestStatus == 'Past Guest' ? (
                <>
                  <Stack gap={2} mb={1}>
                    <Typography variant="body2">Your trip has ended. We hope you had a great stay at {hostName}'s place! Don't forget to leave a review for your host.</Typography>
                  </Stack>
                </>
              ) : null}

              {details?.reviewFromHost && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">{lastBooking?.host?.name}'s reviews:</Typography>
                  <Typography variant="body2">{details?.reviewFromHost.message}</Typography>
                  <Typography onClick={() => actions.openPopup('showGuestReviews', details)} variant="body2" fontWeight={600} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    {trans('Show reviews')}
                  </Typography>
                </>
              )}
              {details?.canReview && (
                <>
                  <Typography variant="body2">You have {details?.reviewDeadline} days left to leave a review</Typography>
                  <Button onClick={() => actions.openPopup('guestToHostReview', details)} size="small" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
                    {trans('Start review')}
                  </Button>
                </>
              )}
            </>
          ) : lastBooking?.bookingStatus === 'CANCELED' ? (
            // 🛑 Booking canceled
            <>
              <Stack gap={2} mb={1}>
                <Typography variant="h6">{trans('Booking canceled')}</Typography>
                <Typography variant="body2">This reservation was canceled. You can search for other dates or contact the host if needed.</Typography>
              </Stack>
              <Button component={Link} href="/search/homes" size="small" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
                {trans('Search other dates')}
              </Button>
            </>
          ) : lastBooking?.paymentStatus === 'FAILED' || lastBooking?.paymentStatus === 'CANCELLED' ? (
            // ❌ Payment failed
            <>
              <Stack gap={2} mb={1}>
                <Typography variant="h6">{trans('Payment Unsuccessful')}</Typography>
                <Typography variant="body2">We were unable to complete your booking because the payment did not go through. Please try again to confirm your reservation.</Typography>
              </Stack>
              <Button
                type="button"
                onClick={() => (lastBooking?.specialOffer ? actions.openPopup('specialOfferBookNow', details) : actions.openPopup('bookNow', details))}
                size="small"
                fullWidth
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                {trans('Try Again')}
              </Button>
            </>
          ) : (['INQUIRY', 'REQUEST'].includes(lastBooking?.bookingType) && lastBooking?.bookingStatus === 'ACCEPTED') || lastBooking?.property?.bookingType == 'instant' ? (
            // 🎉 Host invited guest
            <>
              <Stack gap={2} mb={1}>
                <Typography variant="h6">{hostName} invited you to book their home</Typography>
                <Typography variant="body2">
                  The invitation allows you to instantly book for the next <CountdownTimer expiredAt={lastBooking?.expiredAt} /> hours.
                </Typography>
              </Stack>
              <Button
                type="button"
                onClick={() => (lastBooking?.specialOffer ? actions.openPopup('specialOfferBookNow', details) : actions.openPopup('bookNow', details))}
                size="small"
                fullWidth
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                {trans('Book now')}
              </Button>
            </>
          ) : ['INQUIRY'].includes(lastBooking?.bookingType) && lastBooking?.bookingStatus === 'PENDING' && lastBooking?.property?.bookingType == 'request' ? (
            // 📨 Request pending
            <>
              <Stack gap={2} mb={2}>
                <Typography variant="h6">You messaged {hostName} about their listing</Typography>
                <Typography variant="body2">
                  Most hosts respond within <CountdownTimer expiredAt={addHours(lastBooking?.createdAt, 24)} /> hours. If this listing is your top choice, enter your payment information to officially
                  request a reservation.
                </Typography>
              </Stack>
              <Button type="button" size="small" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
                {trans('Request to book')}
              </Button>
            </>
          ) : ['REQUEST'].includes(lastBooking?.bookingType) && lastBooking?.bookingStatus === 'PENDING' ? (
            // 📨 Request pending
            <>
              <Stack gap={2} mb={2}>
                <Typography variant="h6">You requested {hostName} for booking</Typography>
                <Typography variant="body2">
                  Most hosts respond within <CountdownTimer expiredAt={addHours(lastBooking?.createdAt, 24)} /> hours. If this listing is your top choice, enter your payment information to officially
                  request a reservation.
                </Typography>
              </Stack>
              <Button
                type="button"
                onClick={() => setOpenDeclineByGuestDialog(true)}
                loading={loading}
                loadingPosition="end"
                size="small"
                fullWidth
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                {trans('Decline')}
              </Button>
            </>
          ) : null}

          {lastBooking?.bookingStatus == 'CONFIRMED' && (
            <Stack gap={2} my={2}>
              <Button
                component={Link}
                href={`tel:${lastBooking?.host?.phone}`}
                size="small"
                fullWidth
                variant="outlined"
                color="primary"
                sx={{
                  textTransform: 'none',
                }}
              >
                {trans('Call')}
              </Button>

              <Typography fontSize={11} variant="body2" textAlign={'center'}>
                Phone: {lastBooking?.host?.phone}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
    </>
  );
}
