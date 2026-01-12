import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Dialog, DialogContent, DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import { Briefcase, CalendarDays, Cigarette, Clock, Moon, Users, X } from 'lucide-react';

export default function HouseRulesPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '15px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth
      maxWidth="sm"
      onClose={closeModal}
      aria-labelledby="house-rules-dialog"
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="start" py={1} pr={1}>
        <Box>
          <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px' }, fontWeight: 600 }}>{trans('House rules')}</DialogTitle>
          <Typography variant="body2" color="text.secondary" px={3}>
            {trans("You'll be staying in someone's home, so please treat it with care and respect.")}
          </Typography>
        </Box>
        <IconButton aria-label="close" onClick={closeModal} color="inherit">
          <X />
        </IconButton>
      </Stack>
      <Divider />

      {/* Content */}
      <DialogContent>
        <Stack spacing={3}>
          {/* Check-in / Check-out */}
          {(popupData?.startCheckInTime && popupData?.endCheckInTime) || popupData?.checkOutTime ? (
            <Stack spacing={1}>
              <Typography fontWeight={600}>{trans('Check-in & Check-out')}</Typography>

              {popupData?.startCheckInTime && popupData?.endCheckInTime && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Clock size={18} />
                  <Typography variant="body2">
                    {trans('Check-in between')} <strong>{popupData.startCheckInTime}</strong> – <strong>{popupData.endCheckInTime}</strong>
                  </Typography>
                </Stack>
              )}

              {popupData?.checkOutTime && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Clock size={18} />
                  <Typography variant="body2">
                    {trans('Checkout before')} <strong>{popupData.checkOutTime}</strong>
                  </Typography>
                </Stack>
              )}
            </Stack>
          ) : null}

          {/* Quiet hours */}
          {popupData?.quietHours && (
            <Stack spacing={1}>
              <Typography fontWeight={600}>{trans('Quiet hours')}</Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Moon size={18} />
                <Typography variant="body2">
                  {trans('Between')} <strong>{popupData?.startQuietHoursTime}</strong> - <strong>{popupData?.endQuietHoursTime}</strong>
                </Typography>
              </Stack>
            </Stack>
          )}

          {/* Restrictions */}
          <Stack spacing={1}>
            <Typography fontWeight={600}>{trans('Restrictions')}</Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Cigarette size={18} />
              <Typography variant="body2">{popupData?.smokingAllowed ? trans('Smoking is allowed') : trans('Smoking is not allowed!')}</Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Briefcase size={18} />
              <Typography variant="body2">{popupData?.commercialAllowed ? trans('Commercial activities allowed') : trans('No commercial activities allowed!')}</Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <CalendarDays size={18} />
              <Typography variant="body2">{popupData?.eventsAllowed ? trans('Events are allowed') : trans('No events allowed!')}</Typography>
            </Stack>
          </Stack>

          {/* Guests */}
          {popupData?.guest && (
            <Stack spacing={1}>
              <Typography fontWeight={600}>{trans('Guests')}</Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Users size={18} />
                <Typography variant="body2">
                  {popupData?.guest} {popupData?.guest === 1 ? trans('guest maximum') : trans('guests maximum')}
                </Typography>
              </Stack>
            </Stack>
          )}

          {/* Additional Rules */}
          {popupData?.additionalRules && (
            <Stack spacing={1}>
              <Typography fontWeight={600}>{trans('Additional Rules')}</Typography>
              <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: popupData?.additionalRules }} />
            </Stack>
          )}

          {/* Directions */}
          {popupData?.directions && (
            <Stack spacing={1}>
              <Typography fontWeight={600}>{trans('Directions')}</Typography>
              <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: popupData?.directions }} />
            </Stack>
          )}

          {/* House Manual */}
          {popupData?.houseManual && (
            <Stack spacing={1}>
              <Typography fontWeight={600}>{trans('House Manual')}</Typography>
              <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: popupData?.houseManual }} />
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
