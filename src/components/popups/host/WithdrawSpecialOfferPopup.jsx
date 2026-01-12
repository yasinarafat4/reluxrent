import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Button, DialogActions, DialogTitle, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';

export default function WithdrawSpecialOfferPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));

  async function withdrawSpecialOfferClicked() {
    try {
      const { data } = await api.post('/api/host/withdraw-special-offer', { bookingId: popupData?.lastBooking?.id, conversationBookingId: popupData?.conversationBookingId });
      console.log('data', data);
      const socket = getSocket();
      socket.emit('reservationUpdate', {
        bookingId: popupData?.lastBooking?.id,
        conversationBookingId: popupData?.conversationBookingId,
        status: 'PENDING',
      });
      closeModal();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: 2,
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'xs'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle>Withdraw {popupData?.guest?.name}'s special offer?</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {popupData?.guest?.name} won't be able to automatically book {popupData?.property?.propertyDesc?.name} from {format(popupData?.lastBooking?.startDate, 'MMM dd')} -{' '}
          {format(popupData?.lastBooking?.endDate, 'MMM dd, yyyy')} for {popupData?.lastBooking?.totalAmount} anymore.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="primary.main" type="button" onClick={withdrawSpecialOfferClicked} sx={{ textTransform: 'none' }}>
          Yes, withdraw
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} type="button" onClick={closeModal}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
