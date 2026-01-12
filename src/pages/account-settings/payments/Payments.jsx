import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { format } from 'date-fns';
import useSWR from 'swr';

const Payments = () => {
  const { trans } = useTranslation();

  const { data: paymentsData = [], isLoading } = useSWR('/api/guest/payments', fetcher);
  console.log('paymentsData', paymentsData);

  const maskAccountNumber = (accNumber) => {
    if (!accNumber) return '';
    const str = accNumber.toString();
    if (str.length <= 4) return str;
    return str.slice(0, 3) + '***' + str.slice(-2);
  };

  if (isLoading) {
    return null;
  }
  return (
    <>
      <Stack gap={0.5}>
        <Typography variant="h5" fontWeight={600}>
          {trans('Your payments')}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {trans('Keep track of all your payments and refunds.')}
        </Typography>
      </Stack>
      {paymentsData.length > 0 ? (
        <Table sx={{ mt: 2, border: '1px solid', borderColor: 'divider' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={600}>Status</Typography>
              </TableCell>
              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={600}>Payment Date</Typography>
              </TableCell>
              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={600}>Paid out</Typography>
              </TableCell>
              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={600}>Payment method</Typography>
              </TableCell>
              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={600}>Transactions ID</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentsData.map((data, index) => (
              <TableRow key={index}>
                <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography
                      px={1}
                      textAlign={'center'}
                      borderRadius={1}
                      color="common.white"
                      fontSize={12}
                      py={0.5}
                      bgcolor={data?.payment[0]?.status == 'PENDING' ? 'orange' : data?.payment[0]?.status == 'PAID' ? 'green' : 'red'}
                      fontWeight={500}
                    >
                      {data?.payment[0]?.status}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>{format(data?.payment[0]?.createdAt, 'MMM dd, yyyy')}</TableCell>
                <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  {!data?.payment?.rawResponse ? (
                    <Typography color="error" fontSize={13}>
                      No data found!
                    </Typography>
                  ) : (
                    data?.payment?.rawResponse?.amount
                  )}
                </TableCell>

                {!data?.payment?.rawResponse ? (
                  <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography color="error" fontSize={13}>
                      No data found!
                    </Typography>
                  </TableCell>
                ) : (
                  <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    {data?.payment?.rawResponse?.card_brand}, {data?.payment?.rawResponse?.card_issuer} ({maskAccountNumber(data?.payment?.rawResponse?.card_no)}){' '}
                  </TableCell>
                )}

                <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>{data?.payment[0]?.transactionId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography mt={5} color={'primary.main'}>
          No payments have been made so far!
        </Typography>
      )}
    </>
  );
};

export default Payments;
