import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';

export default function ReservationDetails({ details }) {
  if (!details) return null;
  console.log('ReservationDetails', details);
  const { trans } = useTranslation();

  const formatGuestSummary = (guests = {}) => {
    const parts = [];
    if (guests?.adults) parts.push(`${guests?.adults} Adult${guests?.adults > 1 ? 's' : ''}`);
    if (guests?.children) parts.push(`${guests?.children} Child${guests?.children > 1 ? 'ren' : ''}`);
    if (guests?.infants) parts.push(`${guests?.infants} Infant${guests?.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const lastBooking = details?.lastBooking;

  if (!lastBooking) return null;

  return (
    <>
      <Box mb={2}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Reservation details
        </Typography>

        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="body2" color="text.secondary">
            Guest
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatGuestSummary(lastBooking?.guests)}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="body2" color="text.secondary">
            Check-in
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(lastBooking?.startDate, 'MMM dd, yyyy')}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="body2" color="text.secondary">
            Check out
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(lastBooking?.endDate, 'MMM dd, yyyy')}
          </Typography>
        </Stack>
        {lastBooking?.bookingStatus == 'CONFIRMED' && (
          <>
            <Divider sx={{ my: 2 }} />

            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Booking date
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.confirmedAt && format(lastBooking?.confirmedAt, 'MMM dd, yyyy')}
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Confirmation code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.confirmationCode && lastBooking?.confirmationCode}
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Cancellation policy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.cancellationPolicy?.name}
              </Typography>
            </Stack>
            <Divider sx={{ my: 2 }} />

            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Booking Currency
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.currency ? `${lastBooking.currency.symbol} (${lastBooking.currency.code})` : '-'}
              </Typography>
            </Stack>
          </>
        )}
      </Box>
    </>
  );
}
