import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Box, Button, DialogActions, Divider, FormControl, FormHelperText, Stack, TextField, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MobileStepper from '@mui/material/MobileStepper';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { mutate } from 'swr';

const accessOptions = [
  {
    id: 1,
    value: { manage_listing: true, message_guest: true, manage_calendar: true, manage_co_hosts: true, remove_listing: true },
    title: 'Full access',
    description: 'Manage listing, Message guests, Manage calendar, and Manage co-hosts',
  },
  {
    id: 2,
    value: { manage_listing: true, message_guest: true, manage_calendar: false, manage_co_hosts: false, remove_listing: false },
    title: 'Listing and messaging access',
    description: 'Manage listing and Message guests',
  },
  {
    id: 3,
    value: { manage_listing: true, message_guest: false, manage_calendar: false, manage_co_hosts: false, remove_listing: false },
    title: 'Listing access',
    description: 'Manage listing',
  },
];

const InviteCoHostPopup = ({ showModal, closeModal, popupData }) => {
  console.log('InviteCoHostPopupData', popupData);
  const { trans } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();
  const { id } = router.query;

  const methods = useForm({
    defaultValues: {
      email: '',
      permissions: '',
      action: 'create',
    },
  });

  const {
    trigger,
    setError,
    formState: { isValid, errors },
  } = methods;

  useEffect(() => {
    trigger(); // re-validate when step changes
  }, [activeStep]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);

      if (activeStep === 0) {
        // validate email
        await api.post(`/api/host/property/${id}/validate-cohost`, {
          email: formData.email,
          propertyId: id,
        });

        setActiveStep(1);
        return;
      }

      if (activeStep === 1) {
        console.log('step2FromData', formData);
        setActiveStep(2);
      }

      if (activeStep === 2) {
        console.log('Step 3 response', formData);
        const { data } = await api.put(`/api/host/property/${id}/invite-cohost`, formData);
        mutate(`/api/host/cohosts/${popupData?.id}`);
        enqueueSnackbar(data.message, { variant: 'success' });
        closeModal();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setError('email', {
          type: 'manual',
          message: err.response.data.error,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: trans("Add your co-host's info"), subTitle: trans('Tell guests what makes your property unique and welcoming.'), step: <StepOne /> },
    {
      id: 2,
      title: trans("Set your co-host's permissions"),
      subTitle: trans('You can always change this later.'),
      step: <StepTwo />,
    },
    {
      id: 3,
      title: trans('Review your invite'),
      subTitle: trans('Make sure everything looks good before sending your invite.'),
      step: <StepThree popupData={popupData} />,
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <Dialog
          component="form"
          noValidate
          onSubmit={methods.handleSubmit(onSubmit)}
          sx={{
            zIndex: '99999',
            '& .MuiDialog-paper': {
              width: '100%',
              borderRadius: '10px',
            },
          }}
          disableScrollLock
          open={showModal}
          fullWidth={true}
          maxWidth={'sm'}
          onClose={closeModal}
          aria-labelledby="responsive-dialog-title"
        >
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'start'} p={0}>
            <DialogTitle padding={0}>
              <Typography fontWeight={500} gutterBottom>
                {steps[activeStep].title}
              </Typography>
              <Typography variant="body2" fontSize={14}>
                {steps[activeStep].subTitle}
              </Typography>
            </DialogTitle>
            <Button size="small" aria-label="close" sx={{ p: 0, m: 2, minWidth: 0 }} onClick={closeModal}>
              <X />
            </Button>
          </Stack>
          <Divider />

          <DialogContent>{steps[activeStep].step}</DialogContent>

          <Divider />
          <DialogActions sx={{ width: '100%' }}>
            <MobileStepper
              variant="progress"
              steps={3}
              position="static"
              activeStep={activeStep}
              sx={{ maxWidth: '100%', flexGrow: 1, bgcolor: 'background.primary' }}
              nextButton={
                <Button
                  type="submit"
                  size="small"
                  disabled={!isValid || loading}
                  loading={loading}
                  loadingPosition="end"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    px: 2,
                    textTransform: 'none',
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                      bgcolor: 'grey.600',
                      color: 'grey.100',
                      opacity: 0.7,
                    },
                  }}
                >
                  {activeStep === steps.length - 1 ? trans('Send') : trans('Next')}
                </Button>
              }
              backButton={
                <Button
                  sx={{
                    textTransform: 'none',
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                      opacity: 0.7,
                    },
                  }}
                  size="small"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  disabled={activeStep === 0}
                >
                  {trans('Back')}
                </Button>
              }
            />
          </DialogActions>
        </Dialog>
      </FormProvider>
    </div>
  );
};

export default InviteCoHostPopup;

