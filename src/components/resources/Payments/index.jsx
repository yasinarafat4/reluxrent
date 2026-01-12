/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { AutocompleteInput, ColumnsButton, ExportButton, FilterButton, List, ReferenceInput, SearchInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentsListDesktop from './PaymentsListDesktop';
import RawPaymentDetailsDrawer from './RawPaymentDetailsDrawer';

const PaymentsListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <ExportButton />
    <FilterButton />
  </TopToolbar>
);

const PaymentsFilter = [
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

const PaymentsTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const PaymentsList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'bookingId', 'user', 'transactionId', 'status', 'rawResponse', 'amount', 'transactionDate', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Payment Id',
      bookingId: 'Booking Id',
      user: 'User',
      transactionId: 'Transaction Id',
      status: 'Payment Status',
      amount: 'Amount',
      transactionDate: 'Transaction Date',
      rawResponse: 'Payment Details',
      createdAt: 'Created At',
    },
    format: { amount: '৳#,##0.00' },
    columnWidths: {
      amount: 20,
    },
    exportAll: true,
    flatten: {
      user: (value) => value?.name || '',
      rawResponse: (v) => {
        if (!v) return '';
        return `Card Issuer: ${v.card_issuer}, Status: ${v.status}`;
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
          marginRight: isDrawerOpen ? '410px' : 0,
        }}
        filters={PaymentsFilter}
        actions={<PaymentsListActions />}
        title={<PaymentsTitle />}
        exporter={exporter}
      >
        <PaymentsListDesktop setPaymentId={setPaymentId} setIsDrawerOpen={setIsDrawerOpen} />
        {/* Raw ayment details drawer */}
        <Drawer variant="persistent" open={isDrawerOpen} anchor="right" sx={{ zIndex: 100 }}>
          {paymentId && <RawPaymentDetailsDrawer paymentId={paymentId} setIsDrawerOpen={setIsDrawerOpen} />}
        </Drawer>
      </List>
    </Box>
  );
};

export default {
  list: PaymentsList,
};
