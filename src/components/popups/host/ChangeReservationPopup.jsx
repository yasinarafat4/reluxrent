import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, IconButton, InputAdornment, Menu, MenuItem, Popover, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { CalendarDays, Minus, Plus, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useForm } from 'react-hook-form';

export default function ChangeReservationPopup({ closeModal, showModal, popupData }) {
  console.log('ReservationPopupProperty', popupData);

  const { trans } = useTranslation();
  const { guestFee, hostFee } = useReluxRentAppContext();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [guest, setGuest] = useState();
  const [nights, setNights] = useState([]);
  const [guestCount, setGuestCount] = useState({ adults: 1, children: 0, infants: 0 });
  const [guestMenuAnchorEl, setGuestMenuAnchorEl] = useState(null);
  const [listing, setListing] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [discountApplied, setDiscountApplied] = useState('none');
  const [dateWiseTotalPrice, setDateWiseTotalPrice] = useState(0);
  const [dateWiseDiscountPrice, setDateWiseDiscountPrice] = useState(0);
  const [weeklyDiscountAmount, setWeeklyDiscountAmount] = useState(0);
  const [monthlyDiscountAmount, setMonthlyDiscountAmount] = useState(0);

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
        const dateWisePriceObj = popupData.property?.dateWisePrices?.[dateString];

        nights.push({
          date: dateString,
          price: dateWisePriceObj?.price ? parseFloat(dateWisePriceObj.price) : parseFloat(popupData.property?.propertyPrice?.price),
        });

        curr.setDate(curr.getDate() + 1);
      }

      setNights(nights);
    }
  }, [range]);

  useEffect(() => {
    let totalPrice = 0;
    let discountTotalPrice = 0;
    let weeklyDiscountAmount = 0;
    let monthlyDiscountAmount = 0;
    setDiscountApplied('none');
    nights.forEach((data, index) => {
      totalPrice += data.price + guestFee;
    });

    const weeklyDiscount = parseFloat(popupData.property?.propertyPrice?.weeklyDiscount) / 100;
    const monthlyDiscount = parseFloat(popupData.property?.propertyPrice?.monthlyDiscount) / 100;

    if (weeklyDiscount && nights.length >= 7) {
      setDiscountApplied('weekly');
      weeklyDiscountAmount = totalPrice * weeklyDiscount;
      discountTotalPrice = totalPrice * (1 - weeklyDiscount);
    }

    if (monthlyDiscount && nights.length >= 30) {
      setDiscountApplied('monthly');
      monthlyDiscountAmount = discountTotalPrice * monthlyDiscount;
      discountTotalPrice = totalPrice * (1 - monthlyDiscount);
    }

    setDateWiseTotalPrice(totalPrice);
    setDateWiseDiscountPrice(discountTotalPrice);
    setWeeklyDiscountAmount(weeklyDiscountAmount);
    setMonthlyDiscountAmount(monthlyDiscountAmount);
  }, [nights, popupData.property]);

  // Calendar handlers
  const handleCalendarOpen = (event) => {
    setCalendarAnchorEl(event.currentTarget);
  };

  const handleCalendarClose = () => {
    setCalendarAnchorEl(null);
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
      if (totalGuests <= popupData.property.accommodates) {
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
          <button className={`${className} room-details-calender`} {...props}>
            <span className={props.modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
          </button>
        </Tooltip>
      </>
    );
  };

  const bookedDates = new Set(popupData.property?.bookings?.flatMap((booking) => booking.bookingDates.map((d) => format(new Date(d.date), 'yyyy-MM-dd'))));

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (date < new Date()) return true;
    if (popupData.property?.dateWisePrices?.[formattedDate]?.status === false) {
      return true;
    }
    if (bookedDates.has(formattedDate)) {
      return true;
    }
    return false;
  };

  console.log('guest', guest);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    console.log('formData', formData);
    // try {
    //   setLoading(true);
    //   const { data, status } = await api.put(`/api/popupData.property?.host/property/${id}/`, formData);
    //   enqueueSnackbar(data.message, { variant: 'success' });
    // } catch (error) {
    //   console.error('Error creating property price', error);
    // } finally {
    //   setLoading(false);
    // }
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
      <Stack direction={'row'} justifyContent={'end'} p={1}>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            color: 'text.primary',
          }}
        >
          <X size={20} />
        </IconButton>
      </Stack>
      <DialogContent>
        <Typography variant="h4" fontWeight={600} mb={1}>
          What do you want to change?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Once you've made the changes, you can send a request to your guest, User, to confirm the updates to your reservation.
        </Typography>

        {/* Reservation Details */}
        <Box mt={2} display={'flex'} flexDirection={'column'} gap={1}>
          <Typography variant="h5" mb={1}>
            Reservation details
          </Typography>
          {/* Check-in/Check-out Inputs */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
            <TextField
              sx={[
                (theme) => ({
                  borderRadius: 1,
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
              label="Check-in"
              placeholder="Check-in"
              value={range?.from ? format(range?.from, 'yyyy-MM-dd') : ''}
              fullWidth
              size="small"
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
            />
            <TextField
              sx={[
                (theme) => ({
                  borderRadius: 1,
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
              label="Checkout"
              placeholder="Checkout"
              value={range?.to ? format(range?.to, 'yyyy-MM-dd') : ''}
              fullWidth
              size="small"
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
            />
          </Box>
          {/* Guest Inputs */}
          <Box>
            <TextField
              fullWidth
              label="Guests"
              sx={[
                (theme) => ({
                  borderRadius: 1,
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
        </Box>

        {/* Guest Charges */}
        <Box mt={2} display={'flex'} flexDirection={'column'} gap={1}>
          <Typography variant="h5">Guest charges</Typography>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} gap={1}>
            <Stack>
              <Typography variant="body1" fontWeight={500}>
                Accommodation cost
              </Typography>
              <Typography variant="body2">$43.00 x 1 night</Typography>
            </Stack>
            <TextField placeholder="Guest charge" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} size="small" />
          </Box>
        </Box>
      </DialogContent>

      {/* Footer Button */}
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&.Mui-disabled': {
              pointerEvents: 'auto',
              cursor: 'not-allowed',
            },
          }}
        >
          {trans('Send request')}
        </Button>
      </Box>

      {/* Calendar Popover */}
      <Popover
        open={isCalendarOpen}
        anchorEl={calendarAnchorEl}
        onClose={handleCalendarClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
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
          min={popupData.property?.minimumStay}
          components={{
            DayButton: (props) => <MyCustomDayButton {...props} propertyData={popupData.property} range={range} min={popupData.property?.minimumStay} />,
          }}
        />
      </Popover>
    </Dialog>
  );
}
