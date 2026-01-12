import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { convertAndFormatToActiveCurrency } from '@/utils/convertAndFormatPrice';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  Pagination,
  Select,
  Stack,
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
import MenuItem from '@mui/material/MenuItem';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Avatar from 'react-avatar';
import useSWR from 'swr';

const EarningsHistory = () => {
  const { trans } = useTranslation();
  const router = useRouter();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const page = Number(router.query.page) || 1;

  const { actions } = usePopups();

  // Filters state
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [listingFilter, setListingFilter] = useState('all');
  const { data: earningsData = [], isLoading: earningsDataLoading } = useSWR(`/api/host/earnings?page=${page}`, fetcher);

  const onDataChange = (e, value) => {
    const url = new URL(window.location.origin + router.asPath);
    url.searchParams.set('page', value);
    router.push(url.pathname + '?' + url.searchParams.toString(), undefined, { shallow: true });
  };

  // pill style for Select/TextField
  const pillSx = {
    minWidth: { xs: 150, sm: 130, md: 150 },
    borderRadius: 9999,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
    '& .MuiSelect-select': { py: 0.75 },
  };

  const maskAccountNumber = (accNumber) => {
    if (!accNumber) return '';
    const str = accNumber.toString();
    if (str.length <= 4) return str;
    return str.slice(0, 3) + '***' + str.slice(-2);
  };

  if (earningsDataLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {trans('Earnings history')}
      </Typography>

      <Box>
        {/* Table */}
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, width: '100%' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} width={'100%'} borderBottom="1px solid" borderColor="divider" gap={2} p={2}>
            {/* Rows Filter and Search */}
            <Stack direction={{ xs: 'row' }} alignItems="center" flexWrap="wrap" gap={2}>
              <TextField
                size="small"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: { xs: '100%', sm: 220, md: 260 }, borderRadius: 9999, '& .MuiOutlinedInput-root': { borderRadius: 9999 } }}
              />
              <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
                {/* All dates */}
                <FormControl size="small">
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    displayEmpty
                    renderValue={(val) => {
                      if (val === 'all') return 'All dates';
                      if (val === 'sep') return 'September';
                      if (val === 'aug') return 'August';
                      if (val === 'jun') return 'June';
                      return 'All dates';
                    }}
                    sx={pillSx}
                  >
                    <MenuItem value="all">All dates</MenuItem>
                    <MenuItem value="sep">September</MenuItem>
                    <MenuItem value="aug">August</MenuItem>
                    <MenuItem value="jun">June</MenuItem>
                  </Select>
                </FormControl>

                {/* All listings */}
                <FormControl size="small">
                  <Select value={listingFilter} onChange={(e) => setListingFilter(e.target.value)} displayEmpty renderValue={(val) => (val === 'all' ? 'All listings' : val)} sx={pillSx}>
                    <MenuItem value="all">All listings</MenuItem>
                    <MenuItem value="Luxury 2BR Studio">Luxury 2BR Studio</MenuItem>
                    <MenuItem value="City Loft">City Loft</MenuItem>
                    <MenuItem value="Beach Bungalow">Beach Bungalow</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            {/* Button */}
            <Button sx={{ textTransform: 'none', borderRadius: '6px', width: { xs: '100%', sm: '140px' } }} variant="outlined" size="small">
              {trans('Get CSV report')}
            </Button>
          </Stack>
          {!earningsDataLoading ? (
            <>
              {!isXs ? (
                // --- Desktop Table View ---
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontWeight={600}>Property</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontWeight={600}>Gross earnings</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontWeight={600}>Adjustments</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontWeight={600}>Service fee</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontWeight={600}>Tax withheld</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontWeight={600}>Total</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontWeight={600}>Payout method</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {earningsData?.data?.map((earning, index) => (
                      <TableRow onClick={() => actions.openPopup('hostBookingDetails', earning?.id)} key={index} hover sx={{ cursor: 'pointer' }}>
                        <TableCell width={'20%'} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Stack direction={'row'} alignItems={'center'} gap={1}>
                            <Box height={'50px'} width={'50px'}>
                              <Avatar
                                src={earning?.property?.propertyImages[0].image}
                                name={earning?.property?.propertyDescription?.name}
                                alt={earning?.property?.propertyDescription?.name}
                                size="50"
                                round="10px"
                              />
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              {earning?.property?.propertyDescription ? earning?.property?.propertyDescription?.name : `Your listing started ${format(earning?.property?.createdAt, 'MMM dd, yyyy')}`}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>{convertAndFormatToActiveCurrency(earning.currency, earning?.totalPrice)}</TableCell>

                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>{convertAndFormatToActiveCurrency(earning.currency, 0)}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>{convertAndFormatToActiveCurrency(earning.currency, earning?.totalHostFee)}</TableCell>

                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>{convertAndFormatToActiveCurrency(earning.currency, 0)}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>{convertAndFormatToActiveCurrency(earning.currency, earning?.totalPrice - earning?.totalHostFee)}</TableCell>
                        {earning?.payment ? (
                          <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                            {earning?.payment?.rawResponse?.card_brand} , {earning?.payment?.rawResponse?.card_issuer}
                            {earning?.payment?.rawResponse?.card_no && ` (${maskAccountNumber(earning?.payment?.rawResponse?.card_no)})`}
                          </TableCell>
                        ) : (
                          <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}> No data</TableCell>
                        )}
                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <ChevronRight />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                // --- Mobile Card View ---
                <Stack gap={2} p={1}>
                  {earningsData?.data?.map((earning, index) => (
                    <Box key={index} p={1} border="1px solid" borderColor="divider" borderRadius={1} onClick={() => actions.openPopup('earningsTableData', earning)} sx={{ cursor: 'pointer' }}>
                      {/* Property Info */}
                      <Stack direction="row" gap={1} alignItems="center">
                        <Box height={'60px'} width={'60px'}>
                          <Avatar
                            src={earning?.property?.propertyImages[0].image}
                            name={earning?.property?.propertyDescription?.name}
                            alt={earning?.property?.propertyDescription?.name}
                            round="10px"
                            size="60px"
                          />
                        </Box>
                        <Box>
                          <Typography fontSize={12} fontWeight={600}>
                            {earning?.property?.propertyDescription?.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Payout method: </strong>
                            {earning?.payment
                              ? `${earning?.payment?.rawResponse?.card_brand}, ${earning?.payment?.rawResponse?.card_issuer} ${
                                  earning?.payment?.rawResponse?.card_no && `(${maskAccountNumber(earning?.payment?.rawResponse?.card_no)})`
                                }`
                              : 'No data'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </>
          ) : null}

          {/* Pagination */}
          <Box display="flex" justifyContent="space-between" alignItems={'center'} p={2} gap={2}>
            <Typography fontWeight={600}>$1,373.52</Typography>

            {earningsData?.data?.length > 0 && <Pagination onChange={onDataChange} page={page} count={earningsData?.pagination?.totalPages} variant="outlined" shape="rounded" />}
          </Box>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default EarningsHistory;
