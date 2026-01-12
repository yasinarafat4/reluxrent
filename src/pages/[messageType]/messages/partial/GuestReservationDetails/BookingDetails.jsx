import { useTranslation } from '@/contexts/TranslationContext';
import { formatGuestSummary } from '@/utils/formatGuestSummary';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Avatar from 'react-avatar';

export default function BookingDetails({ details }) {
  if (!details) return null;
  const { trans } = useTranslation();

  const lastBooking = details?.lastBooking;

  return (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {trans('Trip Details')}
      </Typography>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={1} component={Link} href={`/rooms/${lastBooking?.property?.id}`} target="_blank">
        <Stack>
          <Typography variant="body2" fontWeight={600}>
            {lastBooking?.property?.propertyDesc?.name}
          </Typography>
          <Typography variant="body2">
            {lastBooking?.property?.spaceType?.name} in {lastBooking?.property?.propertyType?.name} ·{' '}
            {lastBooking?.property?.propertyAddress?.addressLine1 || lastBooking?.property?.propertyAddress?.addressLine2}
          </Typography>
        </Stack>
        <IconButton sx={{ color: 'text.primary' }}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack gap={2}>
        <Stack component={Link} href={`/user/show/${lastBooking?.host?.id}`} direction={'row'} justifyContent={'space-between'}>
          <Typography variant="body2" color="text.secondary">
            Hosted by {lastBooking?.host?.name}
          </Typography>
          <Avatar src={lastBooking?.host?.image} name={lastBooking?.host?.name} alt={lastBooking?.host?.name} round={true} size="32"></Avatar>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography variant="body2" color="text.secondary">
          Check-in
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {lastBooking?.startDate ? format(new Date(lastBooking?.startDate), 'MMM dd, yyyy') : 'N/A'}
        </Typography>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography variant="body2" color="text.secondary">
          Check out
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {lastBooking?.endDate ? format(new Date(lastBooking?.endDate), 'MMM dd, yyyy') : 'N/A'}
        </Typography>
      </Stack>

      <Divider sx={{ my: 2 }} />

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
          Booking Currency
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {lastBooking?.currency ? `${lastBooking.currency.symbol} (${lastBooking.currency.code})` : '-'}
        </Typography>
      </Stack>
    </>
  );
}
