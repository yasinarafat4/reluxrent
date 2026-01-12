import { useTranslation } from '@/contexts/TranslationContext';
import StarIcon from '@mui/icons-material/Star';
import { Avatar, Box, DialogTitle, Divider, IconButton, Rating, Slider, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { X } from 'lucide-react';

export default function GuestReviewsPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  const reviews = popupData?.lastBooking?.guest?.reviewsReceived;
  console.log('GuestReviewsPopupData', popupData);
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
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>{popupData?.lastBooking?.guest?.name}'s reviews</DialogTitle>
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
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={4} px={{ xs: 1, sm: 3 }}>
          {/* Stats Panel */}
          <Box>
            <Box mt={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight="bold" sx={{ width: 250 }}>
                  Rating average
                </Typography>
                <Slider
                  color="secondary"
                  value={popupData.guestOverallRating}
                  max={5}
                  slotProps={{
                    thumb: { style: { display: 'none' } }, // hide the handle
                  }}
                />
                <Typography fontWeight="bold">{popupData.guestOverallRating}</Typography>
                <StarIcon fontSize="inherit" sx={{ color: 'common.black' }} />
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight="bold" sx={{ width: 250 }}>
                  Cleanliness
                </Typography>
                <Slider
                  color="secondary"
                  value={popupData.guestCategoryRatings.cleanliness}
                  max={5}
                  slotProps={{
                    thumb: { style: { display: 'none' } }, // hide the handle
                  }}
                />
                <Typography fontWeight="bold">{popupData.guestCategoryRatings.cleanliness}</Typography>
                <StarIcon fontSize="inherit" sx={{ color: 'common.black' }} />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight="bold" sx={{ width: 250 }}>
                  House rules
                </Typography>
                <Slider
                  color="secondary"
                  value={popupData.guestCategoryRatings.houseRules}
                  max={5}
                  slotProps={{
                    thumb: { style: { display: 'none' } }, // hide the handle
                  }}
                />
                <Typography fontWeight="bold">{popupData.guestCategoryRatings.houseRules}</Typography>
                <StarIcon fontSize="inherit" sx={{ color: 'common.black' }} />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight="bold" sx={{ width: 250 }}>
                  Communication
                </Typography>
                <Slider
                  color="secondary"
                  value={popupData.guestCategoryRatings.communication}
                  max={5}
                  slotProps={{
                    thumb: { style: { display: 'none' } }, // hide the handle
                  }}
                />
                <Typography fontWeight="bold">{popupData.guestCategoryRatings.communication}</Typography>
                <StarIcon fontSize="inherit" sx={{ color: 'common.black' }} />
              </Stack>
            </Box>
          </Box>

          {/* Reviews Panel */}
          <Box>
            <Stack spacing={3}>
              {reviews.map((review, i) => (
                <Stack key={i} spacing={1}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={review.reviewSender.image} alt={review.reviewSender.name} />
                    <Box>
                      <Typography fontWeight="500">{review.reviewSender.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(review.createdAt, 'MMMM,yyyy')}
                      </Typography>
                    </Box>
                  </Stack>
                  <Rating value={review.overallRating || 0} readOnly size="small" />
                  <Typography>{review.message}</Typography>
                  {i < reviews.length - 1 && <Divider />}
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
