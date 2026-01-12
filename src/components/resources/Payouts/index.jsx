/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, useMediaQuery } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { useState } from 'react';
import { AutocompleteInput, ColumnsButton, ExportButton, List, ReferenceInput, SearchInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import PayoutsDrawer from './PayoutsDrawer';
import PayoutsListDesktop from './PayoutsListDesktop';

const PayoutsListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const PayoutsFilter = [
  <SearchInput source="q" alwaysOn />,
  <ReferenceInput source="userId" reference="users" filter={{ getAll: true }} sort={{ field: 'name', order: 'ASC' }} alwaysOn>
    <AutocompleteInput
      optionText={(choice) =>
        choice?.id // the empty choice is { id: '' }
          ? `${choice.name}`
          : ''
      }
      sx={{ minWidth: 200 }}
    />
  </ReferenceInput>,
];

const PayoutsTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const PayoutsList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const [payoutId, setPayoutId] = useState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'bookingId', 'user', 'currency', 'payoutMethod', 'payoutAmount', 'payoutStatus', 'payoutDate', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Payout Id',
      bookingId: 'Booking Id',
      user: 'User',
      currency: 'Currency',
      payoutAmount: 'payoutAmount',
      payoutDate: 'Payout Date',
      payoutMethod: 'Payout Method',
      payoutStatus: 'Payout Status',
      createdAt: 'Created At',
    },
    format: { payoutAmount: '৳#,##0.00' },
    exportAll: true,
    flatten: {
      user: (value) => value?.name || '',
      currency: (value) => value?.name || '',
      payoutMethod: (v) => {
        if (!v) return '';
        return `Bank Name: ${v.bankName}, Account Holder: ${v.accountHolder}, Account Number: ${v.accNumber}, Branch Name: ${v.branchName}, SWIFT Code: ${v.swiftCode}`;
      },
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <List
        sx={{
          flexGrow: 1,
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
          width: '100%',
          marginRight: isDrawerOpen ? '400px' : 0,
        }}
        filters={PayoutsFilter}
        actions={<PayoutsListActions />}
        title={<PayoutsTitle />}
        exporter={exporter}
      >
        <PayoutsListDesktop setPayoutId={setPayoutId} setIsDrawerOpen={setIsDrawerOpen} />
        {/* Payout drawer */}
        <Drawer variant="persistent" open={isDrawerOpen} anchor="right" sx={{ zIndex: 100 }}>
          {payoutId && <PayoutsDrawer payoutId={payoutId} setIsDrawerOpen={setIsDrawerOpen} />}
        </Drawer>
      </List>
    </Box>
  );
};

export default {
  list: PayoutsList,
};
