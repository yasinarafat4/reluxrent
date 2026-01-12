import { useTranslation } from '@/contexts/TranslationContext';
import { Button, DialogActions, Divider, IconButton, TextField, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ForgotPasswordPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = (data) => {
    console.log(data);
    setLoading(true);
    try {
    } catch (error) {
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
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle sx={{ fontSize: { xs: '16px', md: '18px' } }} id="responsive-dialog-title">
        {trans('Forgot Password?')}
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {trans('Enter the email address associated with your account, and we’ll send you a link to reset your password.')}
        </Typography>
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^@ ]+@[^@ ]+\.[^@ ]+$/,
                message: 'Enter a valid email',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Enter Email"
                sx={{ width: '100%' }}
                placeholder="you@example.com"
                variant="outlined"
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Divider sx={{ my: 1 }} />
          <DialogActions sx={{ p: 0 }}>
            <Button fullWidth variant="contained" color="primary" sx={{ width: '100%' }} type="submit" loading={loading} loadingPosition="start">
              {trans('Send Reset Link')}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
