import { formatGuestSummary } from '@/utils/formatGuestSummary';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import Avatar from 'react-avatar';

const TodaysReservationCard = ({ booking }) => {
  
  return (
    <Card
      sx={{
        position: 'relative',
        width: '100%',
        p: { xs: 0.5, sm: 1 },
        textAlign: 'center',
      }}
      elevation={4}
    >
      <CardContent sx={{ px: 1 }}>
        <Box position={'absolute'} left={10} top={10} px={1.5} py={'3px'} borderRadius={2} fontSize={10} bgcolor={'grey.900'} color={'text.primary'}>
          <Typography variant="body2" color="common.white" fontSize={{ xs: 10 }}>
            {booking?.guestStatus}
          </Typography>
        </Box>
        <Stack gap={1} justifyContent={'center'} alignItems={'center'} pt={3}>
          <Avatar src={booking?.guest?.image} name={booking?.guest?.name} alt={booking?.guest?.name} size="50" round={true} />
          <Typography variant='body2' fontSize={12}>{formatGuestSummary(booking.guests)}</Typography>
          <Box width={'100%'}>
            <Typography
              component={Link}
              href={`/host/reservations/details/${booking.id}`}
              fontSize={{ xs: 13, sm: 14 }}
              fontWeight={500}
              sx={{
                textTransform: 'capitalize',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                flexShrink: 1,
                maxWidth: '100%',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {booking?.property?.name}
            </Typography>
            <Typography variant="body1" fontSize={{ xs: 10, sm: 12 }} fontWeight={500}>
              {format(booking?.startDate, 'MMM dd, yyyy')} - {format(booking?.endDate, 'MMM dd, yyyy')}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TodaysReservationCard;
