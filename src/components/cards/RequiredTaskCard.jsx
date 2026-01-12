import { useTranslation } from '@/contexts/TranslationContext';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import { Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import Link from 'next/link';

export default function RequiredTaskCard() {
  const { trans } = useTranslation();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="center"
      alignItems="center"
      spacing={2}
      px={2}
      py={{ xs: 5, sm: 2 }}
      bgcolor={(theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100')}
    >
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
          width: { xs: '100%', sm: '360px', lg: '420px' },
          bgcolor: 'background.paper',
        }}
      >
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <IconButton
              sx={{
                borderRadius: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
                width: 60,
                height: 60,
                flexShrink: 0,
              }}
            >
              <BeenhereIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            </IconButton>

            <Stack spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                {trans('Complete your profile verification')}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize={12}>
                {trans('Upload your government-issued ID / driver\'s license / passport and a profile photo to complete verification and publish your listings.')}
              </Typography>
              <Button
                LinkComponent={Link}
                href="/account-settings/personal-info/identity-verification"
                variant="contained"
                size="small"
                sx={{
                  mt: 1,
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  borderRadius: 1,
                }}
              >
                {trans('Verify Now')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
