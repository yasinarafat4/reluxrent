import { useTranslation } from '@/contexts/TranslationContext';
import CloseIcon from '@mui/icons-material/Close';
import { Avatar, Box, Dialog, IconButton, Paper, Typography } from '@mui/material';
import { CircleCheck } from 'lucide-react';

export default function ListingSetupNotifyPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();

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
      <Paper
        elevation={2}
        sx={[
          (theme) => ({
            width: '350px',
            margin: '0 auto',
            p: 2,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'white',
          }),
          (theme) =>
            theme.applyStyles('dark', {
              bgcolor: theme.palette.grey[800],
            }),
        ]}
      >
        <Avatar sx={{ bgcolor: '#eb0a76', width: 40, height: 40 }} variant="rounded">
          <CircleCheck sx={{ color: 'white' }} />
        </Avatar>
        <Box>
          <Typography fontWeight={600} fontSize={14}>
            {trans('Complete your listing setup')}
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            {trans('Finalize details to make your listing visible')}
          </Typography>
        </Box>
      </Paper>
    </Dialog>
  );
}
