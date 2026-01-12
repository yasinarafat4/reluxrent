import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { Autocomplete, Box, Button, Divider, FormHelperText, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { CarFront, Globe, IdCard } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';
import DrivingLicense from './IdTypes/DrivingLicense';
import GovernmentId from './IdTypes/GovernmentId';
import Passport from './IdTypes/Passport';

export default function ChooseIDType({ verificationData, selectedIDType, setSelectedIDType }) {
  console.log('selectedIDType =', selectedIDType);
  const { trans, lang, setLang } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { data: countries, isLoading } = useSWR(`/api/host/countries?lang=${lang.code}`, fetcher);

  const methods = useForm();

  const watchDocumentType = methods.watch('documentType');

  const onSubmit = async (data) => {
    console.log('DATA', data);
    setLoading(true);
    try {
      await api.post('/api/host/submit-document', data);
      await mutate(
        '/api/host/verifications-data',
        async () => {
          const res = await api.get('/api/host/verifications-data');
          return res.data;
        },
        { revalidate: false },
      );
    } catch (error) {
      console.log('error', error);
      enqueueSnackbar(error?.response?.data?.message, { variant: 'error' });
      console.log('❌ Create error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    methods.setValue('verificationId', verificationData.id);
  }, [verificationData]);

  const documentTypes = [
    {
      value: 'DrivingLicense',
      label: trans("Driver's license"),
      icon: (
        <IconButton
          sx={{
            color: 'text.primary',
          }}
        >
          <CarFront size={20} />
        </IconButton>
      ),
    },
    {
      value: 'Passport',
      label: trans('Passport'),
      icon: (
        <IconButton
          sx={{
            color: 'text.primary',
          }}
        >
          <Globe size={20} />
        </IconButton>
      ),
    },
    {
      value: 'GovernmentId',
      label: trans('Government Id'),
      icon: (
        <IconButton
          sx={{
            color: 'text.primary',
          }}
        >
          <IdCard size={20} />
        </IconButton>
      ),
    },
  ];

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <FormProvider {...methods}>
      <Box width={'100%'} mx={'auto'} sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
        <Box component="form" onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack width={'100%'} direction={{ xs: 'column', md: 'row' }} justifyContent={'center'} alignItems='center'  gap={3}>
            <Box display={'flex'} flexDirection={'column'} gap={2} width={'60%'}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {trans('Choose an ID type to add')}
              </Typography>
              {/* Country Dropdown */}
              <Controller
                name="country"
                control={methods.control}
                rules={{ required: 'Country is required' }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    {...field}
                    value={field.value || null}
                    sx={{ width: '100%' }}
                    options={countries}
                    autoHighlight
                    getOptionLabel={(option) => (option?.name ? option.name : '')}
                    onChange={(_, data) => {
                      field.onChange(data);
                    }}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props;
                      return (
                        <Box key={key} component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...optionProps}>
                          {option.name} ({option.iso2})
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Issuing country / region *"
                        error={!!fieldState.error}
                        helperText={fieldState.error && fieldState.error?.message}
                        slotProps={{
                          htmlInput: {
                            ...params.inputProps,
                            autoComplete: 'new-password',
                          },
                        }}
                      />
                    )}
                  />
                )}
              />
              {/* ID Type Selection */}
              <Controller
                name="documentType"
                control={methods.control}
                rules={{ required: 'Document type is required' }}
                render={({ field, fieldState }) => (
                  <>
                    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {documentTypes.map((type) => (
                        <ListItemButton
                          key={type.value}
                          onClick={() => field.onChange(type.value)}
                          selected={field.value === type.value}
                          sx={{
                            border: '2px solid',
                            borderWidth: field.value === type.value ? 2 : 0.5,
                            borderColor: field.value === type.value ? 'text.primary' : 'grey.300',
                            borderRadius: 1,
                            px: 2,
                            py: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'grey.600',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>{type.icon}</ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography fontSize="0.95rem" fontWeight={500}>
                                {type.label}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                    {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                  </>
                )}
              />

              <Divider />
              {/* Privacy Note */}
              <Typography variant="body2" color="text.secondary">
                {trans(' Your ID will be handled according to our')}{' '}
                <MuiLink href="/help/privacy-policy" underline="hover">
                  {trans('Privacy Policy')}
                </MuiLink>{' '}
                {trans("and won't be shared with your Host or guests.")}
              </Typography>
            </Box>

            <Box width={'40%'}>
              {watchDocumentType == 'GovernmentId' ? <GovernmentId /> : watchDocumentType == 'DrivingLicense' ? <DrivingLicense /> : watchDocumentType == 'Passport' ? <Passport /> : <Typography textAlign={'center'} variant='body2' fontSize={15}>No Type Slected Yet!</Typography>}
            </Box>
          </Stack>

          <Stack gap={2} mt={2}>
            <Divider />
            {/* Button */}
            <Box display="flex" justifyContent="end" alignItems="center">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                }}
              >
                {trans('Continue')}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </FormProvider>
  );
}
