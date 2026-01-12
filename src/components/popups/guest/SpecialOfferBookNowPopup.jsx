import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { convertAndFormatBookedCurrency } from '@/utils/convertAndFormatPrice';
import { Box, Button, Checkbox, Divider, FormControlLabel, IconButton, Popover, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { Calendar, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import 'react-day-picker/dist/style.css';
import { useForm } from 'react-hook-form';

export default function SpecialOfferBookNowPopup({ closeModal, showModal, popupData }) {
  console.log('SpecialOfferBookNowPopup', popupData);

  const { trans } = useTranslation();
  const { guestFee, hostFee, activeCurrency, defaultCurrency } = useReluxRentAppContext();
  const [loading, setLoading] = useState(false);
  const [guestCount, setGuestCount] = useState(popupData?.lastBooking?.specialOffer?.guests);
  const [nights, setNights] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [range, setRange] = useState({
    from: popupData?.lastBooking?.specialOffer?.startDate,
    to: popupData?.lastBooking?.specialOffer?.endDate,
  });

  const [discountType, setDiscountType] = useState(popupData?.lastBooking?.discountType);
  const [totalPrice, setTotalPrice] = useState(popupData?.lastBooking?.specialOffer?.price);
  const [totalDiscount, setTotalDiscount] = useState(popupData?.lastBooking?.totalDiscount);
  const [totalGuestFee, setTotalGuestFee] = useState(popupData?.lastBooking?.specialOffer?.guestFee);
  const [totalHostFee, setTotalHostFee] = useState(popupData?.lastBooking?.specialOffer?.hostFee);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setNights([]);
    if (!range || !range.from || !range.to) return;
    if (range.from && range.to) {
      const startDate = new Date(range.from);
      const endDate = new Date(range.to);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const nights = [];
      let curr = new Date(startDate);
      while (curr < endDate) {
        const dateString = format(curr, 'yyyy-MM-dd');
        const price = popupData?.lastBooking?.specialOffer?.price / popupData?.lastBooking?.specialOffer?.totalNight;
        console.log('PRP', price);

        nights.push({
          date: dateString,
          price: price,
        });

        curr.setDate(curr.getDate() + 1);
      }

      setNights(nights);
    }
  }, [range]);
  console.log('NIGHTS', nights);

  useEffect(() => {
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalGuestFee = 0;
    let totalHostFee = 0;
    setDiscountType('none');
    nights.forEach((data) => {
      totalPrice += data.price;
    });

    const weeklyDiscount = parseFloat(popupData?.lastBooking?.property?.propertyPrice?.weeklyDiscount) / 100;
    const monthlyDiscount = parseFloat(popupData?.lastBooking?.property?.propertyPrice?.monthlyDiscount) / 100;

    if (weeklyDiscount && nights.length >= 7) {
      setDiscountType('weekly');
      totalDiscount = totalPrice * weeklyDiscount;
    }

    if (monthlyDiscount && nights.length >= 28) {
      setDiscountType('monthly');
      totalDiscount = totalPrice * monthlyDiscount;
    }
    const discountedPrice = totalPrice - totalDiscount;
    const guestFeeRate = guestFee / 100;
    const hostFeeRate = hostFee / 100;

    // Guest fee (added to what guest pays)
    totalGuestFee = discountedPrice * guestFeeRate;

    // Host fee (deducted from what host receives)
    totalHostFee = discountedPrice * hostFeeRate;

    setTotalPrice(totalPrice);
    setTotalDiscount(totalDiscount);
    setTotalGuestFee(totalGuestFee);
    setTotalHostFee(totalHostFee);
  }, [nights, popupData]);

  console.log('Range', range);

  useEffect(() => {
    setValue('specialOfferId', popupData?.lastBooking?.specialOffer.id);
    setValue('bookingId', popupData?.lastBooking?.id);
    setValue('propertyId', popupData?.lastBooking?.property?.id);
    setValue('currencyId', activeCurrency.id);
    setValue('hostId', popupData?.lastBooking?.host?.id);
    setValue('startDate', range.from);
    setValue('endDate', range.to);
    setValue('guests', guestCount);
    setValue('totalNight', nights.length);
    setValue('discountType', discountType);
    setValue('totalPrice', totalPrice);
    setValue('totalDiscount', totalDiscount);
    setValue('totalGuestFee', totalGuestFee);
    setValue('totalHostFee', totalHostFee);
    setValue('cleaningCharge', popupData?.lastBooking?.property?.propertyPrice.cleaningFee);
    setValue('extraGuestCharge', popupData?.lastBooking?.property?.propertyPrice.guestAfterFee);
    setValue('bookingType', 'BOOKING');
    setValue('cancellationPolicyId', popupData?.lastBooking?.property?.cancellationPolicy?.id);
    setValue('nights', nights);

    if (activeCurrency && defaultCurrency) {
      const exchangeRateToBase = (1 / activeCurrency.exchangeRate) * defaultCurrency?.exchangeRate;
      setValue('exchangeRateToBase', exchangeRateToBase);
      const exchangeRatePropertyToBase = defaultCurrency.exchangeRate / popupData?.lastBooking?.property?.propertyPrice?.currency?.exchangeRate;
      setValue('exchangeRatePropertyToBase', exchangeRatePropertyToBase);
    }
  }, [popupData?.lastBooking?.property, range, guestCount, nights, discountType, totalDiscount, totalPrice, totalGuestFee, totalHostFee, activeCurrency]);

  useEffect(() => {
    if (!(range.from && range.to)) {
      setError('endDate', { type: 'manual', message: 'You must select end date!' });
    } else {
      clearErrors('endDate');
    }
  }, [range]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data: bookingData, status } = await api.post(`/api/guest/confirm-booking`, formData);

      if (status == 200) {
        const { data: paymentData } = await api.post('/api/payment/init-payment', {
          bookingId: bookingData.booking.id,
          totalPrice: bookingData.booking.totalPrice,
          totalDiscount: bookingData.booking.totalDiscount,
          totalGuestFee: bookingData.booking.totalGuestFee,
          totalHostFee: bookingData.booking.totalHostFee,
          cleaningCharge: bookingData.booking.cleaningCharge,
          bookingCurrency: bookingData.booking.currency,
          propertyCurrency: popupData?.lastBooking?.property?.propertyPrice.currency,
          defaultCurrency: defaultCurrency,
          customerInfo: {
            name: bookingData.booking.guest.name,
            email: bookingData.booking.guest.email,
            phone: bookingData.booking.guest.phone,
          },
        });
        window.location.href = paymentData.GatewayPageURL;
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.error, { variant: 'error' });
      console.log('Error creating booking', error);
    } finally {
      setLoading(false);
    }
  };

  const guestSummary = `${guestCount.adults + guestCount.children} Guest${guestCount.adults + guestCount.children > 1 ? 's' : ''}${
    guestCount.infants ? `, ${guestCount.infants} Infant${guestCount.infants > 1 ? 's' : ''}` : ''
  }`;
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
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'end'} alignItems={'center'} pt={3} px={3}>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            color: 'text.primary',
            p: 0,
          }}
        >
          <X />
        </IconButton>
      </Stack>
      <DialogContent sx={{ p: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            py: 2,
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              flexBasis: 0,
              minWidth: 0,
              maxWidth: { sm: '100%' },
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                maxWidth: { xs: '100%' },
                position: { sm: 'sticky' },
                top: { sm: 20, md: 100 },
                alignSelf: { sm: 'flex-start' },
                mb: { xs: 2, md: 0 },
              }}
            >
              <Box sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={'center'} gap={2}>
                  <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 160 }, position: 'relative' }}>
                    <Image
                      src={popupData?.lastBooking?.property?.propertyImages[0]?.image}
                      alt={popupData?.lastBooking?.property?.propertyDescription?.name}
                      fill
                      style={{ objectFit: 'cover', borderRadius: '10px' }}
                    />
                  </Box>

                  <Stack gap={0.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {popupData?.lastBooking?.property?.propertyDescription?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ⭐ {popupData?.lastBooking?.property?.overallRating || 0.0} ({popupData?.lastBooking?.property?.reviewCount || 0})
                    </Typography>
                    <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                      {discountType != 'none' ? (
                        <Stack direction={'row'} gap={1}>
                          <Typography fontSize={14} sx={{ textDecoration: 'line-through', color: 'divider' }}>
                            {convertAndFormatBookedCurrency({
                              orderCurrency: popupData?.lastBooking.currency,
                              exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                              exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                              price: totalPrice,
                            })}
                          </Typography>
                          <Typography fontSize={14} fontWeight="bold">
                            {convertAndFormatBookedCurrency({
                              orderCurrency: popupData?.lastBooking?.currency,
                              exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                              exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                              price: totalPrice - totalDiscount,
                            })}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography fontSize={14} fontWeight="bold">
                          {convertAndFormatBookedCurrency({
                            orderCurrency: popupData?.lastBooking?.currency,
                            exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                            exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                            price: totalPrice,
                          })}
                        </Typography>
                      )}
                      <X size={14} /> {nights.length > 0 ? `for ${nights.length} night${nights.length > 1 ? 's' : ''}` : 'per night'}
                    </Stack>

                    <Typography variant="body2" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ mt: 1, textDecoration: 'underline', cursor: 'pointer' }}>
                      {trans('Price breakdown')}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    flexGrow: 1,
                    flexBasis: 0,
                    minWidth: 0,
                    maxWidth: { sm: '100%' },
                  }}
                >
                  <Box sx={{ maxWidth: '100%', mx: 'auto', fontFamily: 'sans-serif' }}>
                    {/* Your Trip */}
                    <Stack gap={2}>
                      <Typography variant="subtitle1" fontWeight={'bold'} gutterBottom>
                        {trans('Your Trip')}
                      </Typography>

                      {/* Dates */}
                      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Calendar size={18} />
                          <Typography fontSize={14}>
                            {range?.from && `${format(range.from, 'dd MMM yyyy')}`} -{range?.to && `${format(range.to, 'dd MMM yyyy')}`}
                          </Typography>
                          {errors.endDate && (
                            <Typography fontSize={14} color="error.main">
                              {errors.endDate.message}
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      {/* Guests row */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <User size={18} />
                          <Typography fontSize={14}>{guestSummary}</Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Cancellation Policy */}
                    <Typography variant="subtitle1" fontWeight={'bold'} gutterBottom>
                      {trans('Cancellation policy')}
                    </Typography>
                    <Typography fontSize={14} color="text.secondary" mb={1}>
                      - {popupData?.lastBooking?.cancellationPolicy?.name}
                    </Typography>
                    <Typography fontSize={14} color="text.secondary" mb={1}>
                      - {popupData?.lastBooking?.cancellationPolicy?.description}
                    </Typography>

                    <Box component={Link} href={'/help/cancellation-policy'} target="_blank" color={'primary.main'} sx={{ textDecoration: 'underline' }} fontSize={14}>
                      {trans('Learn more')}
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />

                <Stack p={0} gap={1}>
                  <FormControlLabel
                    control={<Checkbox size="small" defaultChecked />}
                    label={
                      <Typography fontSize={12}>
                        {trans('By clicking on Confirm And Pay, I agree to the')}{' '}
                        <Box component={Link} href={'/help/terms-and-conditions'} target="_blank" color={'primary.main'} sx={{ textDecoration: 'underline' }} fontSize={12}>
                          {trans('Terms & Conditions')}
                        </Box>
                        ,{' '}
                        <Box component={Link} href={'/help/privacy-policy'} target="_blank" color={'primary.main'} sx={{ textDecoration: 'underline' }} fontSize={12}>
                          {trans('Privacy Policy')}
                        </Box>
                        , and{' '}
                        <Box component={Link} href={'/help/refund-policy'} target="_blank" color={'primary.main'} sx={{ textDecoration: 'underline' }} fontSize={12}>
                          {trans('Refund Policy')}
                        </Box>
                      </Typography>
                    }
                  />
                  <Button variant="contained" fullWidth size="small" sx={{ textTransform: 'none' }} loading={loading} loadingPosition="end" onClick={handleSubmit(onSubmit)}>
                    {trans('Confirm & Pay')}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Price Details Popover */}
      <Popover
        open={anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              zIndex: '9999',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography fontSize={16} fontWeight={600}>
            {trans('Price Details')}
          </Typography>
          <IconButton
            sx={(theme) => ({
              color: 'text.primary',
            })}
            size="small"
            onClick={() => setAnchorEl(null)}
          >
            <X size={16} />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          {nights?.map((data, index) => {
            return (
              <Stack key={index} direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{format(data.date, 'yyyy-MM-dd')}</Typography>
                <Typography variant="subtitle2">
                  {convertAndFormatBookedCurrency({
                    orderCurrency: popupData?.lastBooking?.currency,
                    exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                    exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                    price: data.price,
                  })}
                </Typography>
              </Stack>
            );
          })}
          {discountType != 'none' && (
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">{trans(`${discountType} stay discount`)}</Typography>
              <Typography variant="subtitle2" color="error">
                -{' '}
                {convertAndFormatBookedCurrency({
                  orderCurrency: popupData?.lastBooking?.currency,
                  exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                  price: totalDiscount,
                })}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">{trans(`Reluxrent service fee`)}</Typography>
            <Typography variant="subtitle2" color="success">
              +{' '}
              {convertAndFormatBookedCurrency({
                orderCurrency: popupData?.lastBooking?.currency,
                exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                price: totalGuestFee,
              })}
            </Typography>
          </Stack>

          <Divider sx={{ my: 1 }} />
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography variant="subtitle2">{discountType != 'none' ? 'Price after discount' : 'Total'}</Typography>
            <Typography variant="subtitle2">
              {convertAndFormatBookedCurrency({
                orderCurrency: popupData?.lastBooking?.currency,
                exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                price: totalPrice + totalGuestFee - totalDiscount,
              })}
            </Typography>
          </Stack>
        </Box>
      </Popover>
    </Dialog>
  );
}
