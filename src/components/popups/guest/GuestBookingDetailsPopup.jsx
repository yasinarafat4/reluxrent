import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import GuestBookingDetails from '@/pages/guest/bookings/details/GuestBookingDetails';
import GuestPaymentDetails from '@/pages/guest/bookings/details/GuestPaymentDetails';
import GuestPropertyDetails from '@/pages/guest/bookings/details/GuestPropertyDetails';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { ShieldHalf, X } from 'lucide-react';
import Link from 'next/link';
import 'react-day-picker/dist/style.css';
import useSWR from 'swr';

export default function GuestBookingDetailsPopup({ closeModal, showModal, popupData }) {
  const { actions } = usePopups();
  const { trans } = useTranslation();
  const { data: bookingData, isLoading } = useSWR(`/api/guest/booking-details/${popupData}`, fetcher);
  console.log('GuestBookingDetailsPopupData', bookingData);

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '15px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'end'} alignItems={'center'} pt={3} px={3}>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            color: 'text.primary',
            p: 0,
          }}
        >
          <X />
        </IconButton>
      </Stack>
      <DialogContent sx={{ p: 2 }}>
        {/* Property Details  */}
        <GuestPropertyDetails details={bookingData} />
        <Divider sx={{ my: 2 }} />

        {/* Trip Details */}
        <GuestBookingDetails details={bookingData} />

        <Divider sx={{ my: 2 }} />

        {/* Payment Details */}
        <GuestPaymentDetails details={bookingData} />

        <Divider sx={{ my: 2 }} />

        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={1}>
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {trans('Always communicate through Reluxrent')}
            </Typography>
            <Typography variant="body2">
              {trans('Always communicate through Reluxrent To protect your payment, never transfer money or communicate outside of the Reluxrent website or app.')}{' '}
              <Box sx={{ textDecoration: 'underline' }} color={'primary.main'} fontWeight={500} component={Link} href={'#'} target="_blank">
                {trans('Learn more')}
              </Box>{' '}
            </Typography>
          </Stack>
          <IconButton sx={{ color: 'primary.main' }}>
            <ShieldHalf size={30} />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography
          onClick={() => actions.openPopup('reportHost', bookingData)}
          pb={2}
          sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          color={'text.primary'}
          variant="body2"
          fontWeight={500}
          target="_blank"
        >
          {trans('Report host')}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
