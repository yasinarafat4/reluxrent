import api from '@/lib/api';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Button, SaveButton, SelectInput, SimpleForm, Toolbar, useGetOne, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const PayoutToolbar = (props) => {
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

const PayoutsDrawer = ({ payoutId, setIsDrawerOpen }) => {
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
        <SimpleForm record={payoutData} sx={{ p: 0 }} toolbar={<PayoutToolbar />}>
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

export default PayoutsDrawer;
