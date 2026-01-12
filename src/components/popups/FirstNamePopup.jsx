import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, Divider, IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { X } from 'lucide-react';

export default function FirstNamePopup({ closeModal, showModal, setShowAgreeAndContinuePopup }) {
  const { trans } = useTranslation();

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle sx={{ fontSize: { xs: '16px', md: '18px' } }} id="responsive-dialog-title">
        {trans('Login or Signup')}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={closeModal}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[700],
        })}
      >
        <X />
      </IconButton>
      <Divider />
      <DialogContent>
        <TextField fullWidth label="Preferred first name (optional)" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} />
        <Typography variant="body2" color="text.secondary" mt={1}>
          This is how your first name will appear to hosts and guests. <a href="#">Learn more</a>
        </Typography>
      </DialogContent>

      <Box p={2}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          // onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Dialog>
  );
}
