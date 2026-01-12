import NoDataFound from '@/components/NoDataFound';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { formatPrice } from '@/utils/convertAndFormatPrice';
import { Box, Card, CardContent, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { blue, green, orange, red } from '@mui/material/colors';
import { format } from 'date-fns';
import { ColumnsButton, DataTable, DateField, ExportButton, FilterButton, FunctionField, List, SearchInput, SelectInput, TextField, TopToolbar, useGetList, useRecordContext } from 'react-admin';

const rowSx = () => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Apply border styles based on the review status
  if (record.bookingStatus === 'ACCEPTED') {
    return {
      ...style,
      borderLeftColor: blue[600],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.bookingStatus === 'CONFIRMED') {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.bookingStatus === 'PENDING') {
    return {
      ...style,
      borderLeftColor: orange[600],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (['DECLINED', 'EXPIRED', 'CANCELLED'].includes(record.bookingStatus)) {
    return {
      ...style,
      borderLeftColor: red[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  return style;
};

const GuestCounts = ({ guests }) => {
  if (!guests) return null;

  const parts = [];

  if (guests.adults) {
    parts.push(`${guests.adults} Adult${guests.adults > 1 ? 's' : ''}`);
  }
  if (guests.children) {
    parts.push(`${guests.children} Child${guests.children > 1 ? 'ren' : ''}`);
  }
  if (guests.infants) {
    parts.push(`${guests.infants} Infant${guests.infants > 1 ? 's' : ''}`);
  }

  return <Typography fontSize={14}>{parts.join(', ')}</Typography>;
};

const ReservationActions = () => (
  <TopToolbar>
    <FilterButton />
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const ReservationPanel = () => {
  const record = useRecordContext();
  const { defaultCurrency } = useReluxRentAppContext();

  const { data: paymentsData, isLoading: paymentsDataLoading } = useGetList('payments', {
    filter: { bookingId: record?.id },
  });

  const { data: payoutsData, isLoading: payoutsDataLoading } = useGetList('payouts', {
    filter: { bookingId: record?.id },
  });

  if (paymentsDataLoading || payoutsDataLoading) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={3}>
          {/* Booking Info */}
          <Grid size={3}>
            <Paper elevation={3} sx={{ p: 1.5, height: '100%' }}>
              <Typography fontSize={15} fontWeight={600}>
                Booking Info
              </Typography>
              <Divider sx={{ my: 1 }} />

              <Stack spacing={1}>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    ID:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {record?.id}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Start Date:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {format(record?.startDate, 'dd-MM-yyyy')}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    End Date:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {format(record?.endDate, 'dd-MM-yyyy')}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Total Night:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {record?.totalNight}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Total Amount:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {formatPrice(defaultCurrency, record?.grandTotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Host Fee:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {formatPrice(defaultCurrency, record?.totalHostFee)}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Guest Fee:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {formatPrice(defaultCurrency, record?.totalGuestFee)}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Cleaning Charge:
                  </Typography>
                  <Typography fontSize={14} fontWeight={500}>
                    {formatPrice(defaultCurrency, record?.cleaningCharge)}
                  </Typography>
                </Stack>
                {record?.confirmedAt && (
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Confirmed Date:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {format(record?.confirmedAt, 'dd-MM-yyyy, hh:mm:ss aa')}
                    </Typography>
                  </Stack>
                )}
                {record?.confirmationCode && (
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Confirmation Code:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {record?.confirmationCode}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Guests:
                  </Typography>
                  <GuestCounts guests={record.guests} />
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Payment Status:
                  </Typography>
                  <Typography
                    color={record?.paymentStatus == 'PENDING' ? 'warning' : record?.paymentStatus == 'UNATTEMPTED' ? 'info' : record?.paymentStatus == 'PAID' ? 'success' : 'error'}
                    fontSize={14}
                    fontWeight={600}
                  >
                    {record?.paymentStatus}
                  </Typography>
                </Stack>

                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Booking Status:
                  </Typography>
                  <Typography
                    color={record?.bookingStatus == 'PENDING' ? 'warning' : record?.bookingStatus == 'ACCEPTED' ? 'info' : record?.bookingStatus == 'CONFIRMED' ? 'success' : 'error'}
                    fontSize={14}
                    fontWeight={600}
                  >
                    {record?.bookingStatus}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* Host & Guest Info */}
          <Grid size={3}>
            <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, height: '100%' }}>
              <Box>
                <Typography fontSize={15} fontWeight={600}>
                  Guest Info:
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                      flexShrink: 0,
                      mb: 0.5,
                    }}
                  >
                    <img src={record?.guest?.image || '/images/placeholders/user-placeholder.jpg'} height={80} width={80} style={{ objectFit: 'cover' }} alt={record?.guest?.name || 'Avatar'} />
                  </Box>
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Name:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {record?.guest?.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Email:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {record?.guest?.email}
                    </Typography>
                  </Stack>
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Phone:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {record?.guest?.phone}
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              <Box>
                <Typography fontSize={15} fontWeight={600}>
                  Host Info:
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                      flexShrink: 0,
                      mb: 0.5,
                    }}
                  >
                    <img src={record?.host?.image || '/images/placeholders/user-placeholder.jpg'} height={80} width={80} style={{ objectFit: 'cover' }} alt={record?.host?.name || 'Avatar'} />
                  </Box>
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Name:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {record?.host?.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Email:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {record?.host?.email}
                    </Typography>
                  </Stack>
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      Phone:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {record?.host?.phone}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Payment Info */}
          <Grid size={3}>
            <Paper elevation={3} sx={{ p: 1.5, height: '100%' }}>
              <Typography fontSize={15} fontWeight={600}>
                Payment Info:
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box>
                {paymentsData.map((payment, i) => {
                  const response = typeof payment?.rawResponse === 'string' ? JSON.parse(payment?.rawResponse) : payment?.rawResponse;
                  console.log('paymentsData', payment);
                  return (
                    <Stack key={i} spacing={0.5} border={'1px solid'} borderColor={'divider'} borderRadius={2} p={1.5}>
                      <Typography fontSize={14}>
                        <strong>Transaction ID:</strong> {payment?.transactionId}
                      </Typography>

                      {response?.card_issuer && (
                        <Typography fontSize={14}>
                          <strong>Card Issuer:</strong> {response?.card_issuer}
                        </Typography>
                      )}
                      {response?.card_issuer_country && (
                        <Typography fontSize={14}>
                          <strong>Card Issuer's Country:</strong> {response?.card_issuer_country}
                        </Typography>
                      )}

                      {response?.amount && (
                        <Typography fontSize={14}>
                          <strong>Amount:</strong> {formatPrice(defaultCurrency, response?.amount)}
                        </Typography>
                      )}

                      <Stack direction={'row'} gap={0.5}>
                        <Typography fontWeight={600} fontSize={14}>
                          Status:
                        </Typography>{' '}
                        <Typography
                          color={payment?.status == 'PENDING' ? 'warning' : payment?.status == 'UNATTEMPTED' ? 'info' : payment?.status == 'PAID' ? 'success' : 'error'}
                          fontWeight={600}
                          fontSize={14}
                        >
                          {' '}
                          {payment?.status}
                        </Typography>
                      </Stack>
                      {response?.tran_date && (
                        <Typography fontSize={14}>
                          <strong>Transaction Date:</strong> {format(response?.tran_date, 'dd-MM-yyyy')}
                        </Typography>
                      )}
                    </Stack>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          {/* Payout Info */}
          <Grid size={3}>
            <Paper elevation={3} sx={{ p: 1.5, height: '100%' }}>
              <Typography fontSize={15} fontWeight={600}>
                Payout Info:
              </Typography>
              <Divider sx={{ my: 1 }} />
              {payoutsData.length > 0 ? (
                <>
                  {payoutsData.map((payout, i) => {
                    return (
                      <Box key={i}>
                        <Stack direction="row" gap={0.5}>
                          <Typography fontSize={14} fontWeight={600}>
                            Amount:
                          </Typography>
                          <Typography fontSize={14} fontWeight={500}>
                            {formatPrice(defaultCurrency, payout?.payoutAmount)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" gap={0.5}>
                          <Typography fontSize={14} fontWeight={600}>
                            Status:
                          </Typography>
                          <Typography color={payout?.payoutStatus == 'PENDING' ? 'error' : 'success'} fontSize={14} fontWeight={600}>
                            {payout?.payoutStatus}
                          </Typography>
                        </Stack>
                        <Stack direction="row" gap={0.5}>
                          <Typography fontSize={14} fontWeight={600}>
                            Est. Payout Date:
                          </Typography>
                          <Typography fontSize={14} fontWeight={500}>
                            {format(payout?.createdAt, 'dd-MM-yyyy')}
                          </Typography>
                        </Stack>
                        {payout?.payoutMethod && (
                          <Stack>
                            <Typography fontSize={14} fontWeight={600}>
                              Payout Method:
                            </Typography>
                            <Box mx={2}>
                              <Typography fontSize={14} fontWeight={500}>
                                Bank Name: {payout?.payoutMethod?.bankName}
                              </Typography>
                              <Typography fontSize={14} fontWeight={500}>
                                Account Holder: {payout?.payoutMethod?.accountHolder}
                              </Typography>
                              <Typography fontSize={14} fontWeight={500}>
                                Account Number: {payout?.payoutMethod?.accNumber}
                              </Typography>
                              <Typography fontSize={14} fontWeight={500}>
                                Branch Name: {payout?.payoutMethod?.branchName}
                              </Typography>
                              <Typography fontSize={14} fontWeight={500}>
                                Branch City: {payout?.payoutMethod?.branchCity}
                              </Typography>
                              <Typography fontSize={14} fontWeight={500}>
                                Swift Code: {payout?.payoutMethod?.swiftCode}
                              </Typography>
                            </Box>
                          </Stack>
                        )}
                      </Box>
                    );
                  })}
                </>
              ) : (
                <NoDataFound title={'No payout data found!'} />
              )}
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ReservationFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="bookingStatus"
    choices={[
      { id: 'PENDING', name: 'PENDING' },
      { id: 'ACCEPTED', name: 'ACCEPTED' },
      { id: 'CONFIRMED', name: 'CONFIRMED' },
      { id: 'DECLINED', name: 'DECLINED' },
      { id: 'EXPIRED', name: 'EXPIRED' },
      { id: 'CANCELLED', name: 'CANCELLED' },
    ]}
    optionText={(choice) => (
      <>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: 4,
            mr: 1,
            display: 'inline-block',
          }}
        />
        {choice.name}
      </>
    )}
  />,

  <SelectInput
    source="paymentStatus"
    choices={[
      { id: 'PENDING', name: 'PENDING' },
      { id: 'PAID', name: 'PAID' },
      { id: 'EXPIRED', name: 'EXPIRED' },
      { id: 'UNATTEMPTED', name: 'UNATTEMPTED' },
      { id: 'FAILED', name: 'FAILED' },
      { id: 'CANCELLED', name: 'CANCELLED' },
    ]}
    optionText={(choice) => (
      <>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: 4,
            mr: 1,
            display: 'inline-block',
          }}
        />
        {choice.name}
      </>
    )}
  />,
];

const UserReservation = () => {
  const record = useRecordContext();
  const userId = record?.id;

  const Table = DataTable;
  const Column = DataTable.Col;

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: [
      'id',
      'propertyId',
      'host',
      'guest',
      'startDate',
      'endDate',
      'guests',
      'totalNight',
      'confirmationCode',
      'confirmedAt',
      'totalPrice',
      'cleaningCharge',
      'totalGuestFee',
      'totalHostFee',
      'totalDiscount',
      'grandTotal',
      'discountType',
      'bookingType',
      'bookingStatus',
      'paymentStatus',
      'payoutStatus',
      'createdAt',
    ],
    ignore: [],
    headers: {
      id: 'Booking Id',
      propertyId: 'Property Id',
      host: 'Host Name',
      guest: 'Guest Name',
      totalNight: 'Total Night',
      confirmationCode: 'Confirmation Code',
      confirmedAt: 'Booked At',
      totalPrice: 'Price',
      cleaningCharge: 'Cleaning Charge',
      totalGuestFee: 'Total Guest Fee',
      totalDiscount: 'Total Discount',
      grandTotal: 'Total Price',
      discountType: 'Discount Type',
      bookingStatus: 'Booking Status',
      paymentStatus: 'Payment Status',
      payoutStatus: 'Payout Status',
      createdAt: 'Created At',
    },
    format: {  totalPrice: '৳#,##0.00', cleaningCharge: '৳#,##0.00', totalGuestFee: '৳#,##0.00', totalHostFee: '৳#,##0.00', totalDiscount: '৳#,##0.00', grandTotal: '৳#,##0.00' },
    columnWidths: {
      totalPrice: 10,
    },
    exportAll: true,
    flatten: {
      host: (value) => value?.name || '', // relational object
      guest: (value) => value?.name || '', // relational object
      guests: (v) => {
        if (!v) return '';
        return `${v.adults || 0} adults, ${v.children || 0} children, ${v.infants || 0} infants`;
      },
    },
  });

  return (
    <List resource="bookings" filter={{ hostId: userId }} filters={ReservationFilters} actions={<ReservationActions />} exporter={exporter}>
      <Paper elevation={3}>
        <Table bulkActionButtons={false} rowSx={rowSx()} rowClick={'expand'} expand={<ReservationPanel />} expandSingle>
          <Column source="id" field={TextField} label="ID" />
          <Column source="bookingType" field={TextField} label="Booking Type" />
          {/* Total Amount */}
          <Column source="totalPrice" label="Total Amount" disableSort={true}>
            <FunctionField source="totalPrice" render={(record) => `${record.currency.symbol} ${record?.grandTotal}`} />
          </Column>

          {/* Booking Status */}
          <Column source="bookingStatus" label="Booking Status">
            <FunctionField
              render={(record) => {
                const status = record.bookingStatus;
                let color = 'default';

                switch (status) {
                  case 'PENDING':
                    color = 'warning';
                    break;
                  case 'ACCEPTED':
                    color = 'info';
                    break;
                  case 'CONFIRMED':
                    color = 'success';
                    break;
                  case 'CANCELLED':
                    color = 'error';
                    break;
                  case 'DECLINED':
                    color = 'error';
                    break;
                  case 'EXPIRED':
                    color = 'error';
                    break;
                  default:
                    color = 'default';
                }

                return <Chip label={status} color={color} size="small" />;
              }}
            />
          </Column>

          {/* Payment Status */}
          <Column source="paymentStatus" field={TextField} label="Payment Status">
            <FunctionField
              render={(record) => {
                const status = record.paymentStatus;
                let color = 'default';

                switch (status) {
                  case 'PENDING':
                    color = 'warning';
                    break;
                  case 'UNATTEMPTED':
                    color = 'info';
                    break;
                  case 'PAID':
                    color = 'success';
                    break;
                  case 'FAILED':
                    color = 'error';
                    break;
                  case 'CANCELLED':
                    color = 'error';
                    break;
                  case 'EXPIRED':
                    color = 'error';
                    break;
                  default:
                    color = 'default';
                }
                return <Chip label={status} color={color} size="small" />;
              }}
            />
          </Column>

          <Column source="createdAt" label="Created At">
            <DateField
              source="createdAt"
              showTime
              options={{
                hourCycle: 'h12',
              }}
            />
          </Column>
        </Table>
      </Paper>
    </List>
  );
};

export default UserReservation;
