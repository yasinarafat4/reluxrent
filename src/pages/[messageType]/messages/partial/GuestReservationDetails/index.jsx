import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { ShieldHalf } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BookingDetails from './BookingDetails';
import PaymentDetails from './PaymentDetails';
import PropertyDetails from './PropertyDetails';

export default function GuestReservationDetails({ conversationData }) {
  console.log('GuestReservationDetails', conversationData);
  const { trans } = useTranslation();
  const router = useRouter();
  const { conversationId, messageType } = router.query;

  const { actions } = usePopups();

  if (!conversationId) {
    return (
      <Box p={4}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box mx="auto" width={'100%'} px={{ xs: 2, sm: 5, md: 1.5, lg: 2 }}  py={{ xs: 0, md: 2 }}>
      {/* Property Details  */}
      <PropertyDetails details={conversationData} />

      <Divider sx={{ my: 2 }} />

      {/* Trip Details */}
      <BookingDetails details={conversationData} />

      <Divider sx={{ my: 2 }} />

      {/* Payment Details */}
      <PaymentDetails details={conversationData} />

      <Divider sx={{ my: 2 }} />

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={1}>
        <Stack>
          <Typography variant="body2" fontWeight={600}>
            {trans('Always communicate through Reluxrent')}
          </Typography>
          <Typography variant="body2">
            {trans('For your safety, never transfer money or share personal details outside the Reluxrent website or app.')}{' '}
            <Typography component={Link} href={'/help/pay-outside-reluxrent'} target="_blank" sx={{ textDecoration: 'underline' }} fontSize={{ xs: 13 }} color={'primary.main'} fontWeight={500}>
              {trans('Learn more')}
            </Typography>{' '}
          </Typography>
        </Stack>
        <IconButton sx={{ color: 'primary.main' }}>
          <ShieldHalf size={30} />
        </IconButton>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography
        onClick={() => actions.openPopup('reportHost', conversationData)}
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
  );
}
