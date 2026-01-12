import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, DialogActions, DialogTitle, Divider, List, ListItem, ListItemButton, ListItemText, Radio, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const reasons = ["I think they're scamming or spamming me", "They're being offensive", 'Something else'];

export default function ReportGuestPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [selectedReason, setSelectedReason] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    console.log('formData', formData);
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
      maxWidth={'xs'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Box>
        <DialogTitle>What's happening?</DialogTitle>
        <Typography marginLeft={3} variant="body2">
          This will only be shared with Reluxrent.
        </Typography>
      </Box>

      <DialogContent sx={{ px: 0, pt: 2 }}>
        <List>
          {reasons.map((reason) => (
            <Box key={reason}>
              <ListItem sx={{ p: 0 }}>
                <ListItemButton onClick={() => setSelectedReason(reason)}>
                  <Radio checked={selectedReason === reason} onChange={() => setSelectedReason(reason)} />
                  <ListItemText primary={reason} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="primary" onClick={closeModal} sx={{ textTransform: 'none' }}>
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
}
