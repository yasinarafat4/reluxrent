import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, Divider, Pagination, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/router';
import Avatar from 'react-avatar';
import useSWR from 'swr';

const ReviewBy = () => {
  const { trans } = useTranslation();

  const router = useRouter();
  const page = Number(router.query.page) || 1;

  const { data: reviewsByYouData = [], isLoading } = useSWR(`/api/host/reviews-by-you?page=${page}`, fetcher);
  console.log('reviewsByYouData', reviewsByYouData);
  const onDataChange = (e, value) => {
    const url = new URL(window.location.origin + router.asPath);
    url.searchParams.set('page', value);
    router.push(url.pathname + '?' + url.searchParams.toString(), undefined, { shallow: true });
  };

  if (isLoading) {
    return null;
  }

  return (
    <Stack gap={1}>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          {trans("Past reviews you've written")}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {trans("These are the reviews you've shared about other stays.")}
        </Typography>
      </Box>

      {reviewsByYouData?.data?.length > 0 ? (
        <>
          {/* Reviews */}
          {reviewsByYouData?.data?.map((reviewBy, i) => (
            <Box key={i}>
              <Box p={2}>
                {/* User Info */}
                <Box maxWidth={600}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={reviewBy?.reviewSender?.image} name={reviewBy?.reviewSender?.name} alt={reviewBy?.reviewSender?.name} size="40" round={true} />
                    <Box>
                      <Typography fontWeight={600}>{reviewBy?.reviewSender?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(reviewBy?.createdAt, 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Review Text */}
                  <Typography mt={2} variant="body1" fontSize={15}>
                    {reviewBy?.message}
                  </Typography>
                </Box>

                {/* Public Response */}
                {reviewBy?.reviewReceiver?.isHost && reviewBy?.publicResponse && (
                  <Box marginLeft={4} marginTop={2} maxWidth={500}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={reviewBy?.reviewReceiver?.image} name={reviewBy?.reviewReceiver?.name} alt={reviewBy?.reviewReceiver?.name} size="30" round={true} />
                      <Typography variant="body2" fontWeight={600}>
                        {trans('Response from')} {reviewBy?.reviewReceiver?.name}
                      </Typography>
                    </Stack>

                    <Typography variant="body2" mt={1}>
                      {reviewBy?.publicResponse}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      {format(reviewBy?.publicResponseDate, 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                )}

                {/* Secret Feedback */}
                {reviewBy?.secretFeedback && (
                  <Box marginLeft={4} marginTop={2} maxWidth={500}>
                    <Stack direction="row" alignItems="start" gap={1}>
                      <Box sx={{ color: 'text.secondary' }}>
                        <Lock size={17} />
                      </Box>
                      <Box>
                        {/* Message */}
                        <Typography variant="body1">{trans('Private feedback')}</Typography>
                        <Typography variant="body2" color="text.secondary" display="block" mt={1}>
                          {reviewBy?.secretFeedback}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Box>
              {i < reviewsByYouData.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
          {/* Pagination */}
          {reviewsByYouData?.data?.length > 0 && <Pagination onChange={onDataChange} page={page} count={reviewsByYouData?.pagination?.totalPages} variant="outlined" shape="rounded" />}
        </>
      ) : (
        <Typography variant="body2" fontWeight={500}>
          {trans('You have not written any reviews yet.')}
        </Typography>
      )}
    </Stack>
  );
};

export default ReviewBy;
