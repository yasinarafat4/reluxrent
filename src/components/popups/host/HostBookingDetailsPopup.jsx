import { fetcher } from '@/lib/fetcher';
import EarningsSummary from '@/pages/[messageType]/messages/partial/HostReservationDetails/EarningsSummary';
import GuestInfo from '@/pages/[messageType]/messages/partial/HostReservationDetails/GuestInfo';
import HostInfo from '@/pages/[messageType]/messages/partial/HostReservationDetails/HostInfo';
import ReservationDetails from '@/pages/[messageType]/messages/partial/HostReservationDetails/ReservationDetails';
import { Divider, IconButton, Stack } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import useSWR from 'swr';

export default function HostBookingDetailsPopup({ closeModal, showModal, popupData }) {
  const { data: bookingData, isLoading } = useSWR(`/api/host/reservation-details/${popupData}`, fetcher);
console.log('HostBookingDetailsPopup', bookingData);
  if (isLoading) {
    return null;
  }

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
        {/* Host Info */}
        <HostInfo details={bookingData} />
        <Divider sx={{ my: 2 }} />
        {/* Guest Info */}
        <GuestInfo details={bookingData} />
        <Divider sx={{ my: 2 }} />

        {/* Booking details */}
        <ReservationDetails details={bookingData} />
        <Divider sx={{ my: 2 }} />

        {/* Earning summary */}
        <EarningsSummary details={bookingData} />
      </DialogContent>
    </Dialog>
  );
}
