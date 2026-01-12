import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { convertAndFormatBookedCurrency } from '@/utils/convertAndFormatPrice';
import { Box, Button, Checkbox, Divider, FormControlLabel, IconButton, Link, Menu, MenuItem, Popover, Stack, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { Calendar, Minus, Plus, User, X } from 'lucide-react';
import Image from 'next/image';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useForm } from 'react-hook-form';

export default function BookNowPopup({ closeModal, showModal, popupData }) {
  console.log('BookNowPopup$$$', popupData);
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { trans } = useTranslation();
  const { guestFee, hostFee, activeCurrency, defaultCurrency } = useReluxRentAppContext();
  const [loading, setLoading] = useState(false);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [guestMenuAnchorEl, setGuestMenuAnchorEl] = useState(null);
  const [guestCount, setGuestCount] = useState(popupData?.lastBooking?.guests);
  const [nights, setNights] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [range, setRange] = useState({
    from: popupData?.lastBooking?.startDate,
    to: popupData?.lastBooking?.endDate,
  });

  const [discountType, setDiscountType] = useState(popupData?.lastBooking?.discountType);
  const [totalPrice, setTotalPrice] = useState(popupData?.lastBooking?.totalPrice);
  const [totalDiscount, setTotalDiscount] = useState(popupData?.lastBooking?.totalDiscount);
  const [totalGuestFee, setTotalGuestFee] = useState(popupData?.lastBooking?.totalGuestFee);
  const [totalHostFee, setTotalHostFee] = useState(popupData?.lastBooking?.totalHostFee);

  const calendarAnchorRef = useRef(null);

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
        const dateWisePriceObj = popupData?.lastBooking?.property?.dateWisePrices?.[dateString];

        nights.push({
          date: dateString,
          price: dateWisePriceObj?.price ? parseFloat(dateWisePriceObj.price) : parseFloat(popupData?.lastBooking?.property?.propertyPrice?.price),
        });

        curr.setDate(curr.getDate() + 1);
      }

      setNights(nights);
    }
  }, [range]);

  useEffect(() => {
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalGuestFee = 0;
    let totalHostFee = 0;
    setDiscountType('none');
    nights.forEach((date, index) => {
      totalPrice += date.price;
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

  console.log('guestCount', guestCount);

  useEffect(() => {
    setValue('bookingId', popupData?.lastBooking?.id);
    setValue('conversationBookingId', popupData?.conversationBookingId);
    setValue('propertyId', popupData?.lastBooking?.property?.id);
    setValue('currencyId', activeCurrency?.id);
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
    setValue('cancellationPolicyId', popupData?.lastBooking?.cancellationPolicy?.id);
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
      console.log('Error creating booking:', error?.response?.data || error);
      enqueueSnackbar(error?.response?.data?.error, { variant: 'error' });
      console.log('Error creating booking', error);
    } finally {
      setLoading(false);
    }
  };

  // Date Functionalities
  const isCalendarOpen = Boolean(calendarAnchorEl);

  const MyCustomDayButton = ({ day, className, ...props }) => {
    return (
      <>
        <button className={`${className} search-box-calender`} {...props}>
          <span className={props.modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
        </button>
      </>
    );
  };

  const handleClearDates = () => {
    setRange({ from: undefined, to: undefined });
  };

  // Calendar handlers
  const handleCalendarOpen = (event) => {
    setCalendarAnchorEl(calendarAnchorRef.current);
  };

  const handleCalendarClose = () => {
    setCalendarAnchorEl(null);
  };

  // Guest Functionalities
  const isGuestMenuOpen = Boolean(guestMenuAnchorEl);

  const handleGuestMenuOpen = (event) => {
    setGuestMenuAnchorEl(event.currentTarget);
  };

  const handleGuestMenuClose = () => {
    setGuestMenuAnchorEl(null);
  };

  const updateGuest = (type, change) => {
    setGuestCount((prevState) => {
      let newCount;
      if (type === 'adults') {
        newCount = { ...prevState, adults: Math.max(0, prevState['adults'] + change) };
      } else if (type === 'children') {
        newCount = { ...prevState, children: Math.max(0, prevState['children'] + change) };
      } else if (type === 'infants') {
        newCount = { ...prevState, infants: Math.max(0, prevState['infants'] + change) };
      } else {
        newCount = { ...prevState };
      }

      const totalGuests = newCount.adults + newCount.children;
      if (totalGuests <= popupData?.lastBooking?.property?.accommodates) {
        return newCount;
      } else {
        console.log('The total number of adults and children cannot exceed the maximum accommodates.');
        return prevState;
      }
    });
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
              <Box sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={'center'} gap={2}>
                  <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 130 }, position: 'relative' }}>
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
                          <Typography fontSize={{ xs: 14 }} sx={{ textDecoration: 'line-through', color: 'divider' }}>
                            {convertAndFormatBookedCurrency({
                              orderCurrency: popupData?.lastBooking?.currency,
                              exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                              exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                              price: totalPrice,
                            })}
                          </Typography>
                          <Typography fontSize={{ xs: 14 }} fontWeight="bold">
                            {convertAndFormatBookedCurrency({
                              orderCurrency: popupData?.lastBooking?.currency,
                              exchangeRateToBase: popupData?.lastBooking?.exchangeRateToBase,
                              exchangeRatePropertyToBase: popupData?.lastBooking?.exchangeRatePropertyToBase,
                              price: totalPrice - totalDiscount,
                            })}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography fontSize={{ xs: 14 }} fontWeight="bold">
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
                          <Typography fontSize={{ xs: 14 }}>
                            {range?.from && `${format(range.from, 'dd MMM yyyy')}`} -{range?.to && `${format(range.to, 'dd MMM yyyy')}`}
                          </Typography>
                          {errors.endDate && (
                            <Typography fontSize={{ xs: 14 }} color="error.main">
                              {errors.endDate.message}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          onClick={handleCalendarOpen}
                          variant="contained"
                          sx={{ bgcolor: 'divider', color: 'text.primary', boxShadow: 'none', textTransform: 'none', fontSize: '14px' }}
                          size="small"
                        >
                          {trans('Change')}
                        </Button>
                      </Stack>
                      {/* Calendar */}
                      <div ref={calendarAnchorRef}></div>

                      {/* Calendar Popover */}
                      <Popover
                        open={isCalendarOpen}
                        anchorEl={calendarAnchorEl}
                        onClose={handleCalendarClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        slotProps={{
                          paper: {
                            sx: {
                              minWidth: { md: 650 },
                              p: 2,
                              borderRadius: 2,
                              mt: 0,
                            },
                          },
                        }}
                      >
                        <DayPicker
                          mode="range"
                          selected={range}
                          defaultMonth={range.from || new Date()}
                          onSelect={setRange}
                          disabled={(date) => date < new Date()}
                          numberOfMonths={isXs ? 1 : 2}
                          navLayout="around"
                          components={{
                            DayButton: (props) => <MyCustomDayButton {...props} />,
                          }}
                        />
                        <Stack direction={'row'} justifyContent={'end'} mt={1}>
                          <Button
                            onClick={handleClearDates}
                            variant="text"
                            size="small"
                            sx={{
                              fontSize: 14,
                              textTransform: 'none',
                              textDecoration: 'underline',
                              '&:hover': {
                                textDecoration: 'underline',
                                bgcolor: 'transparent',
                              },
                            }}
                          >
                            {trans('Clear dates')}
                          </Button>
                          <Button
                            onClick={handleCalendarClose}
                            variant="text"
                            color="error"
                            size="small"
                            sx={{
                              fontSize: 14,
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: 'transparent',
                              },
                            }}
                          >
                            {trans('Close')}
                          </Button>
                        </Stack>
                      </Popover>

                      {/* Guests row */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <User size={18} />
                          <Typography fontSize={{ xs: 14 }}>{guestSummary}</Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleGuestMenuOpen}
                          sx={{
                            bgcolor: 'divider',
                            color: 'text.primary',
                            boxShadow: 'none',
                            textTransform: 'none',
                            fontSize: '14px',
                          }}
                        >
                          {trans('Change')}
                        </Button>
                      </Stack>

                      {/* Guest Selector Menu */}
                      <Menu
                        anchorEl={guestMenuAnchorEl}
                        open={isGuestMenuOpen}
                        onClose={handleGuestMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        slotProps={{
                          list: {
                            disablePadding: true,
                            sx: { p: 2, width: 300 },
                          },
                        }}
                      >
                        [ {/* Adults */}
                        <MenuItem disableRipple sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography fontSize={{ xs: 14 }} fontWeight="medium">
                              {trans('Adults')}
                            </Typography>
                            <Typography variant="caption" color="text.primary">
                              {trans('Ages 13 or above')}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                              sx={{
                                '&.Mui-disabled': {
                                  pointerEvents: 'auto',
                                  cursor: 'not-allowed',
                                },
                                color: 'text.primary',
                              }}
                              size="small"
                              onClick={() => updateGuest('adults', -1)}
                              disabled={guestCount.adults <= 1}
                            >
                              <Minus size={14} />
                            </IconButton>
                            <Typography>{guestCount.adults}</Typography>
                            <IconButton
                              sx={{
                                '&.Mui-disabled': {
                                  pointerEvents: 'auto',
                                  cursor: 'not-allowed',
                                },
                                color: 'text.primary',
                              }}
                              size="small"
                              onClick={() => updateGuest('adults', 1)}
                            >
                              <Plus size={14} />
                            </IconButton>
                          </Box>
                        </MenuItem>
                        ,{/* Children */}
                        <MenuItem disableRipple sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography fontSize={{ xs: 14 }} fontWeight="medium">
                              {trans('Children')}
                            </Typography>
                            <Typography variant="caption" color="text.primary">
                              {trans('Ages 2 - 12')}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                              sx={{
                                '&.Mui-disabled': {
                                  pointerEvents: 'auto',
                                  cursor: 'not-allowed',
                                },
                                color: 'text.primary',
                              }}
                              size="small"
                              onClick={() => updateGuest('children', -1)}
                              disabled={guestCount.children <= 0}
                            >
                              <Minus size={14} />
                            </IconButton>
                            <Typography>{guestCount.children}</Typography>
                            <IconButton
                              sx={{
                                '&.Mui-disabled': {
                                  pointerEvents: 'auto',
                                  cursor: 'not-allowed',
                                },
                                color: 'text.primary',
                              }}
                              size="small"
                              onClick={() => updateGuest('children', 1)}
                            >
                              <Plus size={14} />
                            </IconButton>
                          </Box>
                        </MenuItem>
                        ,{/* Infants */}
                        <MenuItem disableRipple sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography fontSize={{ xs: 14 }} fontWeight="medium">
                              {trans('Infants')}
                            </Typography>
                            <Typography variant="caption" color="text.primary">
                              {trans('Under 2')}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                              sx={{
                                '&.Mui-disabled': {
                                  pointerEvents: 'auto',
                                  cursor: 'not-allowed',
                                },
                                color: 'text.primary',
                              }}
                              size="small"
                              onClick={() => updateGuest('infants', -1)}
                              disabled={guestCount.infants <= 0}
                            >
                              <Minus size={14} />
                            </IconButton>
                            <Typography>{guestCount.infants}</Typography>
                            <IconButton
                              sx={{
                                '&.Mui-disabled': {
                                  pointerEvents: 'auto',
                                  cursor: 'not-allowed',
                                },
                                color: 'text.primary',
                              }}
                              size="small"
                              onClick={() => updateGuest('infants', 1)}
                            >
                              <Plus size={14} />
                            </IconButton>
                          </Box>
                        </MenuItem>
                        ,
                        <Box textAlign="end" mt={1}>
                          <Button size="small" onClick={handleGuestMenuClose}>
                            Done
                          </Button>
                        </Box>
                        ]
                      </Menu>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Cancellation Policy */}
                    <Typography variant="subtitle1" fontWeight={'bold'} gutterBottom>
                      {trans('Cancellation policy')}
                    </Typography>
                    <Typography fontSize={{ xs: 14 }} color="text.secondary" mb={1}>
                      - {popupData?.lastBooking?.cancellationPolicy?.name}
                    </Typography>
                    <Typography fontSize={{ xs: 14 }} color="text.secondary" mb={1}>
                      - {popupData?.lastBooking?.cancellationPolicy?.description}
                    </Typography>
                    <Link href="/help/cancellation-policy" underline="always" fontSize={{ xs: 14 }} mb={1} display="inline-block">
                      {trans('Learn more')}
                    </Link>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />

                <Stack p={0} gap={1}>
                  <FormControlLabel
                    control={<Checkbox size="small" defaultChecked />}
                    label={
                      <Typography fontSize={12}>
                        {trans('By clicking on Confirm And Pay, I agree to the')}{' '}
                        <Link href="/help/terms-and-conditions" underline="always">
                          {trans('Terms & Conditions')}
                        </Link>{' '}
                        ,{' '}
                        <Link href="/help/privacy-policy" underline="always">
                          {trans('Privacy Policy')}
                        </Link>{' '}
                        {trans('and')}{' '}
                        <Link href="/help/refund-policy" underline="always">
                          {trans('Refund Policy')}
                        </Link>
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
