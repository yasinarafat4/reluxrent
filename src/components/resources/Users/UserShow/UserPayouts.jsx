import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import api from '@/lib/api';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TableCell, TableFooter, TableRow, Typography } from '@mui/material';
import { green, orange } from '@mui/material/colors';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
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
  SaveButton,
  SearchInput,
  SelectInput,
  SimpleForm,
  TextField,
  TopToolbar,
  useDataTableDataContext,
  useGetOne,
  useNotify,
  useRecordContext,
  useRefresh,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';

const rowSx = () => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Apply border styles based on the review status
  if (record.payoutStatus === 'SENT') {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.payoutStatus === 'PENDING') {
    return {
      ...style,
      borderLeftColor: orange[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  return style;
};

const UserPayoutToolbar = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { handleSubmit } = useFormContext();
  const [openConfirm, setOpenConfirm] = useState(false);

  if (!record) return null;

  const handlePayClick = (e) => {
    e.preventDefault();
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    setOpenConfirm(false);
    handleSubmit(async (values) => {
      const { data } = await api.put(`/api/payouts/${record.id}`, { payoutStatus: values.payoutStatus, userId: values.userId });
      notify('Payout status updated successfully', { type: 'success' });
      refresh();
    })();
  };

  const handleCancel = () => {
    setOpenConfirm(false);
  };

  return (
    <Toolbar
      disableGutters
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        minHeight: { sm: '64px' },
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        px: 1,
      }}
    >
      <>
        <SaveButton type="button" alwaysEnable onClick={handlePayClick} />

        {/* Confirmation Dialog */}
        <Dialog open={openConfirm} onClose={handleCancel}>
          <DialogTitle>Change Status</DialogTitle>
          <DialogContent>Are you sure you want to change this payout status?</DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="inherit">
              No
            </Button>
            <Button onClick={handleConfirm} variant="contained" color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </Toolbar>
  );
};

const UserPayoutActions = () => (
  <TopToolbar>
    <FilterButton />
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const UserPayoutFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="payoutStatus"
    choices={[
      { id: 'PENDING', name: 'PENDING' },
      { id: 'SENT', name: 'SENT' },
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

const UserPayoutTableFoot = () => {
  const data = useDataTableDataContext();
  console.log('Foot data', data);

  const totalPaid = data.reduce((sum, r) => sum + (r.payoutStatus === 'SENT' ? r.payoutAmount || 0 : 0), 0);
  const totalDue = data.reduce((sum, r) => sum + (r.payoutStatus === 'PENDING' ? r.payoutAmount || 0 : 0), 0);
  return (
    <TableFooter
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TableRow>
        <TableCell
          variant="footer"
          sx={{
            px: 3,
          }}
        >
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" fontSize={13}>
              <strong>Total Paid:</strong>৳ {totalPaid}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              <strong>Total Due:</strong> ৳ {totalDue}
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

const UserPayoutsDrawer = ({ payoutId, setIsDrawerOpen }) => {
  const { data: payoutData, isLoading: payoutDataLoading } = useGetOne('payouts', { id: payoutId });
  console.log('UserPayoutsDrawerData', payoutData);

  if (payoutDataLoading) {
    return null;
  }

  return (
    <Box
      sx={{
        pt: 5,
        width: { xs: '100vw', sm: 400 },
        mt: { xs: 2, sm: 1 },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Pay Due Amount
        </Typography>
        <IconButton onClick={() => setIsDrawerOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Payout Summary */}
      <Stack spacing={1.5} sx={{ px: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Payout Summary
        </Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            <strong>Date:</strong>
          </Typography>
          <Typography variant="body2">{payoutData?.payoutDate ? new Date(payoutData.payoutDate).toLocaleDateString() : '—'}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            <strong>Status:</strong>
          </Typography>
          <Typography variant="body2" fontWeight={600} color={payoutData?.payoutStatus === 'SENT' ? 'success.main' : 'orange'}>
            {payoutData?.payoutStatus || '—'}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            <strong>Amount:</strong>
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            ৳ {payoutData?.payoutAmount ?? 0}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Payout Method Info */}
      <Stack spacing={1} sx={{ px: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Payout Method
        </Typography>
        {payoutData?.payoutMethod ? (
          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>Method:</strong> {payoutData.payoutMethod.method || '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Bank Name:</strong> {payoutData.payoutMethod.bankName || '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Account Holder:</strong> {payoutData.payoutMethod.accountHolder || '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Account Number:</strong> {payoutData.payoutMethod.accNumber || '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Swift Code:</strong> {payoutData.payoutMethod.swiftCode || '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Branch Name:</strong> {payoutData.payoutMethod.branchName || '—'}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No payout method linked
          </Typography>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Form Section */}
      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          Update Payout
        </Typography>
        <SimpleForm record={payoutData} sx={{ p: 0 }} toolbar={<UserPayoutToolbar />}>
          <SelectInput
            source="payoutStatus"
            choices={[
              { id: 'PENDING', name: 'PENDING' },
              { id: 'SENT', name: 'SENT' },
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
          />
        </SimpleForm>
      </Box>
    </Box>
  );
};

const UserPayouts = () => {
  const record = useRecordContext();
  const [payoutId, setPayoutId] = useState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const userId = record?.id;

  const Table = DataTable;
  const Column = DataTable.Col;

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
    <Box display={'flex'} sx={{ width: '100%' }}>
      <List
        resource="payouts"
        filter={{ userId: userId }}
        filters={UserPayoutFilters}
        actions={<UserPayoutActions />}
        exporter={exporter}
        sx={{
          flexGrow: 1,
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
          width: '100%',
          marginRight: isDrawerOpen ? '390px' : 0,
        }}
      >
        <Paper elevation={3}>
          <Table
            bulkActionButtons={false}
            foot={UserPayoutTableFoot}
            rowSx={rowSx()}
            rowClick={(id) => {
              setPayoutId(id);
              setIsDrawerOpen(true);
              // Disable the default rowClick
              return false;
            }}
            sx={{
              '& .RaDataTable-thead': {
                borderLeftColor: 'transparent',
                borderLeftWidth: 5,
                borderLeftStyle: 'solid',
              },
              width: '100%',
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

            {/* Currency */}
            <Column source="currencyId" label="Currency">
              <ReferenceField source="currencyId" reference="currencies">
                <TextField source="name" />
              </ReferenceField>
            </Column>

            {/* Payout Amount */}
            <Column source="payoutAmount">
              <NumberField source="payoutAmount" label="Payout Amount" options={{ style: 'currency', currency: 'BDT' }} />
            </Column>

            {/* Payout Status */}
            <Column
              source="payoutStatus"
              render={(record) => (
                <span
                  style={{
                    color: record.payoutStatus == 'SENT' ? 'green' : 'orange',
                    fontWeight: 'bold',
                  }}
                >
                  {record.payoutStatus}
                </span>
              )}
              label="Payout Status"
            />

            {/* Payout Date */}
            <Column source="payoutDate" label="Payout Date">
              <DateField source="payoutDate" />
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
        {/* Payout drawer */}
        <Drawer variant="persistent" open={isDrawerOpen} anchor="right" sx={{ zIndex: 100 }}>
          {payoutId && <UserPayoutsDrawer payoutId={payoutId} setIsDrawerOpen={setIsDrawerOpen} />}
        </Drawer>
      </List>
    </Box>
  );
};

export default UserPayouts;
