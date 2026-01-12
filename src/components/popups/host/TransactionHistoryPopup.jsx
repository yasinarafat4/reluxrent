import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { convertAndFormatBookedCurrency } from '@/utils/convertAndFormatPrice';
import { Box, CardContent, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { default as Link } from 'next/link';
import Avatar from 'react-avatar';
import useSWR from 'swr';

export default function TransactionHistoryPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  console.log('THPopupData', popupData);
  const { data: transactionDetailsData, isLoading } = useSWR(`/api/host/transaction-details/${popupData}`, fetcher);
  console.log('transactionDetailsData', transactionDetailsData);

  const maskAccountNumber = (accNumber) => {
    if (!accNumber) return '';
    const str = accNumber.toString();
    if (str.length <= 4) return str;
    return str.slice(0, 3) + '***' + str.slice(-2);
  };

  if (isLoading) {
    <Typography>Loading...</Typography>;
  }

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '8px',
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
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>Transaction History of {transactionDetailsData?.payouts?.user?.name}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            color: 'text.primary',
          }}
        >
          <X />
        </IconButton>
      </Stack>
      <Divider />
      {/* Selected Box */}
      {transactionDetailsData && (
        <DialogContent>
          <Stack
            gap={1.5}
            sx={{
              width: '100%',
            }}
          >
            {/* Payout Amount */}
            <Stack spacing={0.5} textAlign="center" mt={1}>
              <Typography fontWeight={600} fontSize={20}>
                {convertAndFormatBookedCurrency({
                  orderCurrency: transactionDetailsData?.currency,
                  exchangeRateToBase: transactionDetailsData?.exchangeRateToBase,
                  exchangeRatePropertyToBase: transactionDetailsData?.exchangeRatePropertyToBase,
                  price: transactionDetailsData?.totalPrice - transactionDetailsData?.totalHostFee,
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Arriving by {transactionDetailsData?.payouts?.payoutDate && format(transactionDetailsData?.payouts?.payoutDate, 'MMM dd, yyyy')}
              </Typography>
            </Stack>

            {/* Bank Details */}
            <Stack gap={1.5}>
              {transactionDetailsData?.payouts?.payoutMethod && (
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box px={2} py={1.5}>
                    <Typography fontWeight={600} fontSize={14}>
                      {transactionDetailsData?.payouts?.payoutMethod?.method}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      {transactionDetailsData?.payouts?.payoutMethod?.bankName} ({maskAccountNumber(transactionDetailsData?.payouts?.payoutMethod?.accNumber)} )
                    </Typography>
                  </Box>

                  <Divider />

                  <Box px={2} py={1.5}>
                    <Typography fontWeight={600} fontSize={14}>
                      Payout ID
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      {transactionDetailsData?.payouts?.id}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Booking Card */}
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ px: 2, py: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box>
                      <Avatar src={transactionDetailsData?.guest?.image} name={transactionDetailsData?.guest?.name} alt={transactionDetailsData?.guest?.name} size="50" round={true} />
                    </Box>

                    <Stack spacing={0.3} flexGrow={1}>
                      <Typography fontWeight={600} fontSize={14}>
                        {transactionDetailsData?.guest?.name}
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {transactionDetailsData?.startDate && format(transactionDetailsData?.startDate, 'MMM dd, yyyy')} -{' '}
                        {transactionDetailsData?.endDate && format(transactionDetailsData?.endDate, 'MMM dd, yyyy')}
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {transactionDetailsData?.property?.propertyDescription?.name}
                      </Typography>
                    </Stack>
                    <Link href="#">
                      <Typography fontSize={12} color="primary" sx={{ textDecoration: 'underline' }}>
                        {transactionDetailsData?.confirmationCode}
                      </Typography>
                    </Link>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  {/* Price Breakdown */}
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontSize={13}>{transactionDetailsData?.totalNight} nights</Typography>
                      <Typography fontSize={13}>
                        {convertAndFormatBookedCurrency({
                          orderCurrency: transactionDetailsData?.currency,
                          exchangeRateToBase: transactionDetailsData?.exchangeRateToBase,
                          exchangeRatePropertyToBase: transactionDetailsData?.exchangeRatePropertyToBase,
                          price: transactionDetailsData?.totalPrice,
                        })}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontSize={13}>Service fee</Typography>
                      <Typography fontSize={13}>
                        -{' '}
                        {convertAndFormatBookedCurrency({
                          orderCurrency: transactionDetailsData?.currency,
                          exchangeRateToBase: transactionDetailsData?.exchangeRateToBase,
                          exchangeRatePropertyToBase: transactionDetailsData?.exchangeRatePropertyToBase,
                          price: transactionDetailsData?.totalHostFee,
                        })}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={600}>Total</Typography>
                      <Typography fontWeight={600}>
                        {convertAndFormatBookedCurrency({
                          orderCurrency: transactionDetailsData?.currency,
                          exchangeRateToBase: transactionDetailsData?.exchangeRateToBase,
                          exchangeRatePropertyToBase: transactionDetailsData?.exchangeRatePropertyToBase,
                          price: transactionDetailsData?.totalPrice - transactionDetailsData?.totalHostFee,
                        })}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
      )}
    </Dialog>
  );
}
