import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Edit, Landmark } from 'lucide-react';
import useSWR from 'swr';

const Payouts = ({ actions }) => {
  const { trans } = useTranslation();

  const { data: payoutMethodsData = [], isLoading } = useSWR('/api/host/payout-methods', fetcher);

  const maskAccountNumber = (accNumber) => {
    if (!accNumber) return '';
    const str = accNumber.toString();
    if (str.length <= 4) return str;
    return str.slice(0, 3) + '***' + str.slice(-2);
  };

  if (isLoading) {
    return null;
  }

  console.log('payoutMethodsData', payoutMethodsData);

  return (
    <Box>
      <Stack gap={0.5}>
        <Typography variant="h5" fontWeight={600}>
          {trans("How you'll get paid")}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {trans('Add at least one payout method so we know where to send your money.')}
        </Typography>
      </Stack>

      <Stack gap={2} mt={2}>
        {/* method, email, bankName, accountHolder, accNumber, swiftCode, branchName, branchCity, country */}

        {/* Data */}
        {payoutMethodsData.map((payout, i) => (
          <Stack
            key={i}
            border={'1px solid'}
            borderColor={'divider'}
            p={2}
            borderRadius={1}
            direction={{ xs: 'column-reverse', sm: 'row' }}
            justifyContent={{ xs: 'start', sm: 'space-between' }}
            alignItems={{ xs: 'start', sm: 'center' }}
            gap={0.5}
          >
            <Stack direction={'row'} alignItems={'center'} gap={1}>
              {/* icon */}
              <Landmark size={35} />
              <Box>
                <Stack direction={'row'} alignItems={'start'} gap={0.5}>
                  <Typography variant="body1" fontSize={14} fontWeight={600}>
                    {payout?.method == 'Bank' && 'Bank Account'}
                  </Typography>
                  {payout?.isDefault && (
                    <Typography variant="body2" fontSize={12} fontWeight={500} sx={{ bgcolor: 'divider', color: 'text.primary', px: 1, py: 0.2, borderRadius: 2 }}>
                      {trans('Default')}
                    </Typography>
                  )}
                </Stack>
                <Stack direction={'row'} fontSize={1} gap={1}>
                  <Typography fontSize={14}>{payout?.accountHolder},</Typography>
                  <Typography fontSize={14}>{payout?.bankName}</Typography>
                  <Typography fontSize={14}>( {maskAccountNumber(payout?.accNumber)} )</Typography>
                </Stack>
              </Box>
            </Stack>

            <Button
              onClick={() => actions.openPopup('updatePayoutMethod', payout)}
              size="small"
              sx={{ borderRadius: '4px', textTransform: 'none', p: { xs: 0, sm: 0.5 } }}
              variant="outlined"
              startIcon={<Edit size={15} />}
            >
              {trans('Edit')}
            </Button>
          </Stack>
        ))}

        <Box display={'flex'} justifyContent={'start'}>
          {/* Button */}
          <Button onClick={() => actions.openPopup('addPayoutMethod')} variant="contained" sx={{ textTransform: 'none', borderRadius: 1, width: '180px' }}>
            Set up payouts
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default Payouts;
