// export default LargeSearchBox;
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, IconButton, Paper, Popover, Stack, Typography, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import { Minus, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

const LargeSearchBox = ({ activeTab, guestCount, updateGuest }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const router = useRouter();
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [guestAnchorEl, setGuestAnchorEl] = useState(null);
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [activeDateField, setActiveDateField] = useState(null);

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
  const guestRef = useRef(null);
  const calenderPopupRef = useRef();

  useEffect(() => {
    setSearch((prev) => ({ ...prev, adults: guestCount.adults, children: guestCount.children, infants: guestCount.infants }));
  }, [guestCount]);

  const handleLocationButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCheckinClick = () => {
    setActiveDateField('checkin');
    setCalendarAnchorEl(calenderPopupRef.current);
  };

  const handleCheckoutClick = () => {
    setActiveDateField('checkout');
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
    console.log('large place', place);
    setSearch((prev) => ({ ...prev, lat: place.location?.lat(), lng: place.location?.lng() }));
  };

  const calendarOpen = Boolean(calendarAnchorEl);
  const guestOpen = Boolean(guestAnchorEl);

  // const handleDateSelect = (selectedDate) => {
  //   console.log('selectedDate', selectedDate);

  //   if (activeDateField === 'checkin') {
  //     // Set only check-in date
  //     setRange({ from: selectedDate, to: undefined });
  //     setSearch((prev) => ({
  //       ...prev,
  //       checkin: format(selectedDate, 'yyyy-MM-dd'),
  //       checkout: '',
  //     }));
  //     setActiveDateField('checkout'); // move to checkout step
  //   } else if (activeDateField === 'checkout') {
  //     // Set checkout date only if after checkin
  //     if (range.from && selectedDate > range.from) {
  //       setRange({ ...range, to: selectedDate });
  //       setSearch((prev) => ({
  //         ...prev,
  //         checkout: format(selectedDate, 'yyyy-MM-dd'),
  //       }));
  //     }
  //   }
  // };
  const handleDateSelect = (selectedRange) => {
    setSearch((prev) => ({ ...prev, checkin: format(selectedRange?.from, 'yyyy-MM-dd'), checkout: format(selectedRange?.to, 'yyyy-MM-dd') }));
    setRange(selectedRange);
  };

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
    <Box sx={{ position: 'relative', zIndex: 40, pb: 2 }}>
      {/* Search Box */}
      <Box display="flex" justifyContent="center">
        <Paper
          elevation={3}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '9999px',
          }}
        >
          <Stack direction={'row'} alignItems={'center'} position={'relative'}>
            {/* Location */}
            <Button
              onClick={handleLocationButtonClick}
              disableRipple
              sx={{
                width: 250,
                borderRight: '1px solid',
                borderColor: 'divider',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                  borderRadius: '9999px',
                },
                cursor: 'pointer',
              }}
            >
              <Box textAlign="left" position={'relative'}>
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {trans('Location')}
                </Typography>
                <AddressAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Select a place..."
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: 14,
                        '&::placeholder': {
                          fontSize: 14,
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
            </Button>

            <Box ref={calenderPopupRef}>
              {/* Check In */}
              <Button
                onClick={handleCheckinClick}
                sx={{
                  width: 170,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                    borderRadius: '9999px',
                  },
                  cursor: 'pointer',
                }}
              >
                <Box textAlign="left">
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {trans('Check In')}
                  </Typography>
                  <Typography fontSize={14}>{range?.from ? format(range.from, 'dd MMM, yyyy') : 'Add date'}</Typography>
                </Box>
              </Button>

              {/* Check Out */}
              <Button
                onClick={handleCheckoutClick}
                sx={{
                  width: activeTab === 'Homes' ? 170 : 220,
                  borderRight: activeTab === 'Homes' && '1px solid',
                  borderColor: 'divider',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                    borderRadius: '9999px',
                  },
                  cursor: 'pointer',
                }}
              >
                <Box textAlign="left">
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {trans('Check Out')}
                  </Typography>
                  <Typography fontSize={14}>{range?.to ? format(range.to, 'dd MMM, yyyy') : 'Add date'}</Typography>
                </Box>
              </Button>
            </Box>

            {activeTab === 'Homes' && (
              <Box position="relative" ref={guestRef}>
                <Box display="flex" alignItems="center">
                  <Button
                    onClick={handleGuestClick}
                    disableRipple
                    sx={{
                      width: 250,
                      textTransform: 'none',
                      borderRadius: '9999px',
                      '&:hover': {
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                      },
                      cursor: 'pointer',
                    }}
                  >
                    <Box textAlign="left">
                      <Typography variant="body2" fontWeight="medium" color="text.primary">
                        {trans('Guest')}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" color="text.primary">
                        {`${guestCount.adults + guestCount.children} Guest${guestCount.adults + guestCount.children > 1 ? 's' : ''} ${guestCount.infants ? `, ${guestCount.infants} Infant${guestCount.infants > 1 ? 's' : ''}` : ''}`}
                      </Typography>
                    </Box>
                  </Button>
                </Box>

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
            )}

            <IconButton
              onClick={() => onSearchClick()}
              sx={{
                right: 10,
                p: 1.5,
                position: 'absolute',

                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
              color="primary"
            >
              <Search color="white" size={20} />
            </IconButton>
          </Stack>
        </Paper>
      </Box>

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
        slotProps={{
          paper: {
            sx: {
              minWidth: 650,
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
          onSelect={handleDateSelect}
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

export default LargeSearchBox;
