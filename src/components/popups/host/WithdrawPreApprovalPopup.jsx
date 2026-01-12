import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Button, DialogActions, DialogTitle, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useState } from 'react';

export default function WithdrawPreApprovalPopup({ closeModal, showModal, popupData }) {
  console.log(`WithdrawPreApprovalPopup`, popupData);
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [loading, setLoading] = useState(false);

  async function withdrawPreApproveClicked() {
    try {
      setLoading(true);
      const { data } = await api.post('/api/host/withdraw-pre-approve-booking', { bookingId: popupData.lastBooking.id, conversationBookingId: popupData.conversationBookingId });
      const socket = getSocket();
      socket.emit('reservationUpdate', {
        bookingId: popupData.lastBooking.id,
        conversationBookingId: popupData.conversationBookingId,
        status: 'PENDING',
      });
      closeModal();
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
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
      <DialogTitle>{trans('Withdraw pre-approval?')}</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          If you withdraw this pre-approval, Arafat won't be able to book "{popupData?.lastBooking?.property?.propertyDescription?.name}" anymore.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="primary" type="button" onClick={withdrawPreApproveClicked} loading={loading} loadingPosition="end" sx={{ textTransform: 'none' }}>
          {trans('Yes, withdraw')}
        </Button>
        <Button variant="outlined" onClick={closeModal} sx={{ textTransform: 'none' }}>
          {trans('Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
