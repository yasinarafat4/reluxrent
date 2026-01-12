import HostingLayout from '@/components/layout/host/HostingLayout';
import TinyMCEInputNormal from '@/components/TinyMCEInputNormal';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScreenLockPortraitIcon from '@mui/icons-material/ScreenLockPortrait';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { Check, Ellipsis, Handshake, Keyboard, SaveIcon, UserCheck, Vault, X } from 'lucide-react';
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

const CheckInInstruction = ({ propertyData }) => {
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
      smartLock: propertyData?.checkInOutInstructions?.smartLock,
      smartLockInstruction: propertyData?.checkInOutInstructions?.smartLockInstruction,

      keypad: propertyData?.checkInOutInstructions?.keypad,
      keypadInstruction: propertyData?.checkInOutInstructions?.keypadInstruction,

      lockbox: propertyData?.checkInOutInstructions?.lockbox,
      lockboxInstruction: propertyData?.checkInOutInstructions?.lockboxInstruction,

      buildingStaff: propertyData?.checkInOutInstructions?.buildingStaff,
      buildingStaffInstruction: propertyData?.checkInOutInstructions?.buildingStaffInstruction,

      inPersonGreeting: propertyData?.checkInOutInstructions?.inPersonGreeting,
      inPersonGreetingInstruction: propertyData?.checkInOutInstructions?.inPersonGreetingInstruction,

      other: propertyData?.checkInOutInstructions?.other,
      otherInstruction: propertyData?.checkInOutInstructions?.otherInstruction,
    },
  });

  const watchSmartLock = watch('smartLock');
  const watchKeypad = watch('keypad');
  const watchLockbox = watch('lockbox');
  const watchBuildingStaff = watch('buildingStaff');
  const watchInPersonGreeting = watch('inPersonGreeting');
  const watchOther = watch('other');

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
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ml: { md: '400px' } }}>
          <Stack
            sx={{
              width: { xs: '100%', sm: '70%', lg: '50%' },
              mx: 'auto',
            }}
            gap={2}
          >
            {/* Small device back button */}
            {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=arrival`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
              <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', borderColor: 'divider', p: '6px' }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>}
            {/* Title */}
            <Box my={3} width={'100%'}>
              <Typography variant="h2" gutterBottom>
                Check-in instructions
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
                Choose how guests will check in to your place.
              </Typography>
            </Box>

            {/* Instruction 1  */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<ScreenLockPortraitIcon />} label="Smart lock" value={watchSmartLock} onChange={(val) => setValue('smartLock', val)} />
              {watchSmartLock && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'smartLockInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 2  */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Keyboard />} label="Keypad" value={watchKeypad} onChange={(val) => setValue('keypad', val)} />
              {watchKeypad && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'keypadInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 3  */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Vault />} label="Lockbox" value={watchLockbox} onChange={(val) => setValue('lockbox', val)} />
              {watchLockbox && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'lockboxInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 4  */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<UserCheck />} label="Building staff" value={watchBuildingStaff} onChange={(val) => setValue('buildingStaff', val)} />
              {watchBuildingStaff && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'buildingStaffInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 5  */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Handshake />} label="In-person greeting" value={watchInPersonGreeting} onChange={(val) => setValue('inPersonGreeting', val)} />
              {watchInPersonGreeting && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'inPersonGreetingInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
                </Box>
              )}
            </Box>

            {/* Instruction 6  */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', py: 1, px: 2, borderRadius: '8px' }}>
              <InstructionToggle icon={<Ellipsis />} label="Other" value={watchOther} onChange={(val) => setValue('other', val)} />
              {watchOther && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Controller name={'otherInstruction'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} min_height="100" />} />
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

export default CheckInInstruction;

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
