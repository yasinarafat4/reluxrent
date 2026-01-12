import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, DialogActions, DialogTitle, Divider, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import Avatar from 'react-avatar';
import { mutate } from 'swr';

export default function CoHostInviteDetailsPopup({ closeModal, showModal, popupData }) {
  console.log('CoHostInviteDetailsPopup', popupData);
  const { trans } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cancelInviteLoading, setCancelInviteLoading] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));

  const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const onResendInvite = async () => {
    try {
      setLoading(true);
      const payload = {
        action: 'update',
        ...popupData,
        email: popupData?.user?.email,
      };
      const { data } = await api.put(`/api/host/property/${popupData?.propertyId}/invite-cohost`, payload);
      mutate(`/api/host/cohosts/${popupData?.propertyId}`);
      enqueueSnackbar('Invite resent to co-host', { variant: 'success' });
      closeModal();
    } catch (error) {
      console.error('Error resending invite:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to resend invite. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const onConfirmCancel = async () => {
    try {
      setCancelInviteLoading(true);
      const { data } = await api.delete(`/api/host/delete-cohost/${popupData?.id}`);
      mutate(`/api/host/cohosts/${popupData?.propertyId}`);
      enqueueSnackbar('Invitation cancelled!', { variant: 'success' });
      closeModal();
    } catch (error) {
      console.error('Error cancelling invite:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to cancelled invite. Please try again.', { variant: 'error' });
    } finally {
      setCancelInviteLoading(false);
    }
  };

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
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'end'} alignItems={'center'} p={1}>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            color: 'text.primary',
          }}
        >
          <X />
        </IconButton>
      </Stack>
      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={() => setOpenCancelDialog(false)}
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
            <Button variant="contained" color="primary" onClick={onConfirmCancel} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Yes, cancel!
            </Button>
            <Button variant="contained" color="error" onClick={() => setOpenCancelDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
              No
            </Button>
          </DialogActions>
        </Dialog>

        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={popupData?.user?.image} alt={popupData?.user?.email} size="56" round={true}>
            {!popupData?.user?.image && popupData?.user?.email[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {popupData?.user?.email}
            </Typography>
            <Stack direction={'row'} gap={1} alignItems={'center'}>
              <Typography variant="body2" sx={{ color: popupData?.status === 'PENDING' ? 'warning.main' : popupData?.status === 'EXPIRED' ? 'error.main' : 'success.main' }}>
                {popupData.status == 'PENDING' ? 'Invite sent' : popupData.status == 'EXPIRED' ? 'Expired' : 'Accepted'}
              </Typography>
              ·
              <Typography variant="body2" fontSize={12} sx={{ color: 'text.primary' }}>
                Expires {format(popupData?.expiredAt, 'dd MMM, yyyy')}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* Permissions */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Permissions
          </Typography>
          {Object.entries(popupData?.permissions || {}).map(([key, value]) => (
            <Box key={key} display="flex" alignItems="center" gap={1}>
              {value ? <Check size={15} color="green" /> : <X size={15} color="red" />}
              <Typography variant="body2" fontSize={13}>
                {formatLabel(key)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Footer Buttons */}
        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            disabled={cancelInviteLoading}
            loading={cancelInviteLoading}
            loadingPosition="end"
            onClick={() => onCancelClick()}
            size="small"
            variant="text"
            sx={{
              textTransform: 'none',
              color: 'text.primary',
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Cancel invite
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={loading}
            loading={loading}
            loadingPosition="end"
            onClick={() => onResendInvite()}
            sx={{
              textTransform: 'none',
              bgcolor: 'grey.900',
              '&:hover': { bgcolor: 'grey.800' },
              borderRadius: 0.5,
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Resend invite
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
