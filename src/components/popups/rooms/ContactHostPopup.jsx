import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Avatar, Box, Button, Divider, IconButton, InputAdornment, List, ListItem, ListItemText, Menu, MenuItem, Popover, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { CalendarDays, Minus, Plus, User, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { InputHelperText } from 'react-admin';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Controller, useForm } from 'react-hook-form';

export default function ContactHostPopup({ closeModal, showModal, popupData }) {
  console.log('ContactHostPopupData', popupData);
  const router = useRouter();
  const { trans } = useTranslation();
  const { guestFee, hostFee, activeCurrency, defaultCurrency } = useReluxRentAppContext();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [nights, setNights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guestCount, setGuestCount] = useState({ adults: 1, children: 0, infants: 0 });
  const [guestMenuAnchorEl, setGuestMenuAnchorEl] = useState(null);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);

  const [discountType, setDiscountType] = useState('none');
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalGuestFee, setTotalGuestFee] = useState(0);
  const [totalHostFee, setTotalHostFee] = useState(0);

  const defaultClassNames = getDefaultClassNames();
  const calenderRef = useRef();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    mode: 'all',
  });

  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');

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
        const dateWisePriceObj = popupData?.dateWisePrices?.[dateString];

        nights.push({
          date: dateString,
          price: dateWisePriceObj?.price ? parseFloat(dateWisePriceObj.price) : parseFloat(popupData?.propertyPrice?.price),
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
    nights.forEach((data, index) => {
      totalPrice += data.price;
    });

    const weeklyDiscount = parseFloat(popupData?.propertyPrice?.weeklyDiscount) / 100;
    const monthlyDiscount = parseFloat(popupData?.propertyPrice?.monthlyDiscount) / 100;

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
    console.log('totalPrice', totalPrice);
    setTotalDiscount(totalDiscount);
    setTotalGuestFee(totalGuestFee);
    setTotalHostFee(totalHostFee);
  }, [nights, popupData]);

  useEffect(() => {
    setValue('propertyId', popupData.id);
    setValue('currencyId', activeCurrency.id);
    setValue('hostId', popupData.host.id);
    setValue('guests', guestCount);
    setValue('totalNight', nights.length);
    setValue('discountType', discountType);
    setValue('totalPrice', totalPrice);
    setValue('totalDiscount', totalDiscount);
    setValue('totalGuestFee', totalGuestFee);
    setValue('totalHostFee', totalHostFee);
    setValue('cleaningCharge', popupData.propertyPrice.cleaningFee);
    setValue('extraGuestCharge', popupData.propertyPrice.guestAfterFee);
    setValue('bookingType', 'INQUIRY');
    setValue('cancellationPolicyId', popupData.cancellationPolicy.id);
    setValue('nights', nights);

    if (activeCurrency && defaultCurrency) {
      const exchangeRateToBase = (1 / activeCurrency.exchangeRate) * defaultCurrency?.exchangeRate;
      setValue('exchangeRateToBase', exchangeRateToBase);
      const exchangeRatePropertyToBase = defaultCurrency.exchangeRate / popupData?.propertyPrice?.currency?.exchangeRate;
      setValue('exchangeRatePropertyToBase', exchangeRatePropertyToBase);
    }
  }, [popupData, activeCurrency, guestCount, nights, discountType, totalPrice, totalDiscount, totalGuestFee, totalHostFee]);

  useEffect(() => {
    if (!range) {
      setValue('startDate', '');
      setValue('endDate', '');
      return;
    }
    if (range.from) {
      setValue('startDate', range.from);
      setValue('endDate', '');
      trigger();
    }
    if (range.to) {
      setValue('endDate', range.to);
    }
  }, [range]);

  // Calendar handlers
  const handleCalendarOpen = (event) => {
    setCalendarAnchorEl(calenderRef.current);
  };

  const handleCalendarClose = () => {
    setCalendarAnchorEl(null);
  };

  const handleClearDates = () => {
    setRange({ from: undefined, to: undefined });
    setValue('startDate', '');
    setValue('endDate', '');
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
      if (totalGuests <= popupData.accommodates) {
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

  const MyCustomDayButton = ({ day, selected, popupData, range, min, className, ...props }) => {
    const date = new Date(day.date);
    const from = range?.from ? new Date(range.from) : null;
    if (from) from.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = from ? Math.round((date - from) / (1000 * 60 * 60 * 24)) + 1 : 0;
    const showTooltip = range?.from && !range?.to && !props.modifiers?.disabled && diffDays > 0 && diffDays < min;

    return (
      <>
        <Tooltip open={showTooltip} placement="top" title={`${popupData?.minimumStay} nights minimum`}>
          <button className={`${className}`} {...props}>
            <span className={props.modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
          </button>
        </Tooltip>
      </>
    );
  };

  const bookedDates = new Set(popupData?.bookings?.flatMap((booking) => booking.bookingDates.map((d) => format(new Date(d.date), 'yyyy-MM-dd'))));

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (date < new Date()) return true;
    if (popupData?.dateWisePrices?.[formattedDate]?.status === false) {
      return true;
    }
    if (bookedDates.has(formattedDate)) {
      return true;
    }
    return false;
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.post(`/api/guest/property-inquiry`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
      router.push(`/guest/messages/${data.conversationId}`);
      closeModal();
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.error, { variant: 'error' });
      console.log('Error creating property inquiry', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '15px',
        },
        '& .MuiDialog-content': {
          padding: 0,
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'md'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="start" pl={3} pr={2} py={1.5}>
        <Box display="flex" justifyContent="start" alignItems="center" gap={1}>
          <Avatar src={popupData?.host?.image} alt={popupData?.host?.name} sx={{ width: 50, height: 50 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Contact {popupData?.host?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Typically responds within an hour
            </Typography>
          </Box>
        </Box>
        <IconButton aria-label="close" onClick={closeModal} color="inherit">
          <X />
        </IconButton>
      </Stack>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Stack direction={'row'} alignItems={'center'}>
          {/* Left */}
          <Box>
            {/* Title */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Most travelers ask about
            </Typography>

            {/* Getting there */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                Getting there
              </Typography>
              <List
                sx={{
                  listStyleType: 'disc',
                  pl: 4,
                }}
              >
                {popupData?.amenities?.some((amenity) => amenity.name.toLowerCase().includes('parking')) && (
                  <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText
                      slotProps={{
                        primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                      }}
                      primary={popupData.amenities.find((a) => a.name.toLowerCase().includes('parking'))?.description}
                    />
                  </ListItem>
                )}
                {popupData?.houseRules?.startCheckInTime && popupData?.houseRules?.endCheckInTime && popupData?.houseRules?.checkOutTime && (
                  <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText
                      slotProps={{
                        primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                      }}
                      primary={`Check-in for this home is between ${popupData.houseRules.startCheckInTime} and ${popupData?.houseRules?.endCheckInTime} and checkout is at ${popupData?.houseRules?.checkOutTime}`}
                    />
                  </ListItem>
                )}

                {popupData?.houseRules?.quietHours && (
                  <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText
                      slotProps={{
                        primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                      }}
                      primary={`Quiet time: ${popupData.houseRules.startQuietHoursTime} to ${popupData?.houseRules?.endQuietHoursTime} (please keep noise low)`}
                    />
                  </ListItem>
                )}

                <ListItem sx={{ display: 'list-item', p: 0 }}>
                  <ListItemText
                    slotProps={{
                      primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                    }}
                    primary={`${popupData?.houseRules?.eventsAllowed ? 'Events are allowed' : 'Events are not allowed'}`}
                  />
                </ListItem>

                <ListItem sx={{ display: 'list-item', p: 0 }}>
                  <ListItemText
                    slotProps={{
                      primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                    }}
                    primary={`${popupData?.houseRules?.smokingAllowed ? 'Smoking is allowed' : 'Smoking is not allowed'}`}
                  />
                </ListItem>

                <ListItem sx={{ display: 'list-item', p: 0 }}>
                  <ListItemText
                    slotProps={{
                      primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                    }}
                    primary={`${popupData?.houseRules?.commercialAllowed ? 'Commercial photography and filming are allowed.' : 'Commercial photography and filming are not allowed.'}`}
                  />
                </ListItem>
              </List>
            </Box>

            {/* Price and availability */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                Price and availability
              </Typography>
              <List
                sx={{
                  listStyleType: 'disc',
                  pl: 4,
                }}
              >
                {popupData?.propertyPrice?.weeklyDiscount ? (
                  <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText
                      slotProps={{
                        primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                      }}
                      primary={[`Get ${popupData.propertyPrice.weeklyDiscount}% discount on stays of 7 nights or more`]
                        .filter(Boolean) // remove nulls
                        .join(' ')}
                    />
                  </ListItem>
                ) : null}

                {popupData?.propertyPrice?.monthlyDiscount ? (
                  <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText
                      slotProps={{
                        primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                      }}
                      primary={[`Get ${popupData.propertyPrice.monthlyDiscount}% discount on stays of 28 nights or more`]
                        .filter(Boolean) // remove nulls
                        .join(' ')}
                    />
                  </ListItem>
                ) : null}

                {watchStartDate && watchEndDate && (
                  <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText
                      slotProps={{
                        primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                      }}
                      primary={`${popupData?.host?.name}'s home is available from ${format(watchStartDate, 'd MMM, yyyy')} to ${format(watchEndDate, 'd MMM, yyyy')}. Book soon`}
                    />
                  </ListItem>
                )}

                {popupData?.cancellationPolicy?.description && (
                  <ListItem sx={{ display: 'list-item', p: 0 }}>
                    <ListItemText
                      slotProps={{
                        primary: { sx: { fontSize: { xs: '12px', sm: '14px' } } },
                      }}
                      primary={popupData?.cancellationPolicy?.description}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Box>

          {/* Right Calender */}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Message the host */}
        <Box component="form" width={'100%'} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Still have questions? Message the host
          </Typography>

          {/* Check-in/Check-out & Guest Inputs */}
          <Box display="flex" width={'100%'} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={2}>
            <Stack ref={calenderRef} width={'100%'} direction={'row'} gap={2}>
              <Controller
                name="startDate"
                control={control}
                rules={{
                  required: 'Please select check In Date.',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Check-in"
                    placeholder="Check-in"
                    fullWidth
                    size="small"
                    value={field.value && format(field.value, 'yyyy-MM-dd')}
                    variant="outlined"
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
                              <CalendarDays />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    onClick={handleCalendarOpen}
                    error={errors.startDate ? true : false}
                    helperText={errors.startDate ? <InputHelperText error={errors.startDate.message} /> : ''}
                  />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                rules={{
                  required: 'Please select check Out Date.',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Checkout"
                    placeholder="Checkout"
                    fullWidth
                    size="small"
                    value={field.value && format(field.value, 'yyyy-MM-dd')}
                    variant="outlined"
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
                              <CalendarDays />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    onClick={handleCalendarOpen}
                    error={errors.endDate ? true : false}
                    helperText={errors.endDate ? <InputHelperText error={errors.endDate.message} /> : ''}
                  />
                )}
              />
            </Stack>
            <TextField
              label="Guests"
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
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
              </MenuItem>,

              {/* Children */}
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
              </MenuItem>,

              {/* Infants */}
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
              </MenuItem>,

              <Box textAlign="end" mt={1}>
                <Button size="small" onClick={handleGuestMenuClose}>
                  {trans('Done')}
                </Button>
              </Box>,]
            </Menu>
          </Box>

          <Controller
            name="message"
            control={control}
            rules={{
              required: 'Please add a message.',
            }}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder={`Hi ${popupData?.host?.name}! I'll be visiting...`}
                multiline
                rows={3}
                fullWidth
                sx={{
                  my: 2,
                  '& .MuiInputBase-input': {
                    fontSize: '14px',
                  },
                }}
                error={errors.message}
                helperText={errors.message ? <InputHelperText error={errors.message.message} /> : ''}
              />
            )}
          />

          <Button type="submit" sx={{ textTransform: 'none' }} loading={loading} loadingPosition="end" variant="contained" size="small">
            {trans('Send Message')}
          </Button>
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
              p: { xs: 1, sm: 2 },
              mt: 1,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Box>
            <DayPicker
              classNames={{ root: `${defaultClassNames.root} special-offer-calender` }}
              mode="range"
              numberOfMonths={isXs ? 1 : 2}
              navLayout="around"
              selected={range}
              onSelect={setRange}
              disabled={disableDate}
              excludeDisabled
              min={popupData?.minimumStay}
              defaultMonth={range?.from ?? new Date()}
              components={{
                DayButton: (props) => <MyCustomDayButton {...props} popupData={popupData} range={range} min={popupData?.minimumStay} />,
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
          </Box>
        </Popover>
      </DialogContent>
    </Dialog>
  );
}