function StepOne() {
  const { trans } = useTranslation();

  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Box>
      {/* Email Field */}
      <FormControl sx={{ mt: 1 }} fullWidth size="small" margin="normal">
        <Controller
          name="email"
          control={control}
          rules={{
            required: trans('Email is required!'),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: trans('Enter a valid email address'),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              required={true}
              label={trans('Email')}
              fullWidth
              variant="outlined"
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                formHelperText: {
                  sx: { ml: 0 },
                },
                inputLabel: {
                  shrink: true,
                  sx: {
                    fontSize: '0.9rem',
                  },
                },
              }}
            />
          )}
        />

        <FormHelperText sx={{ ml: 0, mt: 1 }}>{trans("Use an address you'll always have access to. We'll email you trip confirmations and receipts.")}</FormHelperText>
      </FormControl>
    </Box>
  );
}

function StepTwo() {
  const { control } = useFormContext();
  return (
    <Box>
      {/* Co-host’s Permissions Options */}
      <Controller
        name="permissions"
        control={control}
        rules={{
          required: 'Please select an access permission',
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 2 },
              }}
            >
              {accessOptions.map((option, i) => {
                // const isSelected = value === option.value;
                const isSelected = JSON.stringify(value) === JSON.stringify(option.value);
                return (
                  <Box
                    key={i}
                    sx={[
                      (theme) => ({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 5 },
                        borderRadius: '10px',
                        padding: { xs: 1.5, sm: theme.spacing(3) },
                        textAlign: 'start',
                        cursor: 'pointer',
                        width: '100%',
                        border: '1px solid',
                        boxShadow: isSelected ? `0 0 0 1px ${theme.palette.common.black}` : 'none',
                        transition: '0.4s',
                        borderColor: isSelected ? theme.palette.common.black : theme.palette.grey[400],
                        bgcolor: isSelected ? theme.palette.grey[100] : theme.palette.common.white,
                        '&:hover': {
                          boxShadow: `0 0 0 1px ${theme.palette.common.black}`,
                          bgcolor: theme.palette.grey[50],
                          borderColor: theme.palette.common.black,
                        },
                      }),
                      (theme) =>
                        theme.applyStyles?.('dark', {
                          boxShadow: isSelected && `0 0 0 1px ${theme.palette.common.white}`,
                          borderColor: isSelected ? theme.palette.common.white : theme.palette.grey[500],
                          bgcolor: isSelected ? theme.palette.common.black : theme.palette.grey[900],
                          '&:hover': {
                            boxShadow: `0 0 0 1px ${theme.palette.common.white}`,
                            bgcolor: theme.palette.grey[900],
                            borderColor: theme.palette.common.white,
                          },
                        }),
                    ]}
                    onClick={() => onChange(option.value)}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {option.title}
                      </Typography>
                      <Typography variant="body2">{option.description}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {error.message}
              </Typography>
            )}
          </>
        )}
      />
    </Box>
  );
}

function StepThree({ popupData }) {
  const { watch } = useFormContext();
  const { trans } = useTranslation();
  // get live form values
  const email = watch('email');
  const permissions = watch('permissions');

  const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Box>
      {/* Review */}
      <Box
        sx={{
          bgcolor: 'background.primary',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {/* Image */}
        <Box sx={{ width: '100%', height: 350, position: 'relative' }}>
          <Image src={popupData?.propertyImages[0]?.image || '/images/placeholders/property_placeholder.jpg'} alt="Room Preview" fill style={{ objectFit: 'cover' }} />
        </Box>

        {/* Details */}
        <Stack gap={2} sx={{ p: 2 }}>
          {/* Listing Name & Location */}
          <Box>
            <Typography fontWeight={600} gutterBottom>
              {popupData?.propertyDescription?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {popupData?.propertyAddress?.addressLine1}
            </Typography>
          </Box>

          {/* Co-host Email */}
          <Box>
            <Typography variant="body1" fontSize={15} fontWeight={500}>
              {trans("Co-host's email")}
            </Typography>
            <Typography variant="body2">{email}</Typography>
          </Box>

          {/* Permissions */}
          <Box>
            <Typography variant="body1" fontSize={15} fontWeight={500}>
              {trans('Permissions')}
            </Typography>
            {Object.entries(permissions || {}).map(([key, value]) => (
              <Box key={key} display="flex" alignItems="center" gap={1}>
                {value ? <Check size={15} color="green" /> : <X size={15} color="red" />}
                <Typography variant="body2" fontSize={13}>
                  {formatLabel(key)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>

        <Divider />

        {/* Footer */}
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            By selecting "Send," you agree to the{' '}
            <Typography variant="body2" sx={{ textDecoration: 'underline', color: 'blue' }} component={Link} href="#">
              Co-Host Terms.
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
