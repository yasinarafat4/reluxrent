import { useTranslation } from '@/contexts/TranslationContext';
import { Avatar, Button, DialogTitle, Divider, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';

const reasons = ["I think they're scamming or spamming me", "They're being offensive", 'Something else'];

export default function MessageReadByPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));

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
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} pr={1}>
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>{trans(`Message read by`)}</DialogTitle>
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
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar src={''} />
          <div>
            <Typography fontWeight="bold">Arafat</Typography>
            <Typography variant="caption" color="text.secondary">
              Yesterday, 02:30 PM
            </Typography>
          </div>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          You will only see people in this list if they have read receipts turned on.{' '}
          <Button variant="text" size="small">
            Update your preferences
          </Button>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
