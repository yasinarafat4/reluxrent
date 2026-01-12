import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material';
import { differenceInDays, format, formatDistanceToNow, parseISO } from 'date-fns';
import { BriefcaseBusiness, GraduationCap, Heart, MapPin } from 'lucide-react';
import Avatar from 'react-avatar';
const HostSection = ({ propertyData }) => {
  console.log('HostPropertyData', propertyData);
  const { trans } = useTranslation();
  const { actions } = usePopups();
  const { user } = useAuth();

  // Exact hosting date
  const hostCreatedAt = parseISO(propertyData?.host?.hostAt);
  const daysHosting = differenceInDays(new Date(), hostCreatedAt) || 1;

  return (
    <Box>
      <Stack my={2} spacing={1}>
        <Typography variant="h6" fontWeight={600}>
          {trans('Meet your host')}
        </Typography>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent={'start'} gap={4}>
          {/* Left: Host Card and Fun Facts */}
          <Box>
            {/* Host Info Card */}
            <Card
              sx={(theme) => ({
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                p: 2,
                width: { xs: '100%', sm: '350px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                mb: 2,
                ...(theme.palette.mode === 'dark' && {
                  border: '1px solid',
                  borderColor: 'divider',
                }),
              })}
            >
              <Stack direction={'column'} justifyContent={'space-between'} alignItems={'center'} gap={1}>
                <Avatar src={propertyData?.host?.image} name={propertyData?.host?.name} size="60" round={true} />
                {/* <FavoriteIcon color="error" sx={{ position: 'relative', top: -30, right: -30 }} /> */}

                <Box>
                  {' '}
                  <Typography variant="h6" fontWeight="bold">
                    {propertyData?.host?.name}
                  </Typography>
                  <Typography fontSize={14} variant="body2" textAlign={'center'}>
                    {trans('Host')}
                  </Typography>
                </Box>
              </Stack>

              {/* Stats */}
              <Box mt={2} textAlign="start">
                <Stack direction={'column'}>
                  <Typography fontSize={16} fontWeight={600}>
                    {propertyData?.reviewCount || 0}
                  </Typography>
                  <Typography fontSize={14}>{trans('Reviews')}</Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction={'column'}>
                  <Typography fontSize={16} fontWeight={600}>
                    {propertyData?.overallRating || 0}
                  </Typography>
                  <Typography fontSize={14}>{trans('Rating')}</Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction={'column'}>
                  <Typography fontSize={16} fontWeight={600}>
                    {formatDistanceToNow(propertyData?.host?.hostAt)}
                  </Typography>
                  <Typography fontSize={14}>hosting</Typography>
                </Stack>
              </Box>
            </Card>

            {/* Fun Facts */}
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <MapPin size={18} />
                <Typography fontSize={14}>
                  <Typography component="span" fontSize={14} fontWeight={500}>
                    {trans('Born in')}:
                  </Typography>{' '}
                  {format(propertyData?.host?.dob, 'MMM d, yyyy')}
                </Typography>
              </Box>

              {propertyData?.host?.myWork && (
                <Box display="flex" alignItems="center" gap={1}>
                  <BriefcaseBusiness size={18} />
                  <Typography fontSize={14}>
                    <Typography component="span" fontSize={14} fontWeight={500}>
                      {trans('My work')}:
                    </Typography>{' '}
                    {propertyData?.host?.myWork}
                  </Typography>
                </Box>
              )}

              {propertyData?.host?.school && (
                <Box display="flex" alignItems="center" gap={1}>
                  <GraduationCap size={18} />
                  <Typography fontSize={14}>
                    <Typography component="span" fontSize={14} fontWeight={500}>
                      {trans('Went to')}:
                    </Typography>{' '}
                    {propertyData?.host?.school}
                  </Typography>
                </Box>
              )}

              {propertyData?.host?.obsessedWith && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Heart size={18} />
                  <Typography fontSize={14}>
                    <Typography component="span" fontSize={14} fontWeight={500}>
                      {trans("I'm obsessed with")}:
                    </Typography>{' '}
                    {propertyData?.host?.obsessedWith}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Right: Description + Contact */}
          <Box display={'flex'} flexDirection={'column'} gap={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="body1" fontWeight={500} fontSize={16}>
                {trans('Host details')}
              </Typography>
              <Typography fontSize={14} mb={1}>
                {trans('Response rate')}: 100%
                <br />
                {trans('Responds within an hour')}
              </Typography>

              <Button
                onClick={() => (user ? actions.openPopup('contactHost', propertyData) : actions.openPopup('login', {}))}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'none', width: '140px', px: 1.5, py: 0.7 }}
              >
                {trans('Message host')}
              </Button>
            </Stack>

            {propertyData?.coHosts?.length > 0 && (
              <Stack spacing={0.5}>
                <Typography variant="body1" fontWeight={500} fontSize={16}>
                  {trans('Co-hosts')}
                </Typography>
                <Stack spacing={2}>
                  {propertyData?.coHosts?.map((coHost, i) => (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box border="1px solid" borderColor="divider" borderRadius={'100%'}>
                        <Avatar src={coHost?.user?.image} name={coHost?.user?.name} alt={coHost?.user?.name} size="35" round={true} />
                      </Box>
                      <Stack>
                        <Typography fontSize={14} fontWeight={500}>
                          {coHost?.user?.name}
                        </Typography>
                        <Typography fontSize={12}>{coHost?.user?.email}</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            )}

            <Divider />

            <Box display="flex" alignItems={{ xs: 'start', md: 'center' }} gap={0.5}>
              <InfoIcon color="error" fontSize="small" />
              <Typography variant="caption" color="text.primary">
                {trans('To help protect your payment, always use ReluxRent to send money and communicate with hosts.')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
      <Divider sx={{ my: 3 }} />
    </Box>
  );
};

export default HostSection;
