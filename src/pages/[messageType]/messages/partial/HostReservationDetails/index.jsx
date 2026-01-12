import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Ban, ChevronRight, FileQuestion, FlagOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import EarningsSummary from './EarningsSummary';
import GuestInfo from './GuestInfo';
import HostInfo from './HostInfo';
import ReservationDetails from './ReservationDetails';

export default function HostReservationDetails({ conversationData }) {
  console.log('HostReservationDetails', conversationData);

  const router = useRouter();
  const { conversationId } = router.query;
  const { trans } = useTranslation();

  const { actions } = usePopups();

  // --- Unified loading/error states ---
  if (!conversationId) {
    return (
      <Box p={4}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box mx="auto" width={{ xs: '100%' }} px={{ xs: 2, sm: 5, md: 1.5, lg: 2 }} py={{ xs: 0, md: 2 }}>
      {/* HostInfo */}
      <HostInfo details={conversationData} />
      <Divider sx={{ my: 2 }} />
      {/* Guest Info */}
      <GuestInfo details={conversationData} />
      <Divider sx={{ my: 2 }} />
      {/* Booking details */}
      <ReservationDetails details={conversationData} />
      <Divider sx={{ my: 2 }} />
      {/* Earning summary */}
      <EarningsSummary details={conversationData} />
      <Divider sx={{ my: 2 }} />
      {/* Support */}
      <Box>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          {trans('Support')}
        </Typography>
        {conversationData?.lastBooking?.specialOffer && (
          <>
            <Stack onClick={() => actions.openPopup('withdrawSpecialOffer', conversationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
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
        {['INQUIRY', 'REQUEST'].includes(conversationData?.lastBooking?.bookingType) &&
          conversationData?.lastBooking?.property?.bookingType == 'request' &&
          conversationData?.lastBooking?.bookingStatus == 'ACCEPTED' &&  !conversationData?.lastBooking?.specialOffer && (
            <>
              <Stack onClick={() => actions.openPopup('withdrawPreApproval', conversationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
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

        <Stack onClick={() => actions.openPopup('reportGuest', conversationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
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

        {conversationData?.lastBooking?.bookingStatus == 'CONFIRMED' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack onClick={() => actions.openPopup('cancelReservation', conversationData)} sx={{ cursor: 'pointer' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
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
  );
}
