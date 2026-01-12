import NoDataFound from '@/components/NoDataFound';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Stack, Typography } from '@mui/material';
import { Clock, Users } from 'lucide-react';
import Link from 'next/link';

export default function ThingsToKnow({ propertyData }) {
  console.log('ThingsToKnow', propertyData);
  const { trans } = useTranslation();
  const { actions } = usePopups();

  return (
     <Stack my={2} spacing={1}>
      <Typography variant="h6" fontWeight={600}>
        {trans('Things to know')}
      </Typography>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={4}>
        {/* House Rules */}
        <Stack spacing={1.5}>
          <Typography fontWeight={600}>{trans('House rules')}</Typography>
          {propertyData?.propertyRulesAndManual && Object.keys(propertyData?.propertyRulesAndManual).length > 0 ? (
            <Stack spacing={1.5}>
              {propertyData?.propertyRulesAndManual?.startCheckInTime && propertyData?.propertyRulesAndManual?.endCheckInTime && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Clock size={18} />
                  <Typography variant="body1" fontSize={14}>
                    Check-in between <strong>{propertyData?.propertyRulesAndManual.startCheckInTime}</strong> to <strong>{propertyData?.propertyRulesAndManual.endCheckInTime}</strong>
                  </Typography>
                </Stack>
              )}

              {propertyData?.propertyRulesAndManual?.checkOutTime && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Clock size={18} />
                  <Typography variant="body1" fontSize={14}>
                    Checkout before <strong>{propertyData?.propertyRulesAndManual?.checkOutTime}</strong>
                  </Typography>
                </Stack>
              )}

              {propertyData?.propertyRulesAndManual?.guest && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Users size={18} />
                  <Typography variant="body1" fontSize={14}>
                    {propertyData?.propertyRulesAndManual?.guest} {propertyData?.propertyRulesAndManual?.guest > 1 ? 'guests' : 'guest'} maximum
                  </Typography>
                </Stack>
              )}
              <Box
                onClick={() => actions.openPopup('houseRules', propertyData?.propertyRulesAndManual)}
                sx={{
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                color="primary.main"
              >
                Show more →
              </Box>
            </Stack>
          ) : (
            <NoDataFound subtitle={'No house rules found!'} />
          )}
        </Stack>

        {/* Cancellation policy */}
        <Stack spacing={1.5}>
          <Typography fontWeight={600}>{trans('Cancellation policy')}</Typography>
          {propertyData?.cancellationPolicy ? (
            <Stack gap={2}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {propertyData?.cancellationPolicy?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {propertyData?.cancellationPolicy?.description}
                </Typography>
              </Box>

              {/* link */}
              <Box>
                <Typography variant="body2">Review this Host&apos;s full policy for details.</Typography>
                <Box
                  component={Link}
                  href="/help/cancellation-policy"
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  color="primary.main"
                >
                  Show more →
                </Box>
              </Box>
            </Stack>
          ) : (
            <NoDataFound subtitle={'No cancellation policy found!'} />
          )}
        </Stack>
      </Box>
      
    </Stack>
  );
}
