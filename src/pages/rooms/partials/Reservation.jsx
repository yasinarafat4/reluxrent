import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { convertAndFormatToActiveCurrency } from '@/utils/convertAndFormatPrice';
import { Box, Button, Card, CardContent, ClickAwayListener, Divider, IconButton, InputAdornment, Menu, MenuItem, Popover, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import { MessageSquareText, Minus, Plus, User, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { InputHelperText } from 'react-admin';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Controller, useForm } from 'react-hook-form';
import ReservePopup from '../../../components/popups/rooms/ReservePopup';

const Reservation = ({ propertyData, range, setRange }) => {
  console.log('ReservationPropertyData', propertyData);
  const router = useRouter();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const { trans } = useTranslation();
  const { user } = useAuth();
  const { actions } = usePopups();
  const { defaultCurrency, activeCurrency, guestFee, hostFee } = useReluxRentAppContext();
  const [nights, setNights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guestCount, setGuestCount] = useState({ adults: 1, children: 0, infants: 0 });
  const [guestMenuAnchorEl, setGuestMenuAnchorEl] = useState(null);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const calendarAnchorRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [discountType, setDiscountType] = useState('none');
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalGuestFee, setTotalGuestFee] = useState(0);
  const [totalHostFee, setTotalHostFee] = useState(0);
  const [cleaningFee, setCleaningFee] = useState(propertyData?.propertyPrice?.cleaningFee);
  const [showReservePopup, setShowReservePopup] = useState(false);
  const [openCalenderPopup, setOpenCalenderPopup] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
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
        const dateWisePriceObj = propertyData?.dateWisePrices?.[dateString];

        nights.push({
          date: dateString,
          price: dateWisePriceObj?.price ? parseFloat(dateWisePriceObj.price) : parseFloat(propertyData?.propertyPrice?.price),
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

    const weeklyDiscount = parseFloat(propertyData?.propertyPrice?.weeklyDiscount) / 100;
    const monthlyDiscount = parseFloat(propertyData?.propertyPrice?.monthlyDiscount) / 100;

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
  }, [nights, propertyData]);

  // Calendar handlers
  const handleCalendarOpen = (event) => {
    setCalendarAnchorEl(event.currentTarget);
  };

  const handleCalendarClose = () => {
    setCalendarAnchorEl(null);
  };

  const handleClearDates = () => {
    setRange({ from: undefined, to: undefined });
  };

  // Guest Menu
  const isGuestMenuOpen = Boolean(guestMenuAnchorEl);
  const isCalendarOpen = Boolean(calendarAnchorEl);

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
      if (totalGuests <= propertyData.accommodates) {
        return newCount;
      } else {
        console.log('The total number of adults and children cannot exceed the maximum accommodates.');
        return prevState;
      }
    });
  };

  const guestSummary = `${guestCount.adults + guestCount.children} Guest${
    guestCount.adults + guestCount.children > 1 ? 's' : ''
  }${guestCount.infants ? `, ${guestCount.infants} Infant${guestCount.infants > 1 ? 's' : ''}` : ''}`;

  const MyCustomDayButton = ({ day, selected, propertyData, range, min, className, ...props }) => {
    const date = new Date(day.date);
    const from = range?.from ? new Date(range.from) : null;
    if (from) from.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = from ? Math.round((date - from) / (1000 * 60 * 60 * 24)) + 1 : 0;
    const showTooltip = range?.from && !range?.to && !props.modifiers?.disabled && diffDays > 0 && diffDays < min;

    return (
      <>
        <Tooltip open={showTooltip} placement="top" title={`${propertyData?.minimumStay} nights minimum`}>
          <button className={`${className} reservation-calender`} {...props}>
            <span className={props.modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
          </button>
        </Tooltip>
      </>
    );
  };

  const bookedDates = new Set(propertyData?.bookings?.flatMap((booking) => booking.bookingDates.map((d) => format(new Date(d.date), 'yyyy-MM-dd'))));

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (date < new Date()) return true;
    if (propertyData?.dateWisePrices?.[formattedDate]?.status === false) {
      return true;
    }
    if (bookedDates.has(formattedDate)) {
      return true;
    }
    return false;
  };

  // Popup Handelers
  function handelShowPopup(field) {
    if (field == 'reservePopup') {
      setShowReservePopup(true);
    }
  }

  function closeReservePopup() {
    setShowReservePopup(false);
  }

  function sendBookingRequest() {
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
    setValue('bookingType', 'REQUEST');
    setValue('cancellationPolicyId', propertyData.cancellationPolicy.id);
    setValue('nights', nights);
    if (activeCurrency && defaultCurrency) {
      const exchangeRateToBase = (1 / activeCurrency.exchangeRate) * defaultCurrency?.exchangeRate;
      setValue('exchangeRateToBase', exchangeRateToBase);
      const exchangeRatePropertyToBase = defaultCurrency.exchangeRate / propertyData?.propertyPrice?.currency?.exchangeRate;
      setValue('exchangeRatePropertyToBase', exchangeRatePropertyToBase);
    }
    handleSubmit(onSubmit)();
  }

  const onSubmit = async (formData) => {
    console.log('Booking Request Data:', formData);
    try {
      setLoading(true);
      const { data, status } = await api.post(`/api/guest/request-booking`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
      router.push(`/guest/messages/${data.conversationId}`);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.error, { variant: 'error' });
      console.log('Error creating property price', error);
    } finally {
      setLoading(false);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      {/* Popups */}
      {showReservePopup && (
        <ReservePopup
          closeReserveModal={closeReservePopup}
          showReserveModal={setShowReservePopup}
          propertyData={propertyData}
          range={range}
          setRange={setRange}
          guestCount={guestCount}
          updateGuest={updateGuest}
          setAnchorEl={setAnchorEl}
          nights={nights}
          discountType={discountType}
          totalDiscount={totalDiscount}
          totalGuestFee={totalGuestFee}
          totalHostFee={totalHostFee}
          totalPrice={totalPrice}
          cleaningFee={cleaningFee}
        />
      )}

      <Card
        className="card"
        sx={{
          display: { xs: 'none', md: 'block' },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          overflow: 'unset',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent>
          {nights.length > 0 ? (
            <Stack direction={'row'} gap={1}>
              <Box>
                {discountType != 'none' ? (
                  <Stack direction={'row'} gap={1}>
                    <Typography color="text.disabled" fontSize={14} sx={{ textDecoration: 'line-through' }}>
                      {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice)}
                    </Typography>
                    <Typography sx={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)} fontSize={14} fontWeight="bold">
                      {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice - totalDiscount)}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography sx={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)} fontSize={14} fontWeight="bold">
                    {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice)}
                  </Typography>
                )}
              </Box>
              {/* {convertAndFormatPropertyPrice(propertyData, nights, open, setOpen)} */}
              <Typography component="span" fontSize={14}>
                {nights.length > 0 ? `for ${nights.length} night${nights.length > 1 ? 's' : ''}` : 'per night'}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body1" fontWeight={600}>
              {trans('Add dates for prices')}
            </Typography>
          )}

          {/* Check-in/Check-out Inputs */}
          <Box display="flex" position={'relative'} gap={1} mt={2} ref={calendarAnchorRef}>
            {/* Check In */}
            <Button
              onClick={() => setOpenCalenderPopup(true)}
              sx={{
                width: '100%',
                border: '1px solid',
                borderColor: range?.from ? 'divider' : 'primary.main',
                textTransform: 'none',
                bgcolor: 'transparent',
                '&:hover': {
                  border: '1px solid',
                },
                cursor: 'text',
              }}
            >
              <Box textAlign="left">
                <Typography variant="body2" fontSize={12} fontWeight="medium" color="text.primary">
                  {trans('Check In')}
                </Typography>
                <Typography fontSize={14}>{range?.from ? format(range.from, 'dd MMM, yyyy') : 'Add date'}</Typography>
              </Box>
            </Button>

            {/* Check Out */}
            <Button
              onClick={() => setOpenCalenderPopup(true)}
              sx={{
                width: '100%',
                border: '1px solid',
                borderColor: range?.to ? 'divider' : 'primary.main',
                textTransform: 'none',

                bgcolor: 'transparent',
                '&:hover': {
                  border: '1px solid',
                },
                cursor: 'text',
              }}
            >
              <Box textAlign="left">
                <Typography variant="body2" fontSize={12} fontWeight="medium" color="text.primary">
                  {trans('Check Out')}
                </Typography>
                <Typography fontSize={14}>{range?.to ? format(range.to, 'dd MMM, yyyy') : 'Add date'}</Typography>
              </Box>
            </Button>

            {/* Check-in/Check-out Popup */}
            {openCalenderPopup && (
              <ClickAwayListener onClickAway={() => setOpenCalenderPopup(false)}>
                <Box
                  position={'absolute'}
                  right={0}
                  height={'460px'}
                  width={'680px'}
                  p={1.5}
                  borderRadius={1}
                  boxShadow={'0 4px 20px rgba(0, 0, 0, 0.3)'}
                  bgcolor={(theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'white')}
                  zIndex={2000}
                  display={'inline-block'}
                >
                  <Stack direction={'row'} justifyContent={'space-between'} gap={1} mb={1.5}>
                    <Box>
                      <Typography variant="h6">
                        {nights.length} {nights.length > 1 ? 'nights' : 'night'}
                      </Typography>
                      <Typography variant="body2">
                        {range?.from ? format(range.from, 'MMM dd, yyyy') : 'Select date'} - {range?.to ? format(range.to, 'MMM dd, yyyy') : 'Select date'}
                      </Typography>
                    </Box>
                    <Stack width={'368px'} direction={'row'} gap={1}>
                      {/* Check In */}
                      <Button
                        sx={{
                          width: '100%',
                          border: '1px solid',
                          borderColor: range?.from ? 'divider' : 'primary.main',
                          textTransform: 'none',
                          bgcolor: 'transparent',
                          cursor: 'default',
                        }}
                      >
                        <Box textAlign="left">
                          <Typography variant="body2" fontSize={12} fontWeight="medium" color="text.primary">
                            {trans('Check In')}
                          </Typography>
                          <Typography fontSize={14}>{range?.from ? format(range.from, 'dd MMM, yyyy') : 'Add date'}</Typography>
                        </Box>
                      </Button>

                      {/* Check Out */}
                      <Button
                        sx={{
                          width: '100%',
                          border: '1px solid',
                          textTransform: 'none',
                          bgcolor: 'transparent',
                          borderColor: range?.to ? 'divider' : 'primary.main',
                          cursor: 'default',
                        }}
                      >
                        <Box textAlign="left">
                          <Typography variant="body2" fontSize={12} fontWeight="medium" color="text.primary">
                            {trans('Check Out')}
                          </Typography>
                          <Typography fontSize={14}>{range?.to ? format(range.to, 'dd MMM, yyyy') : 'Add date'}</Typography>
                        </Box>
                      </Button>
                    </Stack>
                  </Stack>

                  <DayPicker
                    mode="range"
                    numberOfMonths={isXs ? 1 : 2}
                    navLayout="around"
                    selected={range}
                    onSelect={setRange}
                    disabled={disableDate}
                    excludeDisabled
                    min={propertyData?.minimumStay}
                    defaultMonth={range?.from ?? new Date()}
                    components={{
                      DayButton: (props) => <MyCustomDayButton {...props} propertyData={propertyData} range={range} min={propertyData?.minimumStay} />,
                    }}
                  />

                  <Stack direction={'row'} justifyContent={'end'}>
                    <Button
                      onClick={() => setRange({ from: undefined, to: undefined })}
                      variant="text"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        textDecoration: 'underline',
                        '&:hover': {
                          textDecoration: 'underline',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {trans('Clear dates')}
                    </Button>
                    <Button
                      onClick={() => setOpenCalenderPopup(false)}
                      variant="text"
                      color="error"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {trans('Close')}
                    </Button>
                  </Stack>
                </Box>
              </ClickAwayListener>
            )}
          </Box>

          {/* Guest Input */}
          <Box mt={2}>
            <TextField
              fullWidth
              label="Guests"
              sx={[
                (theme) => ({
                  borderRadius: 3,
                  bgcolor: theme.palette.common.white,
                  color: theme.palette.common.black,
                }),
                (theme) =>
                  theme.applyStyles('dark', {
                    bgcolor: theme.palette.grey[900],
                    color: theme.palette.common.white,
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[400],
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: theme.palette.common.white,
                    },
                  }),
              ]}
              size="small"
              value={guestSummary}
              onClick={handleGuestMenuOpen}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        sx={[
                          (theme) => ({
                            p: 0.5,
                            '&.Mui-disabled': {
                              pointerEvents: 'auto',
                              cursor: 'not-allowed',
                            },
                          }),
                          (theme) =>
                            theme.applyStyles('dark', {
                              color: theme.palette.common.white,
                            }),
                        ]}
                      >
                        <User />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

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
          </Box>

          {!(range?.from && range?.to) ? (
            <Button onClick={() => setOpenCalenderPopup(true)} fullWidth variant="contained" color="primary" sx={{ mt: 2, textTransform: 'none' }}>
              {trans('Check availability')}
            </Button>
          ) : (
            <Box>
              {propertyData?.bookingType == 'request' && (
                <Box mt={2}>
                  <Controller
                    name="message"
                    control={control}
                    rules={{
                      required: 'Write your message for host.',
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        fullWidth
                        label="Ask me anything you want"
                        placeholder="Ask me anything you want"
                        multiline
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <IconButton
                                  size="small"
                                  sx={[
                                    (theme) => ({
                                      p: 0.5,
                                      '&.Mui-disabled': {
                                        pointerEvents: 'auto',
                                        cursor: 'not-allowed',
                                      },
                                    }),
                                    (theme) =>
                                      theme.applyStyles('dark', {
                                        color: theme.palette.common.white,
                                      }),
                                  ]}
                                >
                                  <MessageSquareText />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        error={errors.message ? true : false}
                        helperText={errors.message ? <InputHelperText error={errors.message.message} /> : ''}
                      />
                    )}
                  />
                </Box>
              )}
              <Button
                fullWidth
                variant="contained"
                loading={loading}
                loadingPosition="end"
                color="primary"
                sx={{ mt: 2, textTransform: 'none' }}
                onClick={(e) => (user ? (propertyData?.bookingType == 'request' ? sendBookingRequest() : handelShowPopup('reservePopup')) : actions.openPopup('login', {}))}
              >
                {propertyData?.bookingType == 'request' ? 'Send Booking Request' : 'Reserve'}
              </Button>
            </Box>
          )}
          <Typography mt={1} fontSize={12} color="text.primary" align="center">
            You won't be charged yet
          </Typography>
        </CardContent>
      </Card>

      {/* Small Device Fixed Reservation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: { sm: 'flex', md: 'none' },
          justifyContent: { sm: 'space-between' },
          zIndex: 1200,
          gap: 2,
          px: { xs: 2, md: 4 },
          pt: 1,
          pb: 3,
        }}
      >
        {nights.length > 0 ? (
          <Box>
            <Stack direction={'row'} gap={2}>
              {discountType != 'none' ? (
                <Stack direction={'column'} gap={1}>
                  <Typography color="text.disabled" fontSize={14} sx={{ textDecoration: 'line-through' }}>
                    {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice)}
                  </Typography>
                  <Typography sx={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)} fontSize={14} fontWeight="bold">
                    {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice - totalDiscount)}
                  </Typography>
                </Stack>
              ) : (
                <Typography sx={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)} fontSize={14} fontWeight="bold">
                  {convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice)}
                </Typography>
              )}
              <Typography component="span" fontSize={{ xs: 13, sm: 14 }}>
                {nights.length > 0 ? `for ${nights.length} night${nights.length > 1 ? 's' : ''}` : 'per night'}
              </Typography>
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} gap={2}>
              <Typography fontSize={{ xs: 13, sm: 14 }}>{range?.from && range?.to ? `${format(range.from, 'dd MMM yyyy')} - ${format(range.to, 'dd MMM yyyy')}` : ''}</Typography>
              <Button
                onClick={handleClearDates}
                variant="text"
                size="small"
                sx={{
                  padding: 0,
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
            </Stack>
          </Box>
        ) : (
          <Typography variant="body1" fontWeight={600}>
            {trans('Add dates for prices')}
          </Typography>
        )}

        {!(range?.from && range?.to) ? (
          <Button
            onClick={(event) => (user ? (range?.from && range?.to ? handelShowPopup('reservePopup') : handleCalendarOpen(event)) : actions.openPopup('login', {}))}
            fullWidth={isXs}
            variant="contained"
            color="primary"
            sx={{ mt: 2, textTransform: 'none' }}
          >
            {range?.from && range?.to ? 'Reserve' : 'Check availability'}
          </Button>
        ) : (
          <Box>
            {propertyData?.bookingType == 'request' && (
              <Box mt={2}>
                <Controller
                  name="message"
                  control={control}
                  rules={{
                    required: 'Write your message for host.',
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      label="Ask me anything you want"
                      placeholder="Ask me anything you want"
                      multiline
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconButton
                                size="small"
                                sx={[
                                  (theme) => ({
                                    p: 0.5,
                                    '&.Mui-disabled': {
                                      pointerEvents: 'auto',
                                      cursor: 'not-allowed',
                                    },
                                  }),
                                  (theme) =>
                                    theme.applyStyles('dark', {
                                      color: theme.palette.common.white,
                                    }),
                                ]}
                              >
                                <MessageSquareText />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      error={errors.message ? true : false}
                      helperText={errors.message ? <InputHelperText error={errors.message.message} /> : ''}
                    />
                  )}
                />
              </Box>
            )}
            <Button
              fullWidth
              loading={loading}
              loadingPosition="end"
              variant="contained"
              color="primary"
              sx={{ mt: 2, textTransform: 'none' }}
              onClick={(e) => (user ? (propertyData?.bookingType == 'request' ? sendBookingRequest() : handelShowPopup('reservePopup')) : actions.openPopup('login', {}))}
            >
              {propertyData?.bookingType == 'request' ? 'Send Booking Request' : 'Reserve'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Calendar Popover */}
      <Popover
        open={isCalendarOpen}
        anchorEl={calendarAnchorEl}
        onClose={handleCalendarClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            p: 2,
            mt: 1,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DayPicker
          mode="range"
          numberOfMonths={isXs ? 1 : 2}
          navLayout="around"
          selected={range}
          onSelect={setRange}
          disabled={disableDate}
          excludeDisabled
          min={propertyData?.minimumStay}
          defaultMonth={range?.from ?? new Date()}
          components={{
            DayButton: (props) => <MyCustomDayButton {...props} propertyData={propertyData} range={range} min={propertyData?.minimumStay} />,
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

      {/* Price Details Popover */}
      <Popover
        open={open}
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
                <Typography variant="subtitle2">{convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, data.price)}</Typography>
              </Stack>
            );
          })}

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

          <Divider sx={{ my: 1 }} />
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography variant="subtitle2">{discountType != 'none' ? 'Price after discount' : 'Total'}</Typography>
            <Typography variant="subtitle2">{convertAndFormatToActiveCurrency(propertyData.propertyPrice.currency, totalPrice - totalDiscount)}</Typography>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

export default Reservation;
