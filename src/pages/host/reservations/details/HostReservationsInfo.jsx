import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { convertAndFormatToActiveCurrency } from '@/utils/convertAndFormatPrice';
import { CountdownTimer } from '@/utils/CountdownTimer';
import { CancelOutlined } from '@mui/icons-material';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';

import { getSocket } from '@/lib/socket';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { format } from 'date-fns';
import { Quote } from 'lucide-react';
import { useState } from 'react';
import Avatar from 'react-avatar';

export default function HostReservationsInfo({ details }) {
  console.log('HostReservationsInfo@', details);
  const { trans } = useTranslation();
  const { actions } = usePopups();
 const [preApproveLoading, setPreApproveLoading] = useState(false);
  const [openDeclineByHostDialog, setOpenDeclineByHostDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastBooking = details?.lastBooking;

  const formatGuestSummary = (guests = {}) => {
    const parts = [];
    if (guests?.adults) parts.push(`${guests?.adults} Adult${guests?.adults > 1 ? 's' : ''}`);
    if (guests?.children) parts.push(`${guests?.children} Child${guests?.children > 1 ? 'ren' : ''}`);
    if (guests?.infants) parts.push(`${guests?.infants} Infant${guests?.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  async function preApproveClicked() {
    try {
      setPreApproveLoading(true)
      const { data } = await api.post('/api/host/pre-approve-booking', { bookingId: lastBooking?.id, conversationBookingId: details?.conversationBookingId });
      const socket = getSocket();
      socket.emit('reservationUpdate', {
        bookingId: lastBooking?.id,
        conversationBookingId: details?.conversationBookingId,
        status: 'PENDING',
      });
      console.log('data', data);
    } catch (error) {
      console.log('Failed to pre approve:', error);
    } finally {
      setPreApproveLoading(false)
    }
  }

  const handleConfirmDeclineByHost = async () => {
    try {
      setLoading(true);
      const { data } = await api.put(`/api/host/decline-booking-request/${lastBooking?.id}`, { conversationBookingId: details?.conversationBookingId });
      console.log('Decline Data', data);
      setOpenDeclineByHostDialog(false);
      const socket = getSocket();
      socket.emit('reservationUpdate', {
        bookingId: lastBooking?.id,
        conversationBookingId: details?.conversationBookingId,
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
      {/* Host Decline Confirmation Dialog */}
      <Dialog
        open={openDeclineByHostDialog}
        onClose={() => setOpenDeclineByHostDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p:  2 , textAlign: 'center' },
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
          <Button variant="contained" color="primary" onClick={handleConfirmDeclineByHost} loading={loading} loadingPosition="end" sx={{ textTransform: 'none', borderRadius: 2 }}>
            Yes, decline it!
          </Button>
          <Button variant="contained" color="error" onClick={() => setOpenDeclineByHostDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Guest */}
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={1} mb={2}>
        <Box>
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {details?.guestStatus}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {lastBooking?.guest?.name}
          </Typography>
        </Box>
        <Avatar src={lastBooking?.guest?.image} name={lastBooking?.guest?.name} alt={lastBooking?.guest?.name} round={true} size="32" />
      </Box>

      <Stack mb={2} gap={0.5}>
        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <Avatar
            src={lastBooking?.property?.propertyImages[0]?.image}
            name={lastBooking?.property?.propertyDescription?.name}
            alt={lastBooking?.property?.propertyDescription?.name}
            size="30"
            round="10px"
          />
          <Typography variant="body2" fontWeight={600}>
            {lastBooking?.property?.propertyDescription?.name}
          </Typography>
        </Stack>
        <Typography variant="body2">
          {lastBooking?.startDate && lastBooking?.endDate ? (
            <>
              {format(new Date(details.lastBooking.startDate), 'MMM dd')} - {format(new Date(details.lastBooking.endDate), 'MMM dd')} ({details.lastBooking.totalNight} nights)
            </>
          ) : (
            'No booking dates'
          )}
        </Typography>

        <Typography variant="body2">
          {formatGuestSummary(lastBooking?.guests)} • {convertAndFormatToActiveCurrency(lastBooking?.currency, lastBooking?.totalPrice)}
        </Typography>
      </Stack>
      {/* Buttons */}
      {lastBooking?.bookingStatus != 'DECLINED' ? (
        <Stack gap={1.5}>
          {details?.reviewFromGuest && (
            <>
              <Divider />
              <Typography variant="body2" fontWeight={600}>
                {lastBooking?.guest?.name}'s review:
              </Typography>
              {/* Last review message */}
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="flex-start"
                sx={{
                  bgcolor: 'background.default',
                  border: '2px solid',
                  borderColor: 'divider',
                  p: 1,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <Quote
                    size={20}
                    style={{
                      transform: 'rotate(180deg)',
                      color: 'rgba(0,0,0,0.5)',
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontSize: { xs: 13 },
                  }}
                >
                  {details?.reviewFromGuest?.message}
                </Typography>
              </Stack>

              <Typography onClick={() => actions.openPopup('showGuestReviews', details)} variant="body2" fontWeight={600} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                {trans('Show reviews')}
              </Typography>
            </>
          )}
          {details?.canReview && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">You have {details?.reviewDeadline} days left to leave a review</Typography>
              <Button onClick={() => actions.openPopup('hostToGuestReview', details)} size="small" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
                {trans('Start review')}
              </Button>
            </>
          )}
          {/*Pre-approve Button */}
          {['INQUIRY', 'REQUEST'].includes(lastBooking?.bookingType) && lastBooking?.property?.bookingType === 'request' && lastBooking?.bookingStatus === 'PENDING' && (
            <Button onClick={() => preApproveClicked()} loading={preApproveLoading} loadingPosition='end' size="small" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
              {trans('Pre-approve')}
            </Button>
          )}
          {/* Accepted booking with special offer */}
          {lastBooking?.bookingStatus === 'ACCEPTED' && lastBooking?.specialOffer && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack gap={2}>
                <Typography variant="body2" fontWeight={600}>
                  You invited <strong>{lastBooking?.guest?.name}</strong> to book
                </Typography>
                <Typography variant="body2">
                  These dates are still open, but <strong>{lastBooking?.guest?.name}</strong> can book them instantly for the next <CountdownTimer expiredAt={lastBooking?.expiredAt} /> hours.
                </Typography>
              </Stack>
            </>
          )}
          {/* Only show if booking is not confirmed */}
          {lastBooking?.bookingStatus !== 'CONFIRMED' && !lastBooking?.property?.isAvailable && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack gap={2}>
                <Typography variant="body2" fontWeight={500}>
                  {trans('These dates are no longer available.')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {trans('Propose new dates with a special offer.')}
                </Typography>
              </Stack>
            </>
          )}
          {/* Special Offer logic — only if booking is not confirmed  */}
          {lastBooking?.bookingStatus !== 'CONFIRMED' &&
            (!lastBooking?.specialOffer ? (
              <Button onClick={() => actions.openPopup('specialOffer', details)} size="small" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
                {trans('Special Offer')}
              </Button>
            ) : (
              <>
                <Divider sx={{ my: 2 }} />
                <Stack gap={2}>
                  <Typography variant="body2" fontWeight={600}>
                    {trans('You sent a special offer')}
                  </Typography>
                  <Typography variant="body2">
                    {lastBooking?.guest?.name} can book your offer for the next <CountdownTimer expiredAt={lastBooking?.specialOffer.expiredAt} /> hours, but these dates are still open.
                  </Typography>
                  <Typography
                    onClick={() => actions.openPopup('reviewSpecialOffer', details)}
                    sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                    color="text.primary"
                    variant="body2"
                    fontWeight={500}
                  >
                    {trans('Review special offer')}
                  </Typography>
                </Stack>
              </>
            ))}
          {/* Decline button (only for REQUEST type bookings) */}
          {lastBooking?.bookingType === 'REQUEST' && (
            <Button size="small" onClick={() => setOpenDeclineByHostDialog(true)} loading={loading} loadingPosition="end" fullWidth variant="outlined" color="primary" sx={{ textTransform: 'none' }}>
              {trans('Decline')}
            </Button>
          )}
        </Stack>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={.5}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            p: 1.5,
            borderRadius: 2,
            mt: 2,
          }}
        >
          <CancelOutlined color="error" fontSize="small" />
          <Typography
            variant="body1"
            color="text.secondary"
            fontWeight={500}
            textAlign="center"
            sx={{
              fontStyle: 'italic',
              fontSize: { xs: 11, sm: 14 },
            }}
          >
            {lastBooking?.declinedBy == 'Host' ? 'You have declined this booking request.' : 'The guest has declined this booking request.'}
          </Typography>
        </Stack>
      )}
    </>
  );
}
