import HostingLayout from '@/components/layout/host/HostingLayout';
import NoDataFound from '@/components/NoDataFound';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import SearchIcon from '@mui/icons-material/Search';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  MenuList,
  Pagination,
  Popover,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format, subMonths } from 'date-fns';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import Avatar from 'react-avatar';
import useSWR from 'swr';

import { useAuth } from '@/contexts/authContext';
import Paper from '@mui/material/Paper';
import { CalendarDays, Eye, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { formatGuestSummary } from '@/utils/formatGuestSummary';
import { addMonths, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subWeeks } from 'date-fns';
const Reservations = () => {
  const { trans } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { type, status, search, startDate, endDate, property } = router.query;
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const isMd = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const page = Number(router.query.page) || 1;
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const { actions } = usePopups();

  // Filters state
  const [selectedListing, setSelectedListing] = useState();
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [month, setMonth] = useState(new Date());

  const calenderPopupRef = useRef();

  const addParam = (key, value) => {
    const newQuery = {
      ...router.query,
      [key]: value,
    };

    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }, // <-- important to avoid full reload
    );
  };

  // pill style for Select/TextField
  const pillSx = {
    width: { xs: '100%', md: 200 },
    borderRadius: 9999,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
    '& .MuiSelect-select': { py: 0.9 },
  };

  const { data: reservationsData = [], isLoading: isReservationsDataLoading } = useSWR(
    `/api/host/reservations?type=${type}&status=${status}&page=${page}&search=${search}&startDate=${startDate}&endDate=${endDate}&property=${property}`,
    fetcher,
  );
  console.log('reservationsData', reservationsData);
  const { data: properties, isLoading: isPropertiesLoading } = useSWR(`/api/host/properties/${user?.id}`, fetcher);
  console.log('properties$$', properties);

  const onDataChange = (e, value) => {
    addParam('page', value);
  };

  const handleCalendarClick = () => {
    setCalendarAnchorEl(calenderPopupRef.current);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const calendarOpen = Boolean(calendarAnchorEl);
  const filterOpen = Boolean(filterAnchorEl);

  const handleClose = () => {
    setCalendarAnchorEl(null);
    setFilterAnchorEl(null);
  };

  const handleDateSelect = (day) => {
    setRange(day);
  };

  // --- Quick Select Handlers ---
  const handleThisWeek = () => {
    const from = startOfWeek(new Date());
    const to = endOfWeek(new Date());
    setRange({ from, to });
    setMonth(from);
  };

  const handleLastWeek = () => {
    const from = startOfWeek(subWeeks(new Date(), 1));
    const to = endOfWeek(subWeeks(new Date(), 1));
    setRange({ from, to });
    setMonth(from);
  };

  const handlePreviousMonth = () => {
    const from = startOfMonth(subMonths(new Date(), 1));
    const to = endOfMonth(subMonths(new Date(), 1));
    setRange({ from, to });
    setMonth(from);
  };

  const handleCurrentMonth = () => {
    const from = startOfMonth(new Date());
    const to = endOfMonth(new Date());
    setRange({ from, to });
    setMonth(from);
  };

  const handleNextMonth = () => {
    const from = startOfMonth(addMonths(new Date(), 1));
    const to = endOfMonth(addMonths(new Date(), 1));
    setRange({ from, to });
    setMonth(from);
  };

  const handleReset = () => {
    setRange({ from: undefined, to: undefined });
  };

  const handleFilterByDate = () => {
    if (range?.from && range?.to) {
      const newQuery = {
        ...router.query,
        startDate: format(range.from, 'MM/dd/yyyy'),
        endDate: format(range.to, 'MM/dd/yyyy'),
      };

      router.push(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }, // <-- important to avoid full reload
      );
    }
    handleClose();
  };

  const onSearchChange = (e) => {
    addParam('search', e.target.value);
  };

  console.log('selectedListing', selectedListing);

  // if (isReservationsDataLoading) return null;
  return (
    <HostingLayout>
      <Box py={1} px={{ xs: 1.5, sm: 3 }}>
        <Box sx={{ width: '100%' }} pb={{ xs: 10, md: 2 }}>
          <TabContext value={type}>
            {/* Tabs */}
            <Box width={'100%'} display={'flex'} justifyContent={'center'} py={2}>
              <TabList
                sx={{
                  display: 'flex',
                  gap: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '999px',
                    minHeight: '32px',
                    minWidth: 'auto',
                    mr: 2,
                    px: 3,
                    py: 1.7,
                    fontSize: 14,
                    transition: 'all 0.3s ease',
                  },
                  '& .Mui-selected': {
                    bgcolor: 'grey.900',
                    color: 'grey.100',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  },
                  '& .MuiTab-root:not(.Mui-selected)': {
                    bgcolor: 'grey.200',
                    color: 'grey.800',
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                <Tab
                  label="Homes"
                  value="home"
                  onClick={() => addParam('type', 'home')}
                  sx={{
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: 'grey.100',
                    },
                  }}
                />
                <Tab
                  label="Experiences"
                  value="experience"
                  onClick={() => addParam('type', 'experience')}
                  sx={{
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: 'grey.100',
                    },
                  }}
                />
              </TabList>
            </Box>
            {/* Sort by Listed/Unlisted */}
            <MenuList
              dense
              disablePadding
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0.5,
                overflowX: 'auto',
              }}
            >
              {['All', 'CONFIRMED', 'PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'].map((s) => {
                const isActive = status === s;

                return (
                  <MenuItem
                    key={s}
                    onClick={() => addParam('status', s)}
                    selected={isActive}
                    sx={{
                      py: 1,
                      px: 2,
                      borderBottom: isActive ? '3px solid' : '3px solid transparent',
                      borderColor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 600 : 500,
                      borderRadius: 0,
                      transition: 'all 0.2s ease',
                      '& .MuiTypography-root': {
                        fontSize: { xs: 12, sm: 13 },
                      },
                      '&:hover': {
                        borderColor: isActive ? 'primary.main' : 'grey.400',
                        backgroundColor: 'transparent',
                        color: 'primary.main',
                      },
                    }}
                  >
                    <ListItemText primary={trans(s)} />
                  </MenuItem>
                );
              })}
            </MenuList>

            <TabPanel value="home" sx={{ p: '1px' }}>
              {/* Table */}
              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0, width: '100%' }}>
                {/* Rows Filter and Search */}
                {!isXs ? (
                  <Stack direction={'row'} justifyContent={'end'} alignItems="center" gap={2} p={1.5}>
                    {/* Search */}
                    <TextField
                      size="small"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => onSearchChange(e)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ width: { xs: '100%', md: 250 }, borderRadius: 9999, '& .MuiOutlinedInput-root': { borderRadius: 9999 } }}
                    />
                    {/* All dates */}
                    <Paper
                      ref={calenderPopupRef}
                      elevation={0}
                      onClick={handleCalendarClick}
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: { xs: '100%', md: 250 },
                      }}
                    >
                      <IconButton sx={{ bgcolor: 'divider', color: 'text.primary', borderRadius: 1, p: 0 }}>
                        <CalendarDays size={20} />
                      </IconButton>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontSize={14}>
                          {range?.from ? format(range.from, 'dd MMM, yyyy') : 'Start date'} - {range?.to ? format(range.to, 'dd MMM, yyyy') : 'End date'}
                        </Typography>
                      </Box>
                    </Paper>

                    {/* All listings */}
                    <FormControl size="small" sx={{ width: 200 }}>
                      <Select
                        fullWidth
                        displayEmpty
                        name="property"
                        value={selectedListing}
                        onChange={(e) => {
                          (setSelectedListing(e.target.value), addParam('property', e.target.value));
                        }}
                        disabled={isPropertiesLoading}
                        renderValue={(val) => {
                          if (isPropertiesLoading) return 'Loading...';
                          if (!val) return 'Select a listing';
                          return properties?.find((p) => p.id === val)?.propertyDescription?.name || val;
                        }}
                        sx={pillSx}
                      >
                        {/* Loading Spinner */}
                        {isPropertiesLoading && (
                          <MenuItem disabled>
                            <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                          </MenuItem>
                        )}

                        {/* Default “All” Option */}
                        {!isPropertiesLoading && <MenuItem value="">All listings</MenuItem>}

                        {/* Dynamically generated property options */}
                        {properties?.map((property) => (
                          <MenuItem key={property.id} value={property.id}>
                            {property.propertyDescription?.name || 'Unnamed Property'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                ) : (
                  <Stack direction={'row'} px={2} py={1} justifyContent={'end'}>
                    <Button variant="contained" onClick={handleFilterClick}>
                      <SlidersHorizontal />
                    </Button>

                    <Popover
                      open={filterOpen}
                      anchorEl={filterAnchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <Stack direction={'column'} justifyContent={'end'} alignItems="center" gap={2} p={1.5}>
                        <TextField
                          size="small"
                          placeholder="Search..."
                          value={search}
                          onChange={(e) => onSearchChange(e)}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{ width: '100%', borderRadius: 9999, '& .MuiOutlinedInput-root': { borderRadius: 9999 } }}
                        />
                        {/* All dates */}
                        <Paper
                          ref={calenderPopupRef}
                          elevation={0}
                          onClick={handleCalendarClick}
                          sx={{
                            py: 1,
                            px: 1.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                          }}
                        >
                          <IconButton sx={{ bgcolor: 'divider', color: 'text.primary', borderRadius: 1, p: 0 }}>
                            <CalendarDays size={20} />
                          </IconButton>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontSize={14}>
                              {range?.from ? format(range.from, 'dd MMM, yyyy') : 'Start date'} - {range?.to ? format(range.to, 'dd MMM, yyyy') : 'End date'}
                            </Typography>
                          </Box>
                        </Paper>

                        {/* All listings */}
                        <FormControl size="small" sx={{ width: '100%' }}>
                          <Select
                            fullWidth
                            displayEmpty
                            name="property"
                            value={selectedListing}
                            onChange={(e) => {
                              (setSelectedListing(e.target.value), addParam('property', e.target.value));
                            }}
                            disabled={isPropertiesLoading}
                            renderValue={(val) => {
                              if (isPropertiesLoading) return 'Loading...';
                              if (!val) return 'Select a listing';
                              return properties?.find((p) => p.id === val)?.propertyDescription?.name || val;
                            }}
                            sx={pillSx}
                          >
                            {/* Loading Spinner */}
                            {isPropertiesLoading && (
                              <MenuItem disabled>
                                <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                              </MenuItem>
                            )}

                            {/* Default “All” Option */}
                            {!isPropertiesLoading && <MenuItem value="">All listings</MenuItem>}

                            {/* Dynamically generated property options */}
                            {properties?.map((property) => (
                              <MenuItem key={property.id} value={property.id}>
                                {property.propertyDescription?.name || 'Unnamed Property'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </Popover>
                  </Stack>
                )}

                <Divider />
                {reservationsData && reservationsData?.data?.length > 0 ? (
                  <>
                    {!isMd ? (
                      // --- Desktop Table View ---
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Property')}
                              </Typography>
                            </TableCell>

                            <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Host Status')}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Booking Date')}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Start - End Dates')}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Booking Type')}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Booking Status')}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Payment Status')}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Booked')}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Confirmation Code')}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography fontSize={14} fontWeight={600}>
                                {trans('Show Details')}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reservationsData.data.map((reservation, i) => (
                            <TableRow key={i}>
                              {/* Property */}
                              <TableCell width={'20%'} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Stack direction={'row'} alignItems={'center'} gap={1}>
                                  <Box height={'50px'} width={'50px'}>
                                    <Avatar
                                      src={reservation?.property?.propertyImages[0]?.image}
                                      name={reservation?.property?.propertyDescription?.name}
                                      alt={reservation?.property?.propertyDescription?.name}
                                      size="50"
                                      round="10px"
                                    />
                                  </Box>
                                  <Box>
                                    {reservation?.property?.propertyDescription?.name ? (
                                      <Typography variant="body2" fontWeight={600}>
                                        {reservation?.property?.propertyDescription?.name}
                                      </Typography>
                                    ) : (
                                      <Typography variant="body2" fontWeight={600}>
                                        Booking started {reservation?.startDate && format(reservation?.startDate, 'dd MMM, yyyy')}
                                      </Typography>
                                    )}
                                    <Stack direction={'row'} gap={0.3} alignItems={'center'}>
                                      <Typography variant="body2" fontSize={{ xs: 13 }} fontWeight={500}>
                                        Guest:{' '}
                                      </Typography>

                                      <Stack direction={'row'} gap={0.5} alignItems={'center'}>
                                        {' '}
                                        <Avatar src={reservation?.guest?.image} name={reservation?.guest?.name} alt={reservation?.guest?.name} round={true} size="15" />{' '}
                                        <Typography variant="body2" fontSize={{ xs: 12 }}>
                                          {reservation?.guest?.name}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                    <Typography variant="body2" fontSize={{ xs: 12 }}>
                                      {formatGuestSummary(reservation?.guests)}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              {/* Host Status */}
                              <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Chip
                                  label={reservation?.guestStatus}
                                  color={'secondary'}
                                  sx={{
                                    height: 25,
                                    pointerEvents: 'none',
                                    '& .MuiChip-label': {
                                      fontSize: '12px',
                                      px: '10px',
                                      py: '0px',
                                      lineHeight: 1.2,
                                    },
                                  }}
                                />
                              </TableCell>

                              {/* Booking Dates */}
                              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}> {reservation?.createdAt && format(reservation?.createdAt, 'dd MMM, yyyy')}</TableCell>
                              {/* Start & End Dates */}
                              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                {' '}
                                {reservation?.startDate && format(reservation?.startDate, 'dd MMM, yyyy')} - {reservation?.endDate && format(reservation?.endDate, 'dd MMM, yyyy')}
                              </TableCell>
                              {/* Booking Type */}
                              <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Chip
                                  label={reservation?.bookingType}
                                  color={
                                    reservation?.bookingType === 'INQUIRY'
                                      ? 'info'
                                      : reservation?.bookingType === 'REQUEST'
                                        ? 'warning'
                                        : reservation?.bookingType === 'BOOKING'
                                          ? 'success'
                                          : 'default'
                                  }
                                  sx={{
                                    height: 25,
                                    pointerEvents: 'none',
                                    '& .MuiChip-label': {
                                      fontSize: '12px',
                                      px: '10px',
                                      py: '0px',
                                      lineHeight: 1.2,
                                    },
                                  }}
                                />
                              </TableCell>
                              {/* Booking Status */}
                              <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Chip
                                  label={reservation.bookingStatus}
                                  color={reservation.bookingStatus == 'CONFIRMED' ? 'info' : reservation.bookingStatus == 'ACCEPTED' ? 'success' : 'error'}
                                  sx={{
                                    height: 25,
                                    pointerEvents: 'none',
                                    '& .MuiChip-label': {
                                      fontSize: '12px',
                                      px: '10px',
                                      py: '0px',
                                      lineHeight: 1.2,
                                    },
                                  }}
                                />
                              </TableCell>
                              {/* Payment Status */}
                              <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Chip
                                  label={reservation.paymentStatus}
                                  color={reservation.paymentStatus == 'PAID' ? 'success' : 'error'}
                                  sx={{
                                    height: 25,
                                    pointerEvents: 'none',
                                    '& .MuiChip-label': {
                                      fontSize: '12px',
                                      px: '10px',
                                      py: '0px',
                                      lineHeight: 1.2,
                                    },
                                  }}
                                />
                              </TableCell>
                              {/* Booked */}
                              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                {reservation?.confirmedAt ? (
                                  format(reservation?.confirmedAt, 'dd MMM, yyyy')
                                ) : (
                                  <Typography color="warning" fontSize={14} fontWeight={500}>
                                    {trans('Not booked yet!')}
                                  </Typography>
                                )}
                              </TableCell>
                              {/* Confirmation Code*/}
                              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                {reservation?.confirmationCode ? (
                                  reservation?.confirmationCode
                                ) : (
                                  <Typography color="warning" fontSize={14} fontWeight={500}>
                                    {trans('Not confirmed yet!')}
                                  </Typography>
                                )}
                              </TableCell>
                              {/* View Details*/}
                              <TableCell align="center" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                <IconButton
                                  component={Link}
                                  href={`/host/reservations/details/${reservation?.id}`}
                                  sx={{
                                    bgcolor: 'primary.main',
                                    color: 'common.white',
                                    p: 1,
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'common.white',
                                    },
                                  }}
                                >
                                  <Eye size={15} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      // --- Mobile Card View ---
                      <Box
                        gap={{ xs: 1, sm: 2 }}
                        m={2}
                        display={'grid'}
                        gridTemplateColumns={{
                          xs: 'repeat(1, minmax(0, 1fr))',
                          sm: 'repeat(2, minmax(0, 1fr))',
                        }}
                      >
                        {reservationsData.data.map((reservation, i) => (
                          <Paper
                            component={Link}
                            href={`/host/reservations/details/${reservation?.id}`}
                            key={i}
                            sx={{ p: { xs: 1, sm: 2 }, borderRadius: 1, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
                          >
                            <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: '10px',
                                  overflow: 'hidden',
                                  position: 'relative',
                                  flexShrink: 0,
                                }}
                              >
                                <Image
                                  src={reservation?.property?.propertyImages[0]?.image}
                                  alt={reservation?.property?.propertyDescription?.name || 'Property Image'}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              </Box>
                              <Box width={'100%'}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {reservation?.property?.propertyDescription?.name}
                                </Typography>
                                {/* Guest Info */}
                                <Stack direction={'row'} gap={0.5} alignItems={'center'}>
                                  <Typography variant="body1" fontSize={{ xs: 12 }} fontWeight={500}>
                                    Guest:{' '}
                                  </Typography>

                                  <Stack direction={'row'} gap={0.5} alignItems={'center'}>
                                    {' '}
                                    <Avatar src={reservation?.guest?.image} name={reservation?.guest?.name} alt={reservation?.guest?.name} round={true} size="15" />{' '}
                                    <Typography variant="body2" fontSize={{ xs: 12 }}>
                                      {reservation?.guest?.name}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                {/* Booking Date */}
                                <Stack direction={'row'} gap={0.5}>
                                  <Typography variant="body1" fontSize={{ xs: 12 }} fontWeight={500}>
                                    Booking Date:{' '}
                                  </Typography>{' '}
                                  <Typography variant="body2" fontSize={{ xs: 12 }}>
                                    {reservation?.createdAt && format(reservation?.createdAt, 'dd MMM, yyyy')}
                                  </Typography>
                                </Stack>
                                {/* Booking Start & End Date  */}
                                <Typography variant="body2" fontSize={{ xs: 12 }}>
                                  {format(reservation?.startDate, 'dd MMM, yyyy')} - {format(reservation?.endDate, 'dd MMM, yyyy')}
                                </Typography>
                                {/* Property Guests */}
                                <Typography variant="body2" fontSize={{ xs: 12 }}>
                                  {formatGuestSummary(reservation?.guests)}
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </>
                ) : (
                  <NoDataFound title={'No booking data available!'} subtitle={'No bookings have been made for this property.'} />
                )}

                {/* Pagination */}
                {reservationsData && reservationsData?.data?.length > 0 && (
                  <Box display="flex" justifyContent="end" p={2}>
                    <Pagination onChange={onDataChange} page={page} count={reservationsData?.pagination?.totalPages} variant="outlined" shape="rounded" />
                  </Box>
                )}
              </TableContainer>
            </TabPanel>

            <TabPanel value="experience" sx={{ p: '1px' }}>
              <Stack gap={2}>
                <NoDataFound title={'No booking data available!'} subtitle={'No bookings have been made for this property.'} />
              </Stack>
            </TabPanel>
          </TabContext>
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
          sx={{
            '& .MuiPopover-paper': {
              p: 2,
              mt: 1,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} gap={3} alignItems={'center'}>
            <Box display={'grid'} gridTemplateColumns={{ xs: 'repeat(2, 1fr)', md: '1fr' }} gap={1}>
              <Button onClick={handleThisWeek} size="small" sx={{ textTransform: 'none' }} variant="contained">
                {trans('This Week')}
              </Button>
              <Button onClick={handleLastWeek} size="small" sx={{ textTransform: 'none' }} variant="contained">
                {trans('Last Week')}
              </Button>
              <Button onClick={handlePreviousMonth} size="small" sx={{ textTransform: 'none' }} variant="contained">
                {trans('Previous Month')}
              </Button>
              <Button onClick={handleCurrentMonth} size="small" sx={{ textTransform: 'none' }} variant="contained">
                {trans('Current Month')}
              </Button>
              <Button onClick={handleNextMonth} size="small" sx={{ textTransform: 'none' }} variant="contained">
                {trans('Next Month')}
              </Button>
              <Button onClick={handleReset} size="small" sx={{ textTransform: 'none' }} variant="contained" color="secondary">
                {trans('Reset')}
              </Button>
              <Button onClick={handleClose} size="small" sx={{ textTransform: 'none' }} variant="outlined">
                {trans('Close')}
              </Button>
            </Box>

            <Box>
              <DayPicker
                mode="range"
                numberOfMonths={isXs ? 1 : 2}
                navLayout="around"
                selected={range}
                onSelect={handleDateSelect}
                excludeDisabled
                month={month}
                onMonthChange={setMonth}
                captionLayout="dropdown"
              />

              <Stack direction={'row'} justifyContent={'end'}>
                <Button
                  disabled={!range?.from && !range?.to}
                  onClick={handleFilterByDate}
                  size="small"
                  variant="contained"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  {trans('Apply Filter')}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Popover>
      </Box>
    </HostingLayout>
  );
};

export default Reservations;
