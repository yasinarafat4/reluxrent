import AccountLayout from '@/components/layout/account/AccountLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Typography } from '@mui/material';

export default function Preferences() {
  const { trans } = useTranslation();
  return (
    <AccountLayout>
      <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} fontWeight={600}>
        {trans('Preferences')}
      </Typography>
      <Box mt={2}>Info</Box>
    </AccountLayout>
  );
}
