import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Typography } from '@mui/material';
import { MoveLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Payments from './Payments';
import Payouts from './Payouts';

export default function PaymentsPage() {
  const { trans } = useTranslation();
  const router = useRouter();
  const { method } = router.query;
  const { actions } = usePopups();

  return (
    <Box width={'100%'}>
      <Box component={Link} href="/account-settings" color={'text.primary'} sx={{ p: 0, display: { sm: 'none' } }}>
        <MoveLeft size={40} />
      </Box>
      <Typography variant="h4" fontWeight={600}>
        {trans('Payments')}
      </Typography>

      <Box mt={2}>
        <TabContext value={method}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', sm: 'center' } }} mb={1}>
            <TabList
              sx={[
                (theme) => ({
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    transition: 'all 0.3s',
                    '&:not(.Mui-selected)': {
                      color: theme.palette.grey[800],
                    },
                  },
                }),
                (theme) =>
                  theme.applyStyles('dark', {
                    '& .MuiTab-root': {
                      '&:not(.Mui-selected)': {
                        color: theme.palette.grey[400],
                      },
                    },
                  }),
              ]}
            >
              <Tab label="Payments" value="payments" component={Link} href={`account-settings?settingType=payments&method=payments`} sx={{ textTransform: 'none' }} />
              <Tab label="Payouts" value="payouts" component={Link} href={`account-settings?settingType=payments&method=payouts`} sx={{ textTransform: 'none' }} />
            </TabList>
          </Box>

          <TabPanel value="payments" sx={{ p: 1 }}>
            <Payments />
          </TabPanel>

          <TabPanel value="payouts" sx={{ p: 1 }}>
            <Payouts actions={actions} />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
}
