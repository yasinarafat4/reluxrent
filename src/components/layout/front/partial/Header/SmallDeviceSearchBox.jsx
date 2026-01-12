import AddressAutocomplete from '@/components/AddressAutocomplete';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, IconButton, Paper, Popover, Stack, Typography, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import { CalendarDays, MapPin, Minus, Plus, Users, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

const SmallDeviceSearchBox = ({ smallDeviceFlatpickrRef, guestCount, updateGuest, setShowSmallDeviceGuestPopup, showSmallDeviceSearch, setShowSmallDeviceSearch }) => {
  const { trans } = useTranslation();
  const router = useRouter();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [guestAnchorEl, setGuestAnchorEl] = useState(null);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [search, setSearch] = useState({
    lat: '',
    lng: '',
    checkin: '',
    checkout: '',
    adults: 0,
    children: 0,
    infants: 0,
  });

  const inputRef = useRef();
  const calenderPopupRef = useRef();
  const guestRef = useRef(null);

  useEffect(() => {
    setSearch((prev) => ({ ...prev, adults: guestCount.adults, children: guestCount.children, infants: guestCount.infants }));
  }, [guestCount]);

  const handleLocationButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCheckInOutClick = () => {
    setCalendarAnchorEl(calenderPopupRef.current);
  };

  const handleGuestClick = (event) => {
    setGuestAnchorEl(event.currentTarget);
  };

  const handleClearDates = () => {
    setRange({ from: undefined, to: undefined });
  };

  const handleClose = () => {
    setCalendarAnchorEl(null);
    setGuestAnchorEl(null);
  };

  const handlePlaceSelect = (place) => {
    console.log('small place', place);
    setSearch((prev) => ({ ...prev, lat: place.location?.lat(), lng: place.location?.lng() }));
  };

  const handleDateSelect = (selectedRange) => {
    setSearch((prev) => ({ ...prev, checkin: format(selectedRange?.from, 'yyyy-MM-dd'), checkout: format(selectedRange?.to, 'yyyy-MM-dd') }));
    setRange(selectedRange);
  };

  const calendarOpen = Boolean(calendarAnchorEl);
  const guestOpen = Boolean(guestAnchorEl);

  const MyCustomDayButton = ({ day, className, ...props }) => {
    return (
      <>
        <button className={`${className} search-box-calender`} {...props}>
          <span className={props.modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
        </button>
      </>
    );
  };

  const onSearchClick = () => {
    const url = new URL(window.location.origin + '/search/homes');
    url.search = ''; // clear existing params

    Object.entries(search).forEach(([key, value]) => {
      if (value === null || value === 'any' || (Array.isArray(value) && value.length === 0)) return;

      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    });

    router.push(url.pathname + '?' + url.searchParams.toString());
  };

  return (
    <Box
      sx={{
        display: { md: 'none' },
        maxHeight: showSmallDeviceSearch ? '100%' : 0,
        visibility: showSmallDeviceSearch ? 'visible' : 'hidden',
        p: showSmallDeviceSearch ? 2 : 0,
        gap: showSmallDeviceSearch ? 2 : 0,
        animation: `${showSmallDeviceSearch ? 'slidedown 0.5s ease forwards' : 'slideup 0.5s ease forwards'}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }} onClick={() => setShowSmallDeviceSearch(false)}>
        <IconButton
          sx={{
            p: 1,
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <X size={20} />
        </IconButton>
      </Box>
      <Stack gap={1}>
        {/* Where */}
        <Paper
          onClick={handleLocationButtonClick}
          elevation={3}
          sx={{
            p: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IconButton sx={{ bgcolor: 'divider', color: 'text.primary', borderRadius: 1, p: 1.5 }}>
            <MapPin size={20} />
          </IconButton>
          <Box position={'relative'}>
            <Typography variant="body1" fontSize={{ xs: 13 }} fontWeight={500}>
              {trans('Where do you want to stay?')}
            </Typography>
            <AddressAutocomplete
              onPlaceSelect={handlePlaceSelect}
              placeholder="Select a place..."
              slotProps={{
                input: {
                  sx: {
                    fontSize: { xs: 12, md: 14 },
                    '&::placeholder': {
                      fontSize: { xs: 12, md: 14 },
                      opacity: 1,
                    },
                    '& .MuiInputBase-input': { p: 0 },
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                  },
                },
              }}
            />
          </Box>
        </Paper>

        {/* Check in/out */}
        <Paper
          ref={calenderPopupRef}
          elevation={3}
          onClick={handleCheckInOutClick}
          sx={{
            p: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IconButton sx={{ bgcolor: 'divider', color: 'text.primary', borderRadius: 1, p: 1.5 }}>
            <CalendarDays size={20} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontSize={{ xs: 13 }} fontWeight={500}>
              {trans('Check In - Check Out')}
            </Typography>
            <Typography variant="body2" fontSize={12}>
              {range?.from ? format(range.from, 'dd MMM, yyyy') : 'Add date'} - {range?.to ? format(range.to, 'dd MMM, yyyy') : 'Add date'}
            </Typography>
          </Box>
        </Paper>

        {/* Guest */}
        <Box sx={{ position: 'relative' }} ref={guestRef}>
          <Paper
            elevation={3}
            onClick={handleGuestClick}
            sx={{
              p: 1,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IconButton sx={{ bgcolor: 'divider', color: 'text.primary', borderRadius: 1, p: 1.5 }}>
              <Users size={20} />
            </IconButton>
            <Box>
              <Typography variant="body1" fontSize={{ xs: 13 }} fontWeight={500}>
                {trans('Guest')}
              </Typography>
              <Typography variant="body2" fontSize={12}>
                {`${guestCount.adults + guestCount.children} Guest${guestCount.adults + guestCount.children > 1 ? 's' : ''} ${guestCount.infants ? `, ${guestCount.infants} Infant${guestCount.infants > 1 ? 's' : ''}` : ''}`}
              </Typography>
            </Box>
          </Paper>
          {/* Guest Popover */}
          <Popover
            open={guestOpen}
            anchorEl={guestAnchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            slotProps={{
              paper: {
                sx: {
                  width: 320,
                  p: 3,
                  borderRadius: 2,
                  mt: 1,
                },
              },
            }}
          >
            {/* Guest selector content */}
            <Box mb={2} pb={2} borderBottom="1px solid" borderColor="divider">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1">{trans('Adults')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trans('Ages 13 or above')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={() => updateGuest('adults', -1)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'common.black',
                      '&.Mui-disabled': {
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    <Minus size={13} />
                  </IconButton>
                  <Typography>{guestCount.adults}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateGuest('adults', 1)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'common.black',
                      '&.Mui-disabled': {
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    <Plus size={13} />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            <Box mb={2} pb={2} borderBottom="1px solid" borderColor="divider">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1">{trans('Children')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trans('Ages 2 - 12')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={() => updateGuest('children', -1)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'common.black',
                      '&.Mui-disabled': {
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    <Minus size={13} />
                  </IconButton>
                  <Typography>{guestCount.children}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateGuest('children', 1)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'common.black',
                      '&.Mui-disabled': {
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    <Plus size={13} />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1">{trans('Infants')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trans('Under 2')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={() => updateGuest('infants', -1)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'common.black',
                      '&.Mui-disabled': {
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    <Minus size={13} />
                  </IconButton>
                  <Typography>{guestCount.infants}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateGuest('infants', 1)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'common.black',
                      '&.Mui-disabled': {
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    <Plus size={13} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Popover>
        </Box>

        {/* Search Button */}
        <Button
          onClick={() => onSearchClick()}
          size="small"
          fullWidth
          variant="contained"
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 'medium',
            textTransform: 'none',
          }}
        >
          {trans('Search')}
        </Button>
      </Stack>

      {/* Calendar Popover */}
      <Popover
        open={calendarOpen}
        anchorEl={calendarAnchorEl}
        onClose={handleClose}
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
        <DayPicker
          mode="range"
          numberOfMonths={isXs ? 1 : 2}
          navLayout="around"
          selected={range}
          onSelect={handleDateSelect}
          disabled={(date) => date < new Date()}
          excludeDisabled
          defaultMonth={range?.from ?? new Date()}
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
            onClick={handleClose}
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
    </Box>
  );
};

export default SmallDeviceSearchBox;
