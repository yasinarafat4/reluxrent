import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Divider, Drawer, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { green, orange, red } from '@mui/material/colors';
import { useState } from 'react';
import {
  ColumnsButton,
  DataTable,
  DateField,
  ExportButton,
  FilterButton,
  List,
  NumberField,
  ReferenceField,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
  useGetOne,
  useRecordContext,
} from 'react-admin';

const rowSx = () => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Apply border styles based on the status
  if (record.status === 'PAID') {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.status === 'PENDING') {
    return {
      ...style,
      borderLeftColor: orange[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (['EXPIRED', 'UNATTEMPTED', 'FAILED', 'CANCELLED'].includes(record.status)) {
    return {
      ...style,
      borderLeftColor: red[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  return style;
};

const UserPaymentActions = () => (
  <TopToolbar>
    <FilterButton />
    <ColumnsButton />
    <ExportButton resource="payments" />
  </TopToolbar>
);

const UserPaymentFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
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

const UserRawPaymentDetailsDrawer = ({ paymentId, setIsDrawerOpen }) => {
  const { data: paymentData, isLoading: paymentDataLoading } = useGetOne('/payments/', { id: paymentId });
  console.log(`RawPaymentDetailsDrawerData of PaymentID - ${paymentId}`, paymentData);
  const [copied, setCopied] = useState(false);

  if (paymentDataLoading) {
    return null;
  }

  const rawResponse = paymentData?.rawResponse || {};
  console.log('PaymentsRawResponse', rawResponse);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box
      sx={{
        py: 5,
        width: { xs: '100vw', sm: 400 },
        mt: { xs: 2, sm: 1 },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Payment Raw Response
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title={copied ? 'Copied!' : 'Copy JSON'}>
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setIsDrawerOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {/* JSON Details */}
      <Stack spacing={1.5} sx={{ px: 2 }}>
        {Object.entries(rawResponse).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary' }}>
              {key}:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                ml: 1,
                wordBreak: 'break-word',
                textAlign: 'right',
                flex: 1,
              }}
            >
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

const UserPayments = () => {
  const [paymentId, setPaymentId] = useState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const record = useRecordContext();

  const userId = record?.id;

  const Table = DataTable;
  const Column = DataTable.Col;

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
    <Box display={'flex'} sx={{ width: '100%' }}>
      <List
        sx={{
          flexGrow: 1,
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
          width: '100%',
          marginRight: isDrawerOpen ? '390px' : 0,
        }}
        resource="payments"
        filter={{ userId: userId }}
        filters={UserPaymentFilters}
        actions={<UserPaymentActions />}
        exporter={exporter}
      >
        <Paper elevation={3}>
          <Table
            bulkActionButtons={false}
            rowSx={rowSx()}
            rowClick={(id) => {
              setPaymentId(id);
              setIsDrawerOpen(true);
              // Disable the default rowClick
              return false;
            }}
          >
            {/* ID */}
            <Column source="id" field={TextField} label="ID" />

            {/* Booking ID */}
            <Column source="bookingId" label="Booking ID">
              <ReferenceField source="bookingId" reference="bookings">
                <TextField source="id" />
              </ReferenceField>
            </Column>

            {/* Transaction ID */}
            <Column source="transactionId" label="Transaction ID" field={TextField} />

            {/* Status  */}
            <Column
              source="status"
              render={(record) => (
                <span
                  style={{
                    color: record.status == 'PAID' ? 'green' : record.status == 'PENDING' ? 'orange' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  {record.status}
                </span>
              )}
              label="Payment Status"
            />

            {/* Amount */}
            <Column source="amount" label="Payment Amount">
              <NumberField source="amount" label="Payment Amount" options={{ style: 'currency', currency: 'BDT' }} />
            </Column>

            {/* Transaction Date */}
            <Column source="transactionDate" label="Transaction Date">
              <DateField
                source="transactionDate"
                showTime
                options={{
                  hourCycle: 'h12',
                }}
              />
            </Column>

            {/* Created At */}
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
        {/* Raw ayment details drawer */}
        <Drawer variant="persistent" open={isDrawerOpen} anchor="right" sx={{ zIndex: 100 }}>
          {paymentId && <UserRawPaymentDetailsDrawer paymentId={paymentId} setIsDrawerOpen={setIsDrawerOpen} />}
        </Drawer>
      </List>
    </Box>
  );
};

export default UserPayments;
