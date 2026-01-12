import { useTranslation } from '@/contexts/TranslationContext';
import { Avatar, Box, DialogTitle, Divider, IconButton, Rating, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { formatDistanceToNow } from 'date-fns';
import { Dot, X } from 'lucide-react';

export default function ViewFullReviewPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  console.log('popupData', popupData);

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '15px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} pr={1}>
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>Review from {popupData?.reviewSender?.name}</DialogTitle>
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
      <DialogContent>
        <Box display="flex" gap={1}>
          <Avatar src={popupData?.reviewSender?.image} sx={{ width: 55, height: 55 }}>
            {!popupData?.reviewSender?.image && popupData?.reviewSender?.name[0]}
          </Avatar>
          <Box>
            <Typography fontWeight="bold">{popupData?.reviewSender?.name}</Typography>
            <Typography fontWeight={'normal'} fontSize={12}>
              {formatDistanceToNow(popupData?.reviewSender?.createdAt)} on Reluxrent
            </Typography>
          </Box>
        </Box>

        <Box>
          <Stack direction={'row'} alignItems={'center'}>
            <Rating readOnly size="small" value={popupData?.overallRating ? Number(popupData?.overallRating) : 0} />
            <Dot />
            <Typography variant="caption" color="text.primary" fontSize={12}>
              {formatDistanceToNow(popupData?.createdAt, { addSuffix: true })}
            </Typography>
          </Stack>
          <Typography fontSize={14} flexGrow={1}>
            {popupData?.message}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
