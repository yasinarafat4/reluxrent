import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, DialogActions, DialogTitle, Divider, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Tooltip from '@mui/material/Tooltip';
import { Check, ChevronRight, Trash, X } from 'lucide-react';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import Avatar from 'react-avatar';
import { mutate } from 'swr';

export default function CoHostInviteAcceptedDetailsPopup({ closeModal, showModal, popupData }) {
  console.log('CoHostInviteAcceptedDetailsPopup', popupData);
  const { trans } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));

  const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const onDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const onConfirmDelete = async () => {
    try {
      const { data } = await api.delete(`/api/host/delete-cohost/${popupData?.id}`);
      mutate(`/api/host/cohosts/${popupData?.propertyId}`);
      enqueueSnackbar('Co-host deleted!', { variant: 'success' });
      closeModal();
    } catch (error) {
      console.error('Error cancelling delete:', error);
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
        {/* Delete Co-host Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
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
            <Button variant="contained" color="primary" onClick={onConfirmDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Yes, delete!
            </Button>
            <Button variant="contained" color="error" onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
              No
            </Button>
          </DialogActions>
        </Dialog>

        {/* Header */}
        <Stack direction="row" justifyContent={'space-between'} alignItems="start">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={popupData?.user?.image} alt={popupData?.user?.email} size="56" round={true}>
              {!popupData?.user?.image && popupData?.user?.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {popupData?.user?.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  color: popupData?.status === 'PENDING' ? 'warning.main' : popupData?.status === 'EXPIRED' ? 'error.main' : 'success.main',
                }}
              >
                {popupData?.status === 'PENDING' ? 'Invite sent' : popupData?.status === 'EXPIRED' ? 'Expired' : 'Accepted'}
              </Typography>
            </Box>
          </Stack>
          <Tooltip title="Delete Co-host" placement="left">
            <IconButton
              sx={{
                color: 'primary.main',
              }}
              onClick={() => onDeleteClick()}
            >
              <Trash size={20} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* Permissions */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
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
        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* Activity Log */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
            Activity Log
          </Typography>
          <Stack component={Link} target='_blank' href={`/host/activity-logs/${popupData?.user?.id}`} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Box>
              <Typography variant="body1" fontSize={15} fontWeight={500}>
                Your activity
              </Typography>
              <Typography variant="body2" fontSize={13}>
                View a record of what you've done since you created the listing.
              </Typography>
            </Box>
            <Typography variant="body2">
              <ChevronRight />
            </Typography>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
