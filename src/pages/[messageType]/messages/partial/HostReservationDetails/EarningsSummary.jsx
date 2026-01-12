import { usePopups } from '@/contexts/PopupContext';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { convertAndFormatBookedCurrency, formatPrice } from '@/utils/convertAndFormatPrice';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Banknote, ChevronRight } from 'lucide-react';

export default function EarningsSummary({ details }) {
  const { trans } = useTranslation();
  const { guestFee, hostFee } = useReluxRentAppContext();
  const { actions } = usePopups();

  const lastBooking = details?.lastBooking;

  if (!lastBooking) return null;
  return (
    <>
      {lastBooking?.paymentStatus != 'PAID' ? (
        <Box mb={2}>
          {/* Price Visibility Indicator */}
          <Stack direction={'row'} gap={1} my={1} alignItems={'center'}>
            <Typography border={'1px solid'} bgcolor="violet" height={15} width={15}></Typography>
            <Typography variant="body2">Price is visible to the user</Typography>
          </Stack>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Potential earnings
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">For {lastBooking?.specialOffer ? lastBooking?.specialOffer.totalNight : lastBooking?.totalNight} nights</Typography>
            <Box>
              <Typography variant="body2">
                {formatPrice(lastBooking?.property?.propertyPrice?.currency, lastBooking?.specialOffer ? lastBooking?.specialOffer?.price : lastBooking?.grandTotal)}
              </Typography>
              <Typography variant="body2" color="violet">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer?.price : lastBooking?.grandTotal,
                })}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Host Service fee</Typography>

            <Box>
              <Typography variant="body2">
                {formatPrice(lastBooking?.property?.propertyPrice?.currency, lastBooking?.specialOffer ? lastBooking?.specialOffer.hostFee : lastBooking?.totalHostFee)}
              </Typography>
              <Typography variant="body2" color="violet">
                -
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer.hostFee : lastBooking?.totalHostFee,
                })}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" fontWeight="600">
              Total
            </Typography>

            <Box>
              <Typography variant="body2">
                {formatPrice(
                  lastBooking?.property?.propertyPrice?.currency,
                  lastBooking?.specialOffer ? lastBooking?.specialOffer.price - lastBooking?.specialOffer.hostFee : lastBooking?.grandTotal - lastBooking?.totalHostFee,
                )}
              </Typography>
              <Typography variant="body2" fontWeight="600" color="violet">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer.price - lastBooking?.specialOffer.hostFee : lastBooking?.grandTotal - lastBooking?.totalHostFee,
                })}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <>
          {/* Guest paid */}
          <Box mb={2}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              Guest paid
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">For {lastBooking?.totalNight} nights</Typography>
              <Typography variant="body2">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.totalPrice,
                })}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Guest Service fee</Typography>
              <Typography variant="body2">
                +
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.totalGuestFee,
                })}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">
                {lastBooking?.discountType == 'weekly' ? 'Weekly' : 'Monthly'} {trans('Discounts')}
              </Typography>
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

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" fontWeight="600">
                Total
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.grandTotal,
                })}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Host payout */}
          <Box mb={2}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              Host payout
            </Typography>
            <Box sx={{ textDecoration: 'underline' }} display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">{lastBooking?.totalNight} night room fee</Typography>
              <Typography variant="body2">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.grandTotal,
                })}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Host Service fee ({hostFee}%)</Typography>
              <Typography variant="body2">
                -
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.totalHostFee,
                })}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" fontWeight="600">
                Total
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.grandTotal - lastBooking?.totalHostFee,
                })}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack
            sx={{ cursor: 'pointer' }}
            onClick={() => actions.openPopup('transactionHistory', lastBooking?.confirmationCode)}
            direction={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Stack direction={'row'} gap={1} alignItems={'center'}>
              <IconButton sx={{ color: 'text.primary' }}>
                <Banknote />
              </IconButton>
              <Typography variant="subtitle2" fontWeight={500}>
                {trans('Transaction history')}
              </Typography>
            </Stack>
            <IconButton sx={{ color: 'text.primary' }}>
              <ChevronRight size={18} />
            </IconButton>
          </Stack>
        </>
      )}
    </>
  );
}
