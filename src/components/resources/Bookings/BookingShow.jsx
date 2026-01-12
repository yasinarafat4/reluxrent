import { Box, Divider, Grid, Paper } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { ListButton, Show, SimpleShowLayout, TopToolbar, useGetList, useRecordContext, useShowContext } from 'react-admin';

import NoDataFound from '@/components/NoDataFound';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { formatPrice } from '@/utils/convertAndFormatPrice';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';

const GuestCounts = () => {
  const { record } = useShowContext();
  if (!record) return null;

  const { guests } = record;
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

const BookingShowActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

const BookingInformations = () => {
  const record = useRecordContext();
  const { defaultCurrency } = useReluxRentAppContext();
  if (!record) {
    return null;
  }

  const { data: paymentsData, isLoading: paymentsDataLoading } = useGetList('payments', {
    filter: { bookingId: record?.id },
  });

  const { data: payoutsData, isLoading: payoutsDataLoading } = useGetList('payouts', {
    filter: { bookingId: record?.id },
  });

  console.log('payoutsData', payoutsData);
  console.log('paymentsData', paymentsData);

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
                {record?.totalDiscount &&
                  <Stack direction="row" gap={0.5}>
                    <Typography fontSize={14} fontWeight={600}>
                      {record?.discountType == 'weekly' ? 'Weekly' : 'Monthly'} Discount:
                    </Typography>
                    <Typography fontSize={14} fontWeight={500}>
                      {formatPrice(defaultCurrency, record?.totalDiscount)}
                    </Typography>
                  </Stack>
                }
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
                  <GuestCounts />
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography fontSize={14} fontWeight={600}>
                    Payment Status:
                  </Typography>
                  <Typography
                    color={record?.paymentStatus == 'PENDING' ? 'orange' : record?.paymentStatus == 'UNATTEMPTED' ? 'info' : record?.paymentStatus == 'PAID' ? 'success' : 'error'}
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
                    color={record?.bookingStatus == 'PENDING' ? 'orange' : record?.bookingStatus == 'ACCEPTED' ? 'info' : record?.bookingStatus == 'CONFIRMED' ? 'success' : 'error'}
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
              {paymentsData.length > 0 ? (
                <>
                  {paymentsData.map((payment, i) => {
                    const response = typeof payment?.rawResponse === 'string' ? JSON.parse(payment?.rawResponse) : payment?.rawResponse;
                    console.log('payment$Data', payment);
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
                            color={payment?.status == 'PENDING' ? 'orange' : payment?.status == 'UNATTEMPTED' ? 'info' : payment?.status == 'PAID' ? 'success' : 'error'}
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
                </>
              ) : (
                <NoDataFound title={'No payment data found!'} />
              )}
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
                          <Typography color={payout?.payoutStatus == 'PENDING' ? 'orange' : 'success'} fontSize={14} fontWeight={600}>
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

const BookingShow = () => {
  return (
    <Show actions={<BookingShowActions />}>
      <SimpleShowLayout>
        <Typography bgcolor={'primary.main'} py={1} color="white" textAlign={'center'} variant="h5" fontWeight={600}>
          Booking Details
        </Typography>
        <BookingInformations />
      </SimpleShowLayout>
    </Show>
  );
};

export default BookingShow;
