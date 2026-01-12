import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Box, Button, DialogTitle, Divider, IconButton, Menu, MenuItem, Rating, Slider, Stack, TextField, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Avatar from 'react-avatar';
import useSWR from 'swr';

export default function ViewAllReviewsPopup({ closeModal, showModal, popupData }) {
  console.log('ViewAllReviewsPopupData', popupData);
  const { trans } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('Most relevant');

  const { data: reviews = [], isLoading } = useSWR(`/api/front/reviews/${popupData.id}`, fetcher);
  console.log('ViewAllReviewsPopupReviews', reviews);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = (value) => {
    if (value) setSortBy(value);
    setAnchorEl(null);
  };

  if (isLoading) {
    return null;
  }

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
      maxWidth={'lg'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} pr={1}>
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>{trans(`All Reviews`)}</DialogTitle>
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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} p={{ xs: 1, sm: 3 }}>
          {/* Left Panel */}
          <Box flex={1}>
            <Stack alignItems="center" spacing={1}>
              <Stack direction={'row'} alignItems="center" justifyContent="center">
                {/* Left laurel */}
                <Box
                  sx={(theme) => ({
                    position: 'relative',
                    height: 60,
                    width: 30,
                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)',
                  })}
                >
                  <Image src="/images/left-laurel.png" alt="Left laurel" fill />
                </Box>
                {/* Rating number */}
                <Typography variant="h1" fontWeight={500}>
                  {popupData.overallRating || 0}
                </Typography>
                {/* Right laurel */}
                <Box
                  sx={(theme) => ({
                    position: 'relative',
                    height: 60,
                    width: 30,
                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)',
                  })}
                >
                  <Image src="/images/right-laurel.png" alt="Right laurel" fill />
                </Box>
              </Stack>
              <Typography color="text.primary" fontWeight={500}>
                Guest favorite
              </Typography>
              <Typography variant="body2" textAlign="center" color="text.secondary">
                This home is in the{' '}
                <Typography component={'span'} color="text.primary" fontWeight={500}>
                  top 5%
                </Typography>{' '}
                of eligible listings based on ratings, reviews, and reliability
              </Typography>
            </Stack>

            <Box mt={3}>
              <Typography fontWeight="bold">Overall rating</Typography>
              {[5, 4, 3, 2, 1].map((star) => (
                <Stack direction="row" alignItems="center" spacing={1} key={star}>
                  <Typography width={30}>{star}</Typography>
                  <Slider
                    color="secondary"
                    value={reviews.starPercentages[star] || 0}
                    max={100}
                    min={0}
                    slotProps={{
                      thumb: { style: { display: 'none' } }, // hide the handle
                    }}
                  />
                </Stack>
              ))}
            </Box>

            <Stack mt={3} spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Cleanliness</Typography>
                <Typography fontWeight="bold">{reviews?.categoryRatings?.cleanliness}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Accuracy</Typography>
                <Typography fontWeight="bold">{reviews?.categoryRatings?.accuracy}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Check-in</Typography>
                <Typography fontWeight="bold">{reviews?.categoryRatings?.checkin}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Communication</Typography>
                <Typography fontWeight="bold">{reviews?.categoryRatings?.communication}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Amenities</Typography>
                <Typography fontWeight="bold">{reviews?.categoryRatings?.amenities}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Location</Typography>
                <Typography fontWeight="bold">{reviews?.categoryRatings?.location}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>Value</Typography>
                <Typography fontWeight="bold">{reviews?.categoryRatings?.value}</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Right Panel */}
          <Box flex={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {popupData.reviewCount} {popupData.reviewCount > 1 ? 'reviews' : 'review'}
              </Typography>
              <Box>
                {' '}
                <Button variant="outlined" size="small" onClick={handleClick} endIcon={<ArrowDropDownIcon />}>
                  {sortBy}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleClose()}>
                  {['Most relevant', 'Most recent', 'Highest rated', 'Lowest rated'].map((option) => (
                    <MenuItem key={option} onClick={() => handleClose(option)}>
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Stack>

            <TextField
              fullWidth
              placeholder="Search reviews"
              size="small"
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8 }} />,
              }}
            />

            <Divider sx={{ my: 2 }} />

            <Stack spacing={3}>
              {reviews?.data?.map((review, i) => (
                <Box>
                  <Stack key={i} spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={review?.reviewSender?.image} name={review?.reviewSender?.name} alt={review?.reviewSender?.name} round={true} size="40" />
                      <Box>
                        <Typography fontWeight="500">{review?.reviewSender?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(review?.createdAt, 'MMMM yyyy')}
                        </Typography>
                      </Box>
                    </Stack>
                    <Rating value={review?.overallRating || 0} readOnly size="small" />
                    <Typography>{review?.message}</Typography>
                  </Stack>

                  {review?.publicResponse && (
                    <Box ml={4} my={2} maxWidth={500}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={review?.reviewReceiver?.image} name={review?.reviewReceiver?.name} alt={review?.reviewReceiver?.name} size="35" round={true} />
                        <Box>
                          <Typography variant="body2" fontSize={{ xs: 14 }} fontWeight={500}>
                            {trans('Response from')} {review?.reviewReceiver?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {format(review?.publicResponseDate, 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography variant="body2" fontSize={{ xs: 13 }} mt={1}>
                        {review?.publicResponse}
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
