import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Stack, Typography } from '@mui/material';

const EarningsReport = () => {
  const { trans } = useTranslation();
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {trans('Earnings Report')}
      </Typography>
      <Box
        display={'grid'}
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        }}
      >
        <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} boxShadow={'0 4px 20px rgba(0, 0, 0, 0.2)'} borderRadius={1} p={2} height={'190px'} width={'100%'}>
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography>2025</Typography>
            <Typography bgcolor={'primary.main'} color="common.white" px={1} py={0.5} fontSize={12} borderRadius={2}>
              New
            </Typography>
          </Stack>
          <Stack>
            <Typography variant='h5'>January</Typography>
            <Typography fontSize={16} fontWeight={500}>$12</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default EarningsReport;
