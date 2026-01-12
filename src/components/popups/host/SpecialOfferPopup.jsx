import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { getSocket } from '@/lib/socket';
import { formatPrice } from '@/utils/convertAndFormatPrice';
import {
  Box,
  Button,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { format } from 'date-fns';
import { CalendarDays, Minus, Plus, User, X } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Controller, useForm } from 'react-hook-form';
import useSWR from 'swr';

export default function SpecialOfferPopup({ closeModal, showModal, popupData }) {
  console.log('popupData', popupData);
  const { trans } = useTranslation();
  const { guestFee, hostFee } = useReluxRentAppContext();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [nights, setNights] = useState([]);
  const [guestCount, setGuestCount] = useState(popupData?.lastBooking?.guests);
  const [guestMenuAnchorEl, setGuestMenuAnchorEl] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState({});
  console.log('selectedProperty', selectedProperty);
  const [subtotal, setSubtotal] = useState(null);
  const [perNightPrice, setPerNightPrice] = useState(0);
  const [guestTotal, setGuestTotal] = useState(0);
  const [hostTotal, setHostTotal] = useState(0);
  const [guestServiceFee, setGuestServiceFee] = useState(0);
  const [hostServiceFee, setHostServiceFee] = useState(0);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);

  const defaultClassNames = getDefaultClassNames();
  const calenderRef = useRef();

  const { data: properties, isLoading: isPropertiesLoading } = useSWR(`/api/host/properties/${popupData?.lastBooking?.host?.id}`, fetcher);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({});

  useEffect(() => {
    if (properties) {
      const findProperty = properties.find((p) => p.id == popupData?.lastBooking?.property?.id);
      setSelectedProperty(findProperty);
      setValue('propertyId', findProperty.id);
      setValue('cleaningCharge', findProperty.cleaningCharge);
      setValue('extraGuestCharge', findProperty.extraGuestCharge);
      setValue('cancellationPolicyId', findProperty.cancellationPolicy.id);
    }
  }, [properties]);

  useEffect(() => {
    setValue('bookingId', popupData?.lastBooking?.id);
    setValue('price', subtotal);
    setValue('guestFee', guestServiceFee);
    setValue('hostFee', hostServiceFee);
    setValue('totalNight', nights.length);
    setValue('nights', nights);
    setValue('guests', guestCount);
    setValue('conversationBookingId', popupData.conversationBookingId);
  }, [popupData, nights, guestServiceFee, hostServiceFee, subtotal, guestCount]);

  // useEffect(() => {
  //   if (properties && selectedProperty) {
  //     const found = properties.find((p) => p.id === selectedProperty);
  //     setProperty(found || null);
  //   }
  // }, [properties, selectedProperty]);

  useEffect(() => {
    console.log('Range', range);
    if (range.from == undefined || range.to == undefined) {
      setValue('startDate', '');
      setValue('endDate', '');
      return;
    }
    if (range.from) {
      setValue('startDate', range.from);
      setValue('endDate', '');
    }
    if (range.to) {
      setValue('endDate', range.to);
    }
  }, [range]);

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
        const dateWisePriceObj = selectedProperty?.dateWisePrices?.[dateString];

        nights.push({
          date: dateString,
          price: dateWisePriceObj?.price ? parseFloat(dateWisePriceObj.price) : parseFloat(selectedProperty?.propertyPrice?.price),
        });

        curr.setDate(curr.getDate() + 1);
      }

      setNights(nights);
    }
  }, [range]);

  useEffect(() => {
    const subTotal = Number(subtotal);
    console.log('subTotal', subTotal);
    console.log('nights.length', nights.length);

    let perNightPrice = Number((subTotal / nights.length).toFixed(2));

    let guestServiceFee = Number(((subTotal / 100) * guestFee).toFixed(2));

    let hostServiceFee = Number(((subTotal / 100) * hostFee).toFixed(2));

    let guestTotal = Number((subTotal + guestServiceFee).toFixed(2));
    let hostTotal = Number((subTotal + hostServiceFee).toFixed(2));

    setPerNightPrice(perNightPrice);
    setGuestServiceFee(guestServiceFee);
    console.log('guestServiceFee', guestServiceFee);
    setHostServiceFee(hostServiceFee);
    console.log('hostServiceFee', hostServiceFee);
    setGuestTotal(guestTotal);
    setHostTotal(hostTotal);
  }, [nights, subtotal]);

  // Calendar handlers
  const handleCalendarOpen = () => {
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
      if (totalGuests <= selectedProperty?.accommodates) {
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
        <Tooltip open={showTooltip} placement="top" title={`${propertyData.minimumStay} nights minimum`}>
          <button className={`${className}`} {...props}>
            <span className={props.modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
          </button>
        </Tooltip>
      </>
    );
  };

  const bookedDates = new Set(selectedProperty?.bookings?.flatMap((booking) => booking.bookingDates.map((d) => format(new Date(d.date), 'yyyy-MM-dd'))));

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (date < new Date()) return true;
    if (selectedProperty?.dateWisePrices?.[formattedDate]?.status === false) {
      return true;
    }
    if (bookedDates.has(formattedDate)) {
      return true;
    }
    return false;
  };

  const handleDateSelect = (selectedRange) => {
    setRange(selectedRange);
  };

  const onSubmit = async (formData) => {
    console.log('formData', formData);
    try {
      setLoading(true);
      const { data, status } = await api.post(`/api/host/special-offer`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
      const socket = getSocket();
      socket.emit('reservationUpdate', {
        bookingId: data.booking.id,
        conversationBookingId: popupData.conversationBookingId,
        status: 'ACCEPTED',
      });
      closeModal();
    } catch (error) {
      console.error('Error creating property price', error);
    } finally {
      setLoading(false);
    }
  };

  const onSelectedProperty = (propertyId) => {
    const findProperty = properties.find((p) => p.id == propertyId);
    setSelectedProperty(findProperty);
    setValue('propertyId', findProperty.id);
    setValue('cleaningCharge', findProperty.cleaningCharge);
    setValue('extraGuestCharge', findProperty.extraGuestCharge);
    setValue('cancellationPolicyId', findProperty.cancellationPolicy.id);
    setGuestCount({ adults: 1, children: 0, infants: 0 });
    setRange({ from: undefined, to: undefined });
  };

  if (isPropertiesLoading) return null;

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
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} pr={1}>
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>{trans(`  Send ${popupData?.lastBooking?.guest.name} a special offer`)}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={(theme) => ({
            color: theme.palette.text.primary,
          })}
        >
          <X />
        </IconButton>
      </Stack>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {popupData?.lastBooking?.guest.name} will have 24 hours to book. In the meantime, your calendar will remain open.
        </Typography>

        {/* Listing */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Listing
        </Typography>
        <Controller
          name="propertyId"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Select
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onSelectedProperty(e.target.value);
              }}
              fullWidth
              size="small"
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select a listing
              </MenuItem>
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.propertyDescription.name}
                </MenuItem>
              ))}
            </Select>
          )}
        />

        {/* Check-in/Check-out Inputs */}
        <Stack ref={calenderRef} width={'100%'} direction={'row'} gap={2} mt={2}>
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
                variant="outlined"
                value={field.value && format(field.value, 'yyyy-MM-dd')}
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
                variant="outlined"
                value={field.value && format(field.value, 'yyyy-MM-dd')}
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
        {/* Guest Inputs */}
        <Box mt={2}>
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
            , ]
          </Menu>
        </Box>

        {/* Subtotal */}
        <Box mt={2}>
          <FormControl fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount">Subtotal</InputLabel>
            <OutlinedInput
              fullWidth
              label="Subtotal"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              size="small"
              startAdornment={<InputAdornment position="start">{selectedProperty?.propertyPrice?.currency.code}</InputAdornment>}
            />
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            Enter a subtotal that includes any cleaning or extra guest fees. This won't include service fees or applicable taxes.
          </Typography>
        </Box>

        {nights.length > 0 && subtotal > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {trans('Your guest will pay')}
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{nights.length} nights</Typography>
                <Typography variant="body2">{formatPrice(selectedProperty?.propertyPrice?.currency, subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{trans('Sevice fee ')}(guest)</Typography>
                <Typography variant="body2">{formatPrice(selectedProperty?.propertyPrice?.currency, guestServiceFee)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" fontWeight="600">
                  {trans('Total')} ({selectedProperty?.propertyPrice?.currency.code})
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {formatPrice(selectedProperty?.propertyPrice?.currency, guestTotal)}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {trans('Your potential earnings')}
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{nights.length} nights</Typography>
                <Typography variant="body2">{formatPrice(selectedProperty?.propertyPrice?.currency, subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{trans('Sevice fee')} (host)</Typography>
                <Typography variant="body2">{formatPrice(selectedProperty?.propertyPrice?.currency, hostServiceFee)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" fontWeight="600">
                  {trans('Total')} ({selectedProperty?.propertyPrice?.currency.code})
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {formatPrice(selectedProperty?.propertyPrice?.currency, hostTotal)}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <Divider />
      {/* Footer Button */}
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          loading={loading}
          loadingPosition="end"
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
          {trans('Send special offer')}
        </Button>
      </Box>

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
        sx={{
          '& .MuiPopover-paper': {
            p: 2,
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
            onSelect={handleDateSelect}
            disabled={disableDate}
            excludeDisabled
            min={selectedProperty?.minimumStay}
            defaultMonth={range?.from ?? new Date()}
            components={{
              DayButton: (props) => <MyCustomDayButton {...props} propertyData={selectedProperty} range={range} min={selectedProperty?.minimumStay} />,
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
                  backgroundColor: 'transparent',
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
                  backgroundColor: 'transparent',
                },
              }}
            >
              {trans('Close')}
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Dialog>
  );
}
