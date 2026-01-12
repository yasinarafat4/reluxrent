import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { Box, Button, DialogActions, DialogTitle, FormControlLabel, IconButton, Stack, Switch, TextField, Typography, useMediaQuery } from '@mui/material';
import { green, red } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import 'react-day-picker/dist/style.css';
import { Controller, useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';

export default function UpdatePayoutMethodPopup({ closeModal, showModal, popupData }) {
  console.log('UpdatePopupData', popupData);
  const { trans } = useTranslation();
  const { user } = useAuth();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      payoutAmount: '',
    },
  });

  useEffect(() => {
    setValue('isDefault', popupData?.isDefault);
    setValue('payoutAmount', popupData?.payoutAmount);
  }, [popupData]);

  const { data: countriesData = [], isLoading } = useSWR('/api/host/countries', fetcher);

  const onSubmit = async (formData) => {
    console.log('updateFormData', formData);
    try {
      setLoading(true);
      const { data } = await api.put(`/api/host/update-payout-method/${popupData.id}`, formData);
      if (data.status == 'successful') {
        enqueueSnackbar(data.message, { variant: 'success' });
        closeModal();
      }
      mutate('/api/host/payout-methods');
    } catch (error) {
      console.error('Error creating payout method', error);
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
        <DialogTitle>{trans('Update Payment Method')}</DialogTitle>
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
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Method
              </Typography>
              <Typography fontWeight={500}>{popupData.method}</Typography>
            </Box>
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Account Holder
              </Typography>
              <Typography fontWeight={500}>{popupData.accountHolder}</Typography>
            </Box>
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Account Number
              </Typography>
              <Typography fontWeight={500}>{popupData.accNumber}</Typography>
            </Box>
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Bank Name
              </Typography>
              <Typography fontWeight={500}>{popupData.bankName}</Typography>
            </Box>
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Branch Name
              </Typography>
              <Typography fontWeight={500}>{popupData.branchName}</Typography>
            </Box>
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Swift Code
              </Typography>
              <Typography fontWeight={500}>{popupData.swiftCode}</Typography>
            </Box>
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Branch City
              </Typography>
              <Typography fontWeight={500}>{popupData.branchCity}</Typography>
            </Box>
            <Box bgcolor={'divider'} border={'1px solid'} borderColor={'grey.400'} px={1} py={0.5} borderRadius={1}>
              <Typography variant="body1" fontSize={12} color="text.secondary">
                Country
              </Typography>
              <Typography fontWeight={500}>{popupData.country.name}</Typography>
            </Box>

            {/* Payout Amount */}
            <Controller name="payoutAmount" control={control} render={({ field }) => <TextField size="small" label={trans('Payout Amount')} {...field} />} />

            <Controller
              name="isDefault"
              control={control}
              render={({ field }) => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: '4px 2px',
                    bgcolor: field.value ? green[500] : red[500],
                    color: 'white',
                    borderRadius: 12,
                  }}
                >
                  <FormControlLabel
                    control={<Switch size="small" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="default" />}
                    label={
                      <Typography variant="body2" fontSize={14} sx={{ color: 'white' }}>
                        {field.value ? 'Default' : 'Non-default'}
                      </Typography>
                    }
                  />
                </Box>
              )}
            />
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button type="submit" form="payoutForm" variant="contained" color="primary" sx={{ textTransform: 'none' }}>
          {trans('Update')}
        </Button>
        <Button variant="outlined" onClick={closeModal} sx={{ textTransform: 'none' }}>
          {trans('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
