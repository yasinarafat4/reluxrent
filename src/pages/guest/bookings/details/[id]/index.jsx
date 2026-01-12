import GuestLayout from '@/components/layout/guest/GuestLayout';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Divider, IconButton, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ShieldHalf } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import GuestBookingDetails from '../GuestBookingDetails';
import GuestPaymentDetails from '../GuestPaymentDetails';
import GuestPropertyDetails from '../GuestPropertyDetails';

const BookingDetailsPage = () => {
  const { actions } = usePopups();
  const { trans } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const { data: bookingData, isLoading } = useSWR(`/api/guest/booking-details/${id}`, fetcher);
  console.log('GuestBookingDetailsData', bookingData);
  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <GuestLayout>
      <Box bgcolor={'divider'} px={2} pt={2} pb={{ xs: 10, md: 2 }}>
        <Box bgcolor={'background.white'} borderRadius={1} width={{ sm: '70%', md: '50%', lg: '40%', xl: '30%' }} mx={'auto'} p={3}>
          {/* Property Details  */}
          <GuestPropertyDetails details={bookingData} />
          <Divider sx={{ my: 2 }} />

          {/* Trip Details */}
          <GuestBookingDetails details={bookingData} />

          <Divider sx={{ my: 2 }} />

          {/* Payment Details */}
          <GuestPaymentDetails details={bookingData} />

          <Divider sx={{ my: 2 }} />

          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={1}>
            <Stack>
              <Typography variant="body2" fontWeight={600}>
                {trans('Always communicate through Reluxrent')}
              </Typography>
              <Typography variant="body2">
                {trans('Always communicate through Reluxrent To protect your payment, never transfer money or communicate outside of the Reluxrent website or app.')}{' '}
                <Box sx={{ textDecoration: 'underline' }} color={'primary.main'} fontWeight={500} component={Link} href={'#'} target="_blank">
                  {trans('Learn more')}
                </Box>{' '}
              </Typography>
            </Stack>
            <IconButton sx={{ color: 'primary.main' }}>
              <ShieldHalf size={30} />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography
            onClick={() => actions.openPopup('reportHost', bookingData)}
            pb={2}
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}
            color={'text.primary'}
            variant="body2"
            fontWeight={500}
            target="_blank"
          >
            {trans('Report host')}
          </Typography>
        </Box>
      </Box>
    </GuestLayout>
  );
};

export default BookingDetailsPage;
