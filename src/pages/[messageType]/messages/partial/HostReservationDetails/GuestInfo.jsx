import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Globe, Home, HousePlus, PersonStanding, Radius, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';

export default function GuestInfo({ details }) {
  if (!details) return null;
  const { trans } = useTranslation();
  const { actions } = usePopups();

  const lastBooking = details?.lastBooking;

  if (!lastBooking) return null;

  return (
    <>
      <Box mb={2}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          {trans('About')} {lastBooking?.guest?.name}
        </Typography>
        {details?.guestReviewCount > 0 && (
          <Stack onClick={() => actions.openPopup('guestReviews', details)} sx={{ textDecoration: 'underline', cursor: 'pointer' }} direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Star size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              {details?.guestOverallRating} rating from {details?.guestReviewCount} reviews
            </Typography>
          </Stack>
        )}
        {lastBooking?.guest?.isVerified && (
          <Stack sx={{ textDecoration: 'underline' }} direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <ShieldCheck size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              {trans('Identity verified')}
            </Typography>
          </Stack>
        )}

        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <IconButton sx={{ color: 'text.primary' }}>
            <Radius size={18} />
          </IconButton>
          <Typography variant="body2" color="text.primary">
            {details?.guestTripsCount > 0 ? <>{details?.guestTripsCount} trips</> : <>{trans('No trips yet')}</>}
          </Typography>
        </Stack>
        {lastBooking?.guest?.isHost && (
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <PersonStanding size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              {trans('Also a host')}
            </Typography>
          </Stack>
        )}
        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <IconButton sx={{ color: 'text.primary' }}>
            <HousePlus size={18} />
          </IconButton>
          <Typography variant="body2" color="text.primary">
            {lastBooking?.guest?.createdAt ? `Joined in ${format(new Date(lastBooking?.guest?.createdAt), 'yyyy')}` : 'Joined date not availableX'}
          </Typography>
        </Stack>

        {lastBooking?.guest?.address && (
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Home size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              {trans('Lives in')} {lastBooking?.guest?.address}
            </Typography>
          </Stack>
        )}
        {lastBooking?.guest?.languages && (
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Globe size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              {trans('Speaks')} {lastBooking?.guest?.languages?.join(', ')}
            </Typography>
          </Stack>
        )}
      </Box>

      <Typography
        pb={2}
        sx={{ textDecoration: 'underline', cursor: 'pointer' }}
        color={'text.primary'}
        variant="body2"
        fontWeight={500}
        component={Link}
        href={`/user/show/${lastBooking?.guest?.id}`}
        target="_blank"
      >
        {trans('Show profile')}
      </Typography>

      {lastBooking?.bookingStatus == 'CONFIRMED' && (
        <Stack gap={2} my={2}>
          <Button
            component={Link}
            href={`tel:${lastBooking?.guest?.phone}`}
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
            Phone: {lastBooking?.guest?.phone}
          </Typography>
        </Stack>
      )}
    </>
  );
}
