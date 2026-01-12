import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { Autocomplete, Box, Button, DialogActions, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import 'react-day-picker/dist/style.css';
import { Controller, useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';

export default function AddPayoutMethodPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      method: 'Bank',
      bankName: '',
      accountHolder: '',
      accNumber: '',
      swiftCode: '',
      branchName: '',
      branchCity: '',
      country: '',
    },
  });

  const selectedMethod = watch('method');

  const { data: countriesData = [], isLoading } = useSWR('/api/host/countries', fetcher);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data } = await api.post(`/api/host/add-payout-method`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
      mutate('/api/host/payout-methods');
      closeModal();
    } catch (error) {
      console.log('Error creating payout method', error);

      // Handle duplicate (409) error
      if (error.response && error.response.status === 409) {
        enqueueSnackbar(error.response.data.error || 'This payout method already exists.', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar('Failed to add payout method. Please try again.', {
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: 2,
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} borderBottom={'1px solid'} borderColor={'divider'} pr={1}>
        <DialogTitle>{trans('Add Payment Method')}</DialogTitle>
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

      <DialogContent>
        <form id="payoutForm" onSubmit={handleSubmit(onSubmit)}>
          <Box display={'grid'} gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>
            {/* Payout Method */}
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <InputLabel>{trans('Payment method')}</InputLabel>
                  <Select size="small" {...field} label={trans('Payment method *')}>
                    <MenuItem value="Bank">Bank</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            {/* Paypal Fields */}
            {selectedMethod === 'Paypal' && (
              <Controller
                name="email"
                control={control}
                rules={{ required: trans('PayPal Email is required') }}
                render={({ field }) => (
                  <TextField
                    size="small"
                    label={trans('PayPal Email ID *')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...field}
                    slotProps={{
                      formHelperText: {
                        sx: { ml: 0 },
                      },
                    }}
                  />
                )}
              />
            )}

            {/* Bank Fields */}
            {selectedMethod === 'Bank' && (
              <>
                <Controller
                  name="bankName"
                  control={control}
                  rules={{ required: trans('Bank Name is required') }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      label={trans('Bank Name *')}
                      error={!!errors.bankName}
                      helperText={errors.bankName?.message}
                      {...field}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0 },
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="accountHolder"
                  control={control}
                  rules={{ required: trans('Account Holder Name is required') }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      label={trans('Bank Account Holder Name *')}
                      error={!!errors.accountHolder}
                      helperText={errors.accountHolder?.message}
                      {...field}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0 },
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="accNumber"
                  control={control}
                  rules={{ required: trans('Account Number is required') }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      label={trans('Bank Account Number/IBAN *')}
                      error={!!errors.accNumber}
                      helperText={errors.accNumber?.message}
                      {...field}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0 },
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="swiftCode"
                  control={control}
                  rules={{ required: trans('Swift Code is required') }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      label={trans('Swift Code *')}
                      error={!!errors.swiftCode}
                      helperText={errors.swiftCode?.message}
                      {...field}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0 },
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="branchName"
                  control={control}
                  rules={{ required: trans('Branch Name is required') }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      label={trans('Branch Name *')}
                      error={!!errors.branchName}
                      helperText={errors.branchName?.message}
                      {...field}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0 },
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="branchCity"
                  control={control}
                  rules={{ required: trans('Branch City is required') }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      label={trans('Branch City *')}
                      error={!!errors.branchCity}
                      helperText={errors.branchCity?.message}
                      {...field}
                      slotProps={{
                        formHelperText: {
                          sx: { ml: 0 },
                        },
                      }}
                    />
                  )}
                />

                {/* Country */}
                {!isLoading && (
                  <Controller
                    name="country"
                    control={control}
                    rules={{ required: 'Country is required' }}
                    render={({ field, fieldState }) => (
                      <Autocomplete
                        size="small"
                        options={countriesData}
                        autoHighlight
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        value={field.value || null}
                        onChange={(_, data) => {
                          field.onChange(data);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Choose a country *"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            slotProps={{
                              formHelperText: {
                                sx: { ml: 0 },
                              },
                            }}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </>
            )}
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button type="submit" form="payoutForm" variant="contained" color="primary" sx={{ textTransform: 'none' }}>
          {trans('Submit')}
        </Button>
        <Button variant="outlined" onClick={closeModal} sx={{ textTransform: 'none' }}>
          {trans('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
