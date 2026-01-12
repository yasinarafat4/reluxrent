import { useTranslation } from '@/contexts/TranslationContext';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function AboutPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();
  const [aboutText, setAboutText] = useState('');

  const maxCharacters = 300;

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxCharacters) {
      setAboutText(value);
    }
  };

  return (
    <Dialog
      open={showModal}
      onClose={closeModal}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: '10px',
          flexDirection: 'column',
          width: '100%',
        },
      }}
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
        {trans(' About you')}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {trans('Tell us a little bit about yourself, so your future hosts or guests can get to know you.')}
        </Typography>
        <TextField multiline rows={4} value={aboutText} onChange={handleChange} fullWidth variant="outlined" />
        <Typography variant="caption" color="text.secondary" align="right" display="block" sx={{ mt: 1 }}>
          {maxCharacters - aboutText.length} {trans('characters available')}
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
          onClick={closeModal}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            bgcolor: 'black',
            '&:hover': { bgcolor: '#333' },
          }}
        >
          {trans('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
