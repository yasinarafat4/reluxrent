import { useTranslation } from '@/contexts/TranslationContext';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Typography } from '@mui/material';

export default function EmailAlreadyUsedPopup({ closeModal, showModal, email, onLink }) {
  const { trans } = useTranslation();

  return (
    <Dialog
      sx={{
        zIndex: 9999,
        '& .MuiDialog-paper': {
          width: '100%',
          margin: '10px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'xs'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <IconButton onClick={closeModal}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogTitle
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
        }}
      >
        {trans('Email Already Used')}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="body1">
          {trans('The email address')} <strong>{email}</strong> {trans('is already linked to an existing account.')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {trans('Would you like to link this account?')}
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{
          justifyContent: 'flex-end',
          p: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={onLink}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            bgcolor: 'black',
            '&:hover': { bgcolor: '#333' },
          }}
        >
          {trans('Link')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
