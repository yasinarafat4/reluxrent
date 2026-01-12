import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, Divider, Typography } from '@mui/material';
import { MoveLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginAndSecurity({ sessionUser }) {
  const { trans } = useTranslation();
  const connectedApple = false;
  const connectedGoogle = true;
  return (
    <Box width={'100%'}>
      <Box component={Link} href="/account-settings" color={'text.primary'} sx={{ p: 0, display: { sm: 'none' } }}>
        <MoveLeft size={40} />
      </Box>
      <Typography variant="h4" fontWeight={600}>
        {trans('Login & Security')}
      </Typography>

      <Box mt={2}>
        {/* Social accounts section */}
        <Typography variant="h6" fontWeight={500} gutterBottom>
          {trans('Social accounts')}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {/* Google */}
        {sessionUser.provider != 'google' && (
          <Box display="flex" justifyContent="space-between" alignItems="center" py={2}>
            <Box>
              <Typography fontWeight={500}>{trans('Google')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {connectedGoogle ? trans('Connected') : trans('Not connected')}
              </Typography>
            </Box>

            {connectedGoogle ? (
              <Link href="#" underline="always">
                {trans('Disconnect')}
              </Link>
            ) : (
              <Link href="#" underline="always">
                {trans('Connect')}
              </Link>
            )}
          </Box>
        )}
        {/* Facebook */}
        {sessionUser.provider != 'facebook' && (
          <Box display="flex" justifyContent="space-between" alignItems="center" p={0}>
            <Box>
              <Typography fontWeight={500}>{trans('Apple')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {connectedApple ? trans('Connected') : trans('Not connected')}
              </Typography>
            </Box>
            {connectedApple ? (
              <Link href="#" underline="always">
                {trans('Disconnect')}
              </Link>
            ) : (
              <Button
                sx={{
                  textTransform: 'none',
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => {}}
              >
                {trans('Connect')}
              </Button>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Account section */}
        <Typography variant="h6" fontWeight={500} gutterBottom>
          {trans('Account')}
        </Typography>
        <Divider sx={{ mb: 1 }} />

        {/* Deactivate account */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={0}>
          <Box>
            <Typography fontWeight={500}>{trans('Deactivate your account')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {trans('This action cannot be undone')}
            </Typography>
          </Box>
          <Button
            sx={{
              textTransform: 'none',
              bgcolor: 'transparent',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {trans('Deactivate')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
