import NoDataFound from '@/components/NoDataFound';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Divider, IconButton, Popover, Rating, Slider, Stack, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { BrushCleaning, Building2, CheckCircle, CircleGauge, Dot, KeyRound, MapPinHouse, MessagesSquare } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Avatar from 'react-avatar';
import useSWR from 'swr';

const ReviewSummary = ({ propertyData }) => {
  const { trans } = useTranslation();
  const [showFullReviewPopup, setShowFullReviewPopup] = useState(false);
  const [showAllReviewsPopup, setShowAllReviewsPopup] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { actions } = usePopups();

  const { data: reviews = [], isLoading } = useSWR(`/api/front/reviews/${propertyData.id}/8`, fetcher);
  console.log('reviews$', reviews);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (isLoading) {
    return null;
  }

  return (
    <Box>
      {/* Overall Score */}
      <Stack gap={3} textAlign="center" mb={3}>
        <Stack direction={'row'} alignItems="center" justifyContent="center">
          {/* Left laurel */}
          <Box
            sx={(theme) => ({
              zIndex: -1,
              position: 'relative',
              height: 80,
              width: 40,
              filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)',
            })}
          >
            <Image src="/images/left-laurel.png" alt="Left laurel" fill />
          </Box>
          {/* Rating number */}
          <Typography variant="h1">{propertyData.overallRating || 0}</Typography>
          {/* Right laurel */}
          <Box
            sx={(theme) => ({
              zIndex: -1,
              position: 'relative',
              height: 80,
              width: 40,
              filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)',
            })}
          >
            <Image src="/images/right-laurel.png" alt="Right laurel" fill />
          </Box>
        </Stack>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {trans('Guest favorite')}
          </Typography>
          <Typography color="text.primary" mt={1}>
            {trans('This home is a guest favorite based on ratings, reviews, and reliability')}
          </Typography>
        </Box>
      </Stack>
      {/* Rating Breakdown */}
      <Box maxWidth={400} mx="auto" mb={3}>
        {[5, 4, 3, 2, 1].map((star) => (
          <Stack direction="row" alignItems="center" spacing={1} key={star}>
            <Typography width={30}>{star}</Typography>
            <Slider
              color="primary"
              value={reviews.starPercentages[star] || 0}
              max={100}
              min={0}
              slotProps={{
                thumb: { style: { display: 'none' } },
              }}
            />
          </Stack>
        ))}
      </Box>
      {/* Category Scores (flex wrap) */}
      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3} mb={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <BrushCleaning size={20} />
          <Typography fontSize={16} fontWeight={500}>
            {trans('Cleanliness')}: {reviews.categoryRatings.cleanliness}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircle size={20} />
          <Typography fontSize={16} fontWeight={500}>
            {trans('Accuracy')}: {reviews.categoryRatings.accuracy}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Building2 size={20} />
          <Typography fontSize={16} fontWeight={500}>
            {trans('Amenities')}: {reviews.categoryRatings.amenities}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <KeyRound size={20} />
          <Typography fontSize={16} fontWeight={500}>
            {trans('Check-in')}: {reviews.categoryRatings.checkin}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <MessagesSquare size={20} />
          <Typography fontSize={16} fontWeight={500}>
            {trans('Communication')}: {reviews.categoryRatings.communication}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <MapPinHouse size={20} />
          <Typography fontSize={16} fontWeight={500}>
            {trans('Location')}: {reviews.categoryRatings.location}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <CircleGauge size={20} />
          <Typography fontSize={16} fontWeight={500}>
            {trans('Value')}: {reviews.categoryRatings.value}
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />
      {/* Reviews (flex wrap) */}
      {reviews.data.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {reviews.data.map((review, i) => (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, height: '100%' }}>
              <Stack key={i}>
                <Box display="flex" gap={1}>
                  <Avatar src={review?.reviewSender?.image} name={review?.reviewSender?.name} alt={review?.reviewSender?.name} round={true} size="45" />

                  <Box>
                    <Typography fontWeight="bold">{review?.reviewSender?.name}</Typography>
                    <Typography fontWeight={'normal'} fontSize={12}>
                      {formatDistanceToNow(review?.reviewSender?.createdAt)} on Reluxrent
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Rating readOnly size="small" value={review.overallRating ? Number(review.overallRating) : 0} />
                    <Dot />
                    <Typography variant="caption" color="text.primary" fontSize={12}>
                      {format(review.createdAt, 'MMM dd, yyyy')}
                    </Typography>
                  </Stack>
                  <Typography fontSize={{ xs: 14 }} flexGrow={1}>
                    {review.message.length > 100 ? `${review.message.slice(0, 100)}…` : review.message}
                  </Typography>
                </Box>

                {review.message.length > 100 && (
                  <Button
                    onClick={() => actions.openPopup('viewFullReview', review)}
                    variant="text"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      textDecoration: 'underline',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      padding: 0,
                      alignSelf: 'flex-start',
                    }}
                  >
                    {trans('Show more')}
                  </Button>
                )}
              </Stack>
              {review?.publicResponse && (
                <Box ml={4} my={1} maxWidth={500}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={review?.reviewReceiver?.image} name={review?.reviewReceiver?.name} alt={review?.reviewReceiver?.name} size="30" round={true} />
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
            </Box>
          ))}
        </Box>
      ) : (
        <NoDataFound title={'No reviews found!'} subtitle={'Once guests leave reviews, they will appear here.'} />
      )}
      {/* Action Buttons */}
      <Box mt={4} display="flex" justifyContent={'start'} alignItems={'end'} gap={2} flexWrap="wrap">
        {propertyData.reviewCount > 1 && (
          <Button
            onClick={() => actions.openPopup('viewAllReview', propertyData)}
            variant="text"
            size="small"
            sx={{
              textTransform: 'none',
              px: 1.5,
              py: .8,
              bgcolor: '#fcd4e3',
              '&:hover': {
                bgcolor: '#f4bed3',
              },
            }}
          >
            {trans('Show all ')}
            {propertyData.reviewCount}
            {trans(' reviews')}
          </Button>
        )}

        <Box>
          <Button
            onClick={handleOpen}
            variant="text"
            size="small"
            sx={{
              fontSize: { xs: 12 },
              textTransform: 'none',
              textDecoration: 'underline',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {trans('Learn how reviews work')}
          </Button>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            slotProps={{
              paper: {
                sx: {
                  p: 2,
                  maxWidth: 360,
                  borderRadius: 2,
                  boxShadow: 3,
                },
              },
            }}
          >
            {/* Close Button */}
            <Box display="flex" justifyContent="flex-end">
              <IconButton size="small" onClick={handleClose} sx={{ color: 'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Content */}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              Reviews from past guests help our community learn more about each home. By default, reviews are sorted by relevancy. Relevancy is based on recency, length, and information that you
              provide to us, such as your booking search, your country, and your language preferences.
              {'\n\n'}
              Only the guest who booked the reservation can leave a review, and Reluxrent only moderates reviews flagged for not following our policies.
              {'\n\n'}
              To be eligible for a percentile ranking or guest favorite label, listings need 5 or more recent reviews. Criteria is subject to change.
            </Typography>
          </Popover>
        </Box>
      </Box>
      <Divider sx={{ my: 3 }} />
    </Box>
  );
};

export default ReviewSummary;
