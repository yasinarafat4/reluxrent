import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { convertAndFormatToActiveCurrency, convertAndFormatToDefaultCurrency } from '@/utils/convertAndFormatPrice';
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

export default function ReservePopup({
  closeReserveModal,
  showReserveModal,
  propertyData,
  range,
  setRange,
  guestCount,
  updateGuest,
  nights,
  discountType,
  totalDiscount,
  totalGuestFee,
  totalHostFee,
  totalPrice,
  cleaningFee,
}) {
  const { trans } = useTranslation();
  const { defaultCurrency, activeCurrency } = useReluxRentAppContext();
  const [loading, setLoading] = useState(false);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [guestMenuAnchorEl, setGuestMenuAnchorEl] = useState(null);
  const [priceDetailsAnchorEl, setPriceDetailsAnchorEl] = useState(null);
  const calendarAnchorRef = useRef(null);
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const {
    control,
    trigger,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue('propertyId', propertyData.id);
    setValue('currencyId', activeCurrency.id);
    setValue('hostId', propertyData.host.id);
    setValue('startDate', range.from);
    setValue('endDate', range.to);
    setValue('guests', guestCount);
    setValue('totalNight', nights.length);
    setValue('discountType', discountType);
    setValue('totalPrice', totalPrice);
    setValue('totalDiscount', totalDiscount);
    setValue('totalGuestFee', totalGuestFee);
    setValue('totalHostFee', totalHostFee);
    setValue('cleaningCharge', propertyData.propertyPrice.cleaningFee);
    setValue('extraGuestCharge', propertyData.propertyPrice.guestAfterFee);
    setValue('bookingType', 'BOOKING');
    setValue('cancellationPolicyId', propertyData.cancellationPolicy.id);
    setValue('nights', nights);

    if (activeCurrency && defaultCurrency) {
      const exchangeRateToBase = (1 / activeCurrency.exchangeRate) * defaultCurrency?.exchangeRate;
      setValue('exchangeRateToBase', exchangeRateToBase);
      const exchangeRatePropertyToBase = defaultCurrency.exchangeRate / propertyData?.propertyPrice?.currency?.exchangeRate;
      setValue('exchangeRatePropertyToBase', exchangeRatePropertyToBase);
    }
  }, [propertyData, range, guestCount, nights, discountType, totalPrice, totalDiscount, totalGuestFee, totalHostFee, activeCurrency]);

  useEffect(() => {
    if (!(range.from && range.to)) {
      setError('endDate', { type: 'manual', message: 'You must select end date!' });
    } else {
      clearErrors('endDate');
    }
  }, [range]);

  const onSubmit = async (formData) => {
    console.log('formData', formData);
    try {
      setLoading(true);
      const { data: bookingData, status } = await api.post(`/api/guest/property-booking`, formData);

      if (status == 200) {
        const { data: paymentData } = await api.post('/api/payment/init-payment', {
          bookingId: bookingData.booking.id,
          totalPrice: bookingData.booking.totalPrice,
          totalDiscount: bookingData.booking.totalDiscount,
          totalGuestFee: bookingData.booking.totalGuestFee,
          totalHostFee: bookingData.booking.totalHostFee,
          cleaningCharge: bookingData.booking.cleaningCharge,
          bookingCurrency: bookingData.booking.currency,
          propertyCurrency: propertyData.propertyPrice.currency,
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

  // Date Functionalities
  const isCalendarOpen = Boolean(calendarAnchorEl);

  // const MyCustomDayButton = ({ day, selected, propertyData, className, ...props }) => {
  //   const formattedDate = format(day.date, 'yyyy-MM-dd');
  //   return (
  //     <>
  //       <Tooltip open={openTooltip == formattedDate} placement="top" title={`${propertyData?.minimumStay} nights minimum`}>
  //         <button className={`${className}`} {...props}>
  //           <span className={props.modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
  //         </button>
  //       </Tooltip>
  //     </>
  //   );
  // };

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

  const guestSummary = `${guestCount.adults + guestCount.children} Guest${guestCount.adults + guestCount.children > 1 ? 's' : ''}${
    guestCount.infants ? `, ${guestCount.infants} Infant${guestCount.infants > 1 ? 's' : ''}` : ''
  }`;

  const openPriceDetails = Boolean(priceDetailsAnchorEl);

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
      open={showReserveModal}
      fullWidth={true}
      maxWidth={'sm'}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'end'} alignItems={'center'} pt={3} px={3}>
        <IconButton
          aria-label="close"
          onClick={closeReserveModal}
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
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={'start'} gap={2}>
                  <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 200, sm: 120 }, position: 'relative' }}>
                    <Image src={propertyData?.propertyImages[0]?.image} alt={propertyData?.propertyDescription?.name} fill style={{ objectFit: 'cover', borderRadius: '10px' }} />
                  </Box>

                  <Stack gap={0.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {propertyData?.propertyDescription?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ⭐ 4.91 (11) • Guest favorite
                    </Typography>
                    <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                      {discountType != 'none' ? (
                        <Stack direction={'row'} gap={1}>
                          <Typography fontSize={14} sx={{ textDecoration: 'line-through', color: 'divider' }}>
                            {convertAndFormatToActiveCurrency(propertyData?.propertyPrice?.currency, totalPrice + cleaningFee + totalGuestFee)}
                          </Typography>
                          <Typography fontSize={14} fontWeight="bold">
                            {convertAndFormatToActiveCurrency(propertyData?.propertyPrice?.currency, totalPrice + cleaningFee + totalGuestFee - totalDiscount)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography fontSize={14} fontWeight="bold">
                          {convertAndFormatToActiveCurrency(propertyData?.propertyPrice?.currency, totalPrice + cleaningFee + totalGuestFee)}
                        </Typography>
                      )}
                      <X size={14} /> {nights.length > 0 ? `for ${nights.length} night${nights.length > 1 ? 's' : ''}` : 'per night'}
                    </Stack>

                    <Typography variant="body2" onClick={(e) => setPriceDetailsAnchorEl(e.currentTarget)} sx={{ mt: 1, textDecoration: 'underline', cursor: 'pointer' }}>
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
                            {range?.from && `${format(range.from, 'dd MMM yyyy')}`} - {range?.to && `${format(range.to, 'dd MMM yyyy')}`}
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
                          <Typography fontSize={14}>{guestSummary}</Typography>
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
                        [{/* Adults */}
                        <MenuItem disableRipple sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography fontSize={14} fontWeight="medium">
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
                            <Typography fontSize={14} fontWeight="medium">
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
                            <Typography fontSize={14} fontWeight="medium">
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
                            {trans('Done')}
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
                    <Typography fontSize={14} color="text.secondary" mb={1}>
                      - {propertyData.cancellationPolicy.name}
                    </Typography>
                    <Typography fontSize={14} color="text.secondary" mb={1}>
                      - {propertyData.cancellationPolicy.description}
                    </Typography>
                    <Link href="/help/cancellation-policy" underline="always" fontSize={14} mb={1} display="inline-block">
                      {trans('Learn more')}
                    </Link>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />

                <Stack p={0} gap={2}>
                  <FormControlLabel
                    control={<Checkbox size="small" defaultChecked />}
                    label={
                      <Typography fontSize={{ xs: 12 }}>
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

                  <Typography variant="body1" fontSize={{ xs: 14 }} fontWeight={500}>
                    You are paying in {activeCurrency.symbol} {activeCurrency.code}. Your total charge is{' '}
                    {convertAndFormatToDefaultCurrency(propertyData?.propertyPrice?.currency?.exchangeRate, totalPrice + cleaningFee + totalGuestFee - totalDiscount)}. The exchange rate for booking
                    this listing is {activeCurrency.symbol} 1 = {defaultCurrency.symbol} {(defaultCurrency.exchangeRate / activeCurrency.exchangeRate).toFixed(2)} {defaultCurrency.code}.
                  </Typography>
                  <Button variant="contained" fullWidth size="small" sx={{ textTransform: 'none' }} loading={loading} loadingPosition="end" onClick={handleSubmit(onSubmit)}>
                    {trans('Confirm & Pay')}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Price Details Popover */}
          <Popover
            open={openPriceDetails}
            anchorEl={priceDetailsAnchorEl}
            onClose={() => setPriceDetailsAnchorEl(null)}
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
                  width: 320,
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
                onClick={() => setPriceDetailsAnchorEl(null)}
              >
                <X size={16} />
              </IconButton>
            </Box>
            <Box sx={{ p: 2 }}>
              {nights?.map((data, index) => {
                return (
                  <Stack key={index} direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{format(data.date, 'yyyy-MM-dd')}</Typography>
                    <Typography variant="subtitle2">{convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, data.price)}</Typography>
                  </Stack>
                );
              })}
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                  {nights.length} {nights.length > 1 ? 'nights' : 'night'}{' '}
                </Typography>
                <Typography variant="subtitle2">{convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice)}</Typography>
              </Stack>
              {cleaningFee && (
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Cleaning Fee</Typography>
                  <Typography variant="subtitle2">{convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, cleaningFee)}</Typography>
                </Stack>
              )}

              {discountType != 'none' && (
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" textTransform={'capitalize'}>
                    {trans(`${discountType} stay discount`)}
                  </Typography>
                  <Typography variant="subtitle2" color="error">
                    - {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalDiscount)}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{trans(`Reluxrent service fee`)}</Typography>
                <Typography variant="subtitle2" color="success">
                  + {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalGuestFee)}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1 }} />
              <Stack direction={'row'} justifyContent={'space-between'}>
                <Typography variant="subtitle2">{discountType != 'none' ? 'Price after discount' : 'Total'}</Typography>
                <Typography variant="subtitle2">{convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice + cleaningFee + totalGuestFee - totalDiscount)}</Typography>
              </Stack>
            </Box>
          </Popover>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
