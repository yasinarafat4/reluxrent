import NoDataFound from '@/components/NoDataFound';
import { useTranslation } from '@/contexts/TranslationContext';
import { Avatar, Box, DialogTitle, Divider, IconButton, Rating, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { X } from 'lucide-react';

export default function ShowGuestReviewsPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  const reviews = popupData?.lastBooking?.host?.reviewsReceived;
  
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
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>{trans('What guests say about')} {popupData?.lastBooking?.host?.name}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={(theme) => ({
            color: theme.palette.text.primary,
          })}
        >
          <X />
        </IconButton>
      </Stack>
      <Divider />
      <DialogContent>
        <Stack spacing={4} px={{ xs: 1, sm: 2 }}>
          {reviews.length > 0 ? (
            <Stack spacing={3}>
              {reviews.map((review, i) => (
                <Stack key={i} spacing={1}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={review?.reviewSender?.image} alt={review?.reviewSender?.name} />
                    <Box>
                      <Typography fontWeight="500">{review?.reviewSender?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(review?.createdAt, 'MMMM,yyyy')}
                      </Typography>
                    </Box>
                  </Stack>
                  <Rating value={review?.overallRating || 0} readOnly size="small" />
                  <Typography>{review.message}</Typography>
                  {i < reviews.length - 1 && <Divider />}
                </Stack>
              ))}
            </Stack>
          ) : (
            <NoDataFound title="No Reviews Yet!" subtitle="This host hasn't received any reviews from guests so far." />
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
