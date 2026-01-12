import { useTranslation } from '@/contexts/TranslationContext';
import LoginForm from '@/pages/login/Partial/LoginForm';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Divider, IconButton, Stack } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { X } from 'lucide-react';

export default function LoginPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: '10px',
          flexDirection: 'column',
          width: '100%',
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
        {trans('Login')}
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
      <DialogContent sx={{ padding: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            bgcolor: 'background.default',
          }}
        >
          <Stack sx={{ p: { xs: 0, md: 3 } }} spacing={2}>
            <LoginForm />
            <Divider>OR</Divider>

            {/* Google Login */}
            <Button onClick={() => (window.location.href = '/api/auth/google')} fullWidth variant="contained" startIcon={<GoogleIcon />} color="inherit">
              {trans('Sign up with Google')}
            </Button>

            {/* Apple Login */}
            <Button onClick={() => (window.location.href = '/api/auth/apple')} fullWidth variant="contained" startIcon={<AppleIcon />} color="inherit">
              {trans(`Sign up with Apple`)}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
