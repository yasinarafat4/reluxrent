import HostingLayout from '@/components/layout/host/HostingLayout';
import { Container, Stack } from '@mui/material';
import EarningsChart from './EarningsChart';
import EarningsHistory from './EarningsHistory';
import EarningsReport from './EarningsReport';
import PayoutsHistory from './PayoutsHistory';

const Earnings = () => {
  return (
    <HostingLayout>
      <Container maxWidth={'xl'}>
        <Stack gap={7} px={2} pt={2} pb={{ xs: 10, md: 2 }}>
          {/* Earnings Chart */}
          <EarningsChart />

          {/* Earnings Table */}
          <EarningsHistory />

          {/* Earnings Report */}
          <EarningsReport />

          {/* Payouts Table */}
          <PayoutsHistory />
        </Stack>
      </Container>
    </HostingLayout>
  );
};

export default Earnings;
