import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, DialogActions, Divider, FormHelperText, IconButton, TextField, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import OtpInput from 'react-otp-input';

export default function OtpPopup({ closeModal, showModal, phoneNumber, sendOtp }) {
  const { trans } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otpResent, setOtpResent] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(null);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [timer, setTimer] = useState(60); // Timer for countdown

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    control,
  } = useForm();

  // Initialize timer immediately on first render
  useEffect(() => {
    // Start countdown from 60 seconds immediately
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prev) => prev - 1); // Decrement every second
      } else {
        setCanResendOtp(true);
      }
    }, 1000);
    return () => clearInterval(interval); // Clean up on unmount
  }, [timer]);

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    await sendOtp(phoneNumber);
    setTimer(60);
    setCanResendOtp(false);
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
    } catch (err) {
      console.error('OTP Verification Failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      sx={{
        zIndex: 9999,
        '& .MuiDialog-paper': {
          width: '100%',
          margin: '10px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'xs'}
      aria-labelledby="otp-dialog"
    >
      <DialogTitle sx={{ fontSize: { xs: '16px', md: '18px' } }} id="responsive-dialog-title">
        {trans('Verify your phone')}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={closeModal}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[700],
        })}
      >
        <X />
      </IconButton>
      <Divider />
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: { xs: 1, sm: 2 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="otp"
            control={control}
            rules={{ validate: (value) => value?.length === 6 || 'Enter full 6-digit OTP' }}
            render={({ field, fieldState }) => (
              <Box display="flex" flexDirection="column" alignItems="center">
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  numInputs={6}
                  renderSeparator={<span>-</span>}
                  renderInput={(props, index) => (
                    <TextField
                      key={index}
                      variant="outlined"
                      slotProps={{
                        htmlInput: { maxLength: 1, style: { textAlign: 'center', fontSize: '1.2rem' }, ...props },
                      }}
                      sx={{ width: { xs: 35, md: 40 }, mx: 0.5 }}
                    />
                  )}
                />
                {fieldState.error && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {fieldState.error.message}
                  </FormHelperText>
                )}
              </Box>
            )}
          />

          {/* Resend OTP */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              {trans('Didn’t get the code?')}{' '}
              {canResendOtp ? (
                <Button variant="text" color="secondary" onClick={handleResendOtp}>
                  {otpResent ? trans('Resending...') : trans('Resend OTP')}
                </Button>
              ) : (
                `${trans('Resend in')} ${timer}s`
              )}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <DialogActions>
            <Button variant="contained" color="primary" fullWidth loading={loading} loadingPosition="start" type="submit">
              {trans('Continue')}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
