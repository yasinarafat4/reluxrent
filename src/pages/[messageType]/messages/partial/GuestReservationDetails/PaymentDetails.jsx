import { useTranslation } from '@/contexts/TranslationContext';
import { convertAndFormatBookedCurrency } from '@/utils/convertAndFormatPrice';
import { Box, Divider, Typography } from '@mui/material';

export default function PaymentDetails({ details }) {
  if (!details) return null;
  const { trans } = useTranslation();
  
  const lastBooking = details?.lastBooking;
  console.log('PaymentDetails', lastBooking);

  return (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {trans('Payment Details')}
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2">For {lastBooking?.specialOffer ? lastBooking?.specialOffer?.totalNight : lastBooking?.totalNight} nights</Typography>
        <Typography variant="body2">
          {convertAndFormatBookedCurrency({
            orderCurrency: lastBooking?.currency,
            exchangeRateToBase: lastBooking?.exchangeRateToBase,
            exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
            price: lastBooking?.specialOffer ? lastBooking?.specialOffer?.price : lastBooking?.totalPrice,
          })}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2">{trans('Service fee')}</Typography>
        <Typography variant="body2">
          +
          {convertAndFormatBookedCurrency({
            orderCurrency: lastBooking?.currency,
            exchangeRateToBase: lastBooking?.exchangeRateToBase,
            exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
            price: lastBooking?.specialOffer ? lastBooking?.specialOffer?.guestFee : lastBooking?.totalGuestFee,
          })}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2">{lastBooking?.discountType == "weekly" ? "Weekly" : "Monthly"} {trans('Discounts')}</Typography>
        <Typography variant="body2">
          -
          {convertAndFormatBookedCurrency({
            orderCurrency: lastBooking?.currency,
            exchangeRateToBase: lastBooking?.exchangeRateToBase,
            exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
            price: lastBooking?.totalDiscount,
          })}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2">{trans('Cleaning Charge')}</Typography>
        <Typography variant="body2">
          +
          {convertAndFormatBookedCurrency({
            orderCurrency: lastBooking?.currency,
            exchangeRateToBase: lastBooking?.exchangeRateToBase,
            exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
            price: lastBooking?.cleaningCharge,
          })}
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" fontWeight="bold">
          {trans('Total Payable')}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {convertAndFormatBookedCurrency({
            orderCurrency: lastBooking?.currency,
            exchangeRateToBase: lastBooking?.exchangeRateToBase,
            exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
            price: lastBooking?.specialOffer
              ? lastBooking?.specialOffer?.price + lastBooking?.specialOffer?.guestFee + lastBooking?.cleaningCharge
              : lastBooking?.grandTotal,
          })}
        </Typography>
      </Box>

      {lastBooking?.bookingStatus == 'CONFIRMED' ? (
        <>
          {lastBooking?.paymentStatus == 'PAID' && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" fontWeight="bold" color="success">
                {trans('Paid')}
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="success">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer
                    ? lastBooking?.specialOffer?.price + lastBooking?.specialOffer?.guestFee + lastBooking?.cleaningCharge
                    : lastBooking?.grandTotal,
                })}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="body2" fontWeight="bold" color="warning">
            {trans('Due')}
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="warning">
            {convertAndFormatBookedCurrency({
              orderCurrency: lastBooking?.currency,
              exchangeRateToBase: lastBooking?.exchangeRateToBase,
              exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
              price: lastBooking?.specialOffer
              ? lastBooking?.specialOffer?.price + lastBooking?.specialOffer?.guestFee + lastBooking?.cleaningCharge
              : lastBooking?.grandTotal,
            })}
          </Typography>
        </Box>
      )}
    </>
  );
}
