import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { convertAndFormatBookedCurrency, formatPrice } from '@/utils/convertAndFormatPrice';
import { CountdownTimer } from '@/utils/CountdownTimer';
import { Box, Button, DialogActions, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

export default function ReviewSpecialOfferPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  console.log('ReviewSpecialOfferPopupData', popupData);
  async function withdrawSpecialOfferClicked() {
    try {
      const { data } = await api.post('/api/host/withdraw-special-offer', { bookingId: popupData?.lastBooking?.id, conversationBookingId: popupData?.conversationBookingId });
      console.log('data', data);
      const socket = getSocket();
      socket.emit('reservationUpdate', {
        bookingId: popupData?.lastBooking?.id,
        conversationBookingId: popupData?.conversationBookingId,
        status: 'PENDING',
      });
      closeModal();
    } catch (error) {
      console.log(error);
    }
  }

  const formatGuestSummary = (guests = {}) => {
    const parts = [];
    if (guests?.adults) parts.push(`${guests?.adults} Adult${guests?.adults > 1 ? 's' : ''}`);
    if (guests?.children) parts.push(`${guests?.children} Child${guests?.children > 1 ? 'ren' : ''}`);
    if (guests?.infants) parts.push(`${guests?.infants} Infant${guests?.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: 2,
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {trans('Special offer')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {popupData?.lastBooking?.guest?.name} has <CountdownTimer expiredAt={popupData?.lastBooking?.specialOffer.expiredAt} /> hours left to book. If you'd like to make changes to this special
          offer, withdraw it and send a new one.
        </Typography>
        {/* Price Visibility Indicator */}
        <Stack direction={'row'} gap={1} my={1} alignItems={'center'}>
          <Typography border={'1px solid'} bgcolor="violet" height={15} width={15}></Typography>
          <Typography variant="body2">Price is visible to the user</Typography>
        </Stack>

        {/* Listing */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            {trans('Listing')}
          </Typography>
          <Typography variant="body2">{popupData?.property?.propertyDescription?.name}</Typography>
        </Box>

        {/* Dates */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            {trans('Dates')}
          </Typography>
          <Typography variant="body2">
            {format(popupData?.lastBooking?.specialOffer?.startDate, 'MMM dd, yyyy')} - {format(popupData?.lastBooking?.specialOffer?.endDate, 'MMM dd, yyyy')}
          </Typography>
        </Box>

        {/* Guests */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            {trans('Guests')}
          </Typography>
          <Typography variant="body2">{formatGuestSummary(popupData?.lastBooking?.specialOffer?.guests)}</Typography>
        </Box>

        {/* Subtotal */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            {trans('Subtotal')}
          </Typography>

          <Box>
            <Typography variant="body2">{formatPrice(popupData?.lastBooking?.property?.propertyPrice?.currency, popupData?.lastBooking?.specialOffer?.price)}</Typography>
            <Typography variant="body2" color="violet">
              {convertAndFormatBookedCurrency({
                orderCurrency: popupData?.lastBooking?.currency,
                exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                price: popupData?.lastBooking?.specialOffer?.price,
              })}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Guest Payment */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {trans('Your guest will pay')}
          </Typography>
          <Stack spacing={0.5}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">
                {popupData?.lastBooking?.specialOffer?.totalNight} {popupData?.lastBooking?.specialOffer?.totalNight > 1 ? 'nights' : 'night'}
              </Typography>
              <Box>
                <Typography variant="body2">{formatPrice(popupData?.lastBooking?.property?.propertyPrice?.currency, popupData?.lastBooking?.specialOffer?.price)}</Typography>
                <Typography variant="body2" color="violet">
                  {convertAndFormatBookedCurrency({
                    orderCurrency: popupData?.lastBooking?.currency,
                    exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                    exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                    price: popupData?.lastBooking?.specialOffer?.price,
                  })}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">{trans('Sevice fee ')}(guest)</Typography>
              <Box>
                <Typography variant="body2">{formatPrice(popupData?.lastBooking?.property?.propertyPrice?.currency, popupData?.lastBooking?.specialOffer?.guestFee)}</Typography>
                <Typography variant="body2" color="violet">
                  {convertAndFormatBookedCurrency({
                    orderCurrency: popupData?.lastBooking?.currency,
                    exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                    exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                    price: popupData?.lastBooking?.specialOffer?.guestFee,
                  })}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" fontWeight="600">
                {trans('Total')} ({popupData?.lastBooking?.currency?.code})
              </Typography>
              <Box>
                <Typography variant="body2">
                  {formatPrice(popupData?.lastBooking?.property?.propertyPrice?.currency, (popupData?.lastBooking?.specialOffer?.price + popupData?.lastBooking?.specialOffer?.guestFee).toFixed(2))}
                </Typography>
                <Typography variant="body2" color="violet">
                  {convertAndFormatBookedCurrency({
                    orderCurrency: popupData?.lastBooking?.currency,
                    exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                    exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                    price: (popupData?.lastBooking?.specialOffer?.price + popupData?.lastBooking?.specialOffer?.guestFee).toFixed(2),
                  })}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Host Earn */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {trans("You'll earn")}
          </Typography>
          <Stack spacing={0.5}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">
                {popupData?.lastBooking?.specialOffer?.totalNight} {popupData?.lastBooking?.specialOffer?.totalNight > 1 ? 'nights' : 'night'}
              </Typography>
              <Box>
                <Typography variant="body2">{formatPrice(popupData?.lastBooking?.property?.propertyPrice?.currency, popupData?.lastBooking?.specialOffer?.price)}</Typography>
                <Typography variant="body2" color="violet">
                  {convertAndFormatBookedCurrency({
                    orderCurrency: popupData?.lastBooking?.currency,
                    exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                    exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                    price: popupData?.lastBooking?.specialOffer?.price,
                  })}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">{trans('Sevice fee')} (host)</Typography>
              <Box>
                <Typography variant="body2">{formatPrice(popupData?.lastBooking?.property?.propertyPrice?.currency, popupData?.lastBooking?.specialOffer?.hostFee)}</Typography>
                <Typography variant="body2" color="violet">
                  -
                  {convertAndFormatBookedCurrency({
                    orderCurrency: popupData?.lastBooking?.currency,
                    exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                    exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                    price: popupData?.lastBooking?.specialOffer?.hostFee,
                  })}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" fontWeight="600">
                {trans('Total')} ({popupData.lastBooking.currency.code})
              </Typography>
              <Box>
                <Typography variant="body2">
                  {formatPrice(popupData?.lastBooking?.property?.propertyPrice?.currency, (popupData?.lastBooking?.specialOffer?.price - popupData?.lastBooking?.specialOffer?.hostFee).toFixed(2))}
                </Typography>
                <Typography variant="body2" color="violet">
                  {convertAndFormatBookedCurrency({
                    orderCurrency: popupData?.lastBooking?.currency,
                    exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                    exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                    price: (popupData?.lastBooking?.specialOffer?.price - popupData?.lastBooking?.specialOffer?.hostFee).toFixed(2),
                  })}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, width: '100%', borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent={'space-between'} width={'100%'}>
          <Button
            onClick={closeModal}
            variant="text"
            color="error"
            sx={{
              textTransform: 'none',
              textDecoration: 'underline',
              fontSize: 14,
              '&:hover': {
                textDecoration: 'underline',
                bgcolor: 'transparent',
              },
            }}
          >
            {trans('Cancel')}
          </Button>

          <Button
            onClick={withdrawSpecialOfferClicked}
            variant="outlined"
            sx={{
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'transparent',
              },
              fontSize: 14,
            }}
          >
            {trans('Withdraw special offer')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
