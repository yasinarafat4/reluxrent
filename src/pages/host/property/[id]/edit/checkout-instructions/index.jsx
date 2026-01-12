import HostingLayout from '@/components/layout/host/HostingLayout';
import TinyMCEInputNormal from '@/components/TinyMCEInputNormal';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Checklist, Delete, Key, LocalLaundryService, Lock, PowerSettingsNew } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { Check, SaveIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const InstructionToggle = ({ label, value, icon, onChange }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {icon}
      <Typography variant="body1">{label}</Typography>
    </Stack>
    <Box display="flex" gap={1}>
      <IconButton
        size="small"
        onClick={() => onChange(false)}
        sx={[
          (theme) => ({
            bgcolor: !value ? theme.palette.grey[900] : theme.palette.grey[200],
            color: !value ? theme.palette.common.white : theme.palette.common.black,
            borderRadius: '50%',
            p: 0.7,
            '&:hover': {
              bgcolor: !value ? theme.palette.grey[800] : theme.palette.grey[300],
            },
          }),
          (theme) =>
            theme.applyStyles('dark', {
              // bgcolor: theme.palette.common.black,
              // color: theme.palette.common.white,
            }),
        ]}
      >
        <X size={17} />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => onChange(true)}
        sx={[
          (theme) => ({
            bgcolor: value ? theme.palette.grey[900] : theme.palette.grey[200],
            color: value ? theme.palette.common.white : theme.palette.common.black,
            borderRadius: '50%',
            p: 0.7,
            '&:hover': {
              bgcolor: value ? theme.palette.grey[800] : theme.palette.grey[300],
            },
          }),
          (theme) =>
            theme.applyStyles('dark', {
              // bgcolor: theme.palette.common.black,
              // color: theme.palette.common.white,
            }),
        ]}
      >
        <Check size={17} />
      </IconButton>
    </Box>
  </Box>
);

const CheckoutInstructions = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gatherUsedTowels: propertyData?.checkInOutInstructions?.gatherUsedTowels,
      gatherUsedTowelsInstruction: propertyData?.checkInOutInstructions?.gatherUsedTowelsInstruction,

      throwTrashAway: propertyData?.checkInOutInstructions?.throwTrashAway,
      throwTrashAwayInstruction: propertyData?.checkInOutInstructions?.throwTrashAwayInstruction,

      turnThingsOff: propertyData?.checkInOutInstructions?.turnThingsOff,
      turnThingsOffInstruction: propertyData?.checkInOutInstructions?.turnThingsOffInstruction,

      lockUp: propertyData?.checkInOutInstructions?.lockUp,
      lockUpInstruction: propertyData?.checkInOutInstructions?.lockUpInstruction,

      returnKeys: propertyData?.checkInOutInstructions?.returnKeys,
      returnKeysInstruction: propertyData?.checkInOutInstructions?.returnKeysInstruction,

      additionalRequests: propertyData?.checkInOutInstructions?.additionalRequests,
      additionalRequestsInstruction: propertyData?.checkInOutInstructions?.additionalRequestsInstruction,
    },
  });

  const watchGatherUsedTowels = watch('gatherUsedTowels');
  const watchThrowTrashAway = watch('throwTrashAway');
  const watchTurnThingsOff = watch('turnThingsOff');
  const watchLockUp = watch('lockUp');
  const watchReturnKeys = watch('returnKeys');
  const watchAdditionalRequests = watch('additionalRequests');

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/check-in-out-instructions`, formData);
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HostingLayout>
      {/* Sidebar */}
      {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
      <Box px={2} pt={2} pb={12}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ml: { md: '400px' }, py: 2 }}>
          <Stack
            sx={{
              width: { xs: '100%', sm: '70%', lg: '50%' },
              mx: 'auto',
            }}
            gap={2}
          >
            {/* Small device back button */}
            {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=arrival`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
              <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>}
            {/* Title */}
            <Box my={3} width={'100%'}>
              <Typography variant="h2" gutterBottom>
                Check-out instructions
              </Typography>
              <Typography
                variant="subtitle1"
                sx={[
                  (theme) => ({
                    color: theme.palette.grey[700],
                  }),
                  (theme) =>
                    theme.applyStyles('dark', {
                      color: theme.palette.grey[500],
                    }),
                ]}
              >
                Let guests know what to do before they leave. These steps are visible before booking.
              </Typography>
            </Box>

            {/* Instruction 1  */}
            <Box sx={{ border: '1px solid', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<LocalLaundryService />} label="Gather used towels" value={watchGatherUsedTowels} onChange={(val) => setValue('gatherUsedTowels', val)} />
              {watchGatherUsedTowels && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'gatherUsedTowelsInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 2  */}
            <Box sx={{ border: '1px solid', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Delete />} label="Throw trash away" value={watchThrowTrashAway} onChange={(val) => setValue('throwTrashAway', val)} />
              {watchThrowTrashAway && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'throwTrashAwayInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 3  */}
            <Box sx={{ border: '1px solid', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<PowerSettingsNew />} label="Turn things off" value={watchTurnThingsOff} onChange={(val) => setValue('turnThingsOff', val)} />
              {watchTurnThingsOff && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'turnThingsOffInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 4  */}
            <Box sx={{ border: '1px solid', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Lock />} label="Lock up" value={watchLockUp} onChange={(val) => setValue('lockUp', val)} />
              {watchLockUp && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'lockUpInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 5  */}
            <Box sx={{ border: '1px solid', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Key />} label="Return keys" value={watchReturnKeys} onChange={(val) => setValue('returnKeys', val)} />
              {watchReturnKeys && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'returnKeysInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 6  */}
            <Box sx={{ border: '1px solid', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Checklist />} label="Additional requests" value={watchAdditionalRequests} onChange={(val) => setValue('additionalRequests', val)} />
              {watchAdditionalRequests && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'additionalRequestsInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Bottom Fixed Button */}
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                zIndex: '9999',
                gap: 2,
                px: { xs: 2, md: 4 },
                py: 2,
              }}
            >
              <Box>
                <Button
                  type="submit"
                  size="small"
                  loading={loading}
                  loadingPosition="end"
                  startIcon={<SaveIcon size={17} />}
                  sx={[
                    (theme) => ({
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 2,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
                      color: (theme) => (theme.palette.mode === 'dark' ? 'black' : 'white'),
                      '&.Mui-disabled': {
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                        bgcolor: theme.palette.grey[600],
                        color: theme.palette.grey[100],
                        opacity: 0.7,
                      },
                    }),
                  ]}
                >
                  {trans('Save')}
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default CheckoutInstructions;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [languagesData, propertyData] = await Promise.all([
      api.get(`/api/front/languages`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
      api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || []),
    ]);

    return {
      props: {
        languagesData,
        propertyData,
      },
    };
  } catch (error) {
    // Handle other errors (e.g., network, server errors)
    console.error('Error fetching space types:', error);
    return {
      props: {
        languagesData: [],
        propertyData: [],
      },
    };
  }
}
