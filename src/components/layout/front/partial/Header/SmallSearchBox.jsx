import { useTranslation } from '@/contexts/TranslationContext';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { Search } from 'lucide-react';
import { useRouter } from 'next/router';

const SmallSearchBox = ({ setShowLargeDeviceSearch, setIsManualToggle, guestCount, toggleDrawer }) => {
  const { trans } = useTranslation();
  const router = useRouter();

  function handleClick() {
    if (router.pathname === '/') {
      setShowLargeDeviceSearch((prev) => !prev);
      setIsManualToggle(true);
    } else {
      toggleDrawer(true)();
    }
  }

  return (
    <Box display={{ xs: 'none', md: 'flex' }} justifyContent="center" position={'relative'} flex={1} onClick={handleClick}>
      <Paper
        elevation={3}
        sx={{
          py: 0.7,
          px: 1,
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              px: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
            fontSize={12}
          >
            {trans('Anywhere')}
          </Typography>

          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              px: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
            fontSize={12}
          >
            {trans('Any Week')}
          </Typography>

          <Typography variant="body2" color="text.primary" fontSize={12}>
            {guestCount.adults + guestCount.children} Guest
            {guestCount.adults + guestCount.children > 1 ? 's' : ''}
            {guestCount.infants ? `, ${guestCount.infants} Infant${guestCount.infants > 1 ? 's' : ''}` : ''}
          </Typography>

          <IconButton
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <Search size={15} color="white" />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default SmallSearchBox;
