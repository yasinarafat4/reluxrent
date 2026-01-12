import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, Button, Divider, Pagination, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Avatar from 'react-avatar';

import useSWR from 'swr';
import PublicResponse from './PublicResponse';

const ReviewAbout = () => {
  const { trans } = useTranslation();
  const [openId, setOpenId] = useState(null);
  const router = useRouter();
  const page = Number(router.query.page) || 1;
  const { data: reviewsAboutYouData = [], isLoading, mutate } = useSWR(`/api/host/reviews-about-you?page=${page}`, fetcher);
  console.log('reviewsAboutYouData', reviewsAboutYouData);

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
          {trans('Past reviews')}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {trans('What guests have said about their stay!')}
        </Typography>
      </Box>

      {reviewsAboutYouData?.data?.length > 0 ? (
        <>
          {/* Reviews */}
          {reviewsAboutYouData?.data?.map((reviewAbout, i) => (
            <Box key={i}>
              <Box p={2}>
                {/* User Info */}
                <Box maxWidth={600}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={reviewAbout?.reviewSender?.image} name={reviewAbout?.reviewSender?.name} alt={reviewAbout?.reviewSender?.name} size="40" round={true} />
                    <Box>
                      <Typography fontWeight={600}>{reviewAbout?.reviewSender?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(reviewAbout?.createdAt, 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Review Text */}
                  <Typography mt={2} variant="body1" fontSize={15}>
                    {reviewAbout?.message}
                  </Typography>
                </Box>

                {/* Response Button */}
                {reviewAbout.reviewReceiver.isHost && (
                  <>
                    {reviewAbout?.publicResponse ? (
                      <Box marginLeft={4} marginTop={2} maxWidth={500}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={reviewAbout?.reviewReceiver?.image} name={reviewAbout?.reviewReceiver?.name} alt={reviewAbout?.reviewReceiver?.name} size="30" round={true} />
                          <Typography variant="body2" fontWeight={600}>
                            {trans('Response from')} {reviewAbout?.reviewReceiver?.name}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" mt={1}>
                          {reviewAbout?.publicResponse}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          {format(reviewAbout?.publicResponseDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {openId !== reviewAbout?.id ? (
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                              border: '2px solid',
                              color: 'text.secondary',
                              mt: 2,
                              width: 'auto',
                              borderRadius: 1,
                              textTransform: 'none',
                              fontWeight: 500,
                            }}
                            onClick={() => setOpenId(reviewAbout?.id)}
                          >
                            {trans('Leave Public Response')}
                          </Button>
                        ) : (
                          <>
                            <PublicResponse reviewAbout={reviewAbout} setOpenId={setOpenId} mutate={mutate} />
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </Box>
              {i < reviewsAboutYouData.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
          {/* Pagination */}
          {reviewsAboutYouData?.data?.length > 0 && <Pagination onChange={onDataChange} page={page} count={reviewsAboutYouData?.pagination?.totalPages} variant="outlined" shape="rounded" />}
        </>
      ) : (
        <Typography variant="body2" fontWeight={500}>
          {trans('No one has reviewed you yet.')}
        </Typography>
      )}
    </Stack>
  );
};

export default ReviewAbout;
