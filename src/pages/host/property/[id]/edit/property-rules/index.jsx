import HostingLayout from '@/components/layout/host/HostingLayout';
import TinyMCEInputNormal from '@/components/TinyMCEInputNormal';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { getCookie } from 'cookies-next';
import { Check, Minus, Plus, SaveIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';
const CounterRow = forwardRef(({ label, value, onChange, min = 0, max = 100, fieldState }, ref) => {
  const [inputValue, setInputValue] = useState(value || min);

  const onIncrement = () => {
    if (inputValue < max) {
      const newValue = inputValue + 1;
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  const onDecrement = () => {
    if (inputValue > min) {
      const newValue = inputValue - 1;
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Typography variant="subtitle1" color={fieldState?.error ? 'error.main' : 'text.primary'}>
        {label}
        {fieldState?.error && (
          <Typography variant="body2" color="error.main">
            {fieldState?.error?.message}
          </Typography>
        )}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          sx={[
            (theme) => ({
              '&.Mui-disabled': {
                pointerEvents: 'auto',
                cursor: 'not-allowed',
              },
            }),
            (theme) =>
              theme.applyStyles('dark', {
                color: theme.palette.common.white,
              }),
          ]}
          onClick={onDecrement}
          disabled={inputValue <= min}
        >
          <Minus size={16} />
        </IconButton>
        <Typography>{inputValue}</Typography>
        <IconButton
          onClick={onIncrement}
          sx={[
            (theme) => ({
              '&.Mui-disabled': {
                pointerEvents: 'auto',
                cursor: 'not-allowed',
              },
            }),
            (theme) =>
              theme.applyStyles('dark', {
                color: theme.palette.common.white,
              }),
          ]}
        >
          <Plus size={16} />
        </IconButton>
      </Box>
    </Box>
  );
});

const RuleToggle = ({ label, name, control }) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { value, onChange } }) => (
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
        <Typography variant="body1">{label}</Typography>
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
    )}
  />
);

const PropertyRules = ({ languagesData, propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const [selectedLang, setSelectedLang] = useState('en');

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      eventsAllowed: propertyData?.propertyRulesAndManual.eventsAllowed,
      smokingAllowed: propertyData?.propertyRulesAndManual.smokingAllowed,
      quietHours: propertyData?.propertyRulesAndManual.quietHours,
      startQuietHoursTime: propertyData?.propertyRulesAndManual.startQuietHoursTime,
      endQuietHoursTime: propertyData?.propertyRulesAndManual.endQuietHoursTime,
      commercialAllowed: propertyData?.propertyRulesAndManual.commercialAllowed,
      guest: propertyData?.accommodates,
      startCheckInTime: propertyData?.propertyRulesAndManual.startCheckInTime,
      endCheckInTime: propertyData?.propertyRulesAndManual.endCheckInTime,
      checkOutTime: propertyData?.propertyRulesAndManual.checkOutTime,
      wifiName: propertyData?.propertyRulesAndManual.wifiName,
      wifiPassword: propertyData?.propertyRulesAndManual.wifiPassword,
      ...propertyData?.propertyRulesAndManual.rulesAndManuals,
    },
  });

  const quietHoursEnabled = watch('quietHours');
  const formData = watch();
  console.log('formData', formData);
  useEffect(() => {
    setValue(`${selectedLang}.additionalRules`, formData[`${selectedLang}`]?.additionalRules || '');
    setValue(`${selectedLang}.directions`, formData[`${selectedLang}`]?.directions || '');
    setValue(`${selectedLang}.houseManual`, formData[`${selectedLang}`]?.houseManual || '');
  }, [selectedLang, setValue]);

  const onSubmit = async () => {
    const Translations = languagesData.reduce((acc, lang) => {
      const languageData = {};

      languageData.additionalRules = formData[`${lang.code}`]?.additionalRules || '';
      languageData.directions = formData[`${lang.code}`]?.directions || '';
      languageData.houseManual = formData[`${lang.code}`]?.houseManual || '';

      if (Object.keys(languageData).length > 0) {
        acc[lang.code] = languageData;
      }
      return acc;
    }, {});

    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/property-rules`, { ...formData, Translations });
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error updating house rules', error);
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const suffix = i < 12 ? 'AM' : 'PM';
    return `${hour}:00${suffix}`;
  });

  const onLanguageTabChange = (e, newValue) => {
    setSelectedLang(newValue);
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {/* Sidebar */}
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ml: { md: '400px' } }}>
          <Box
            sx={{
              width: { xs: '100%', sm: '70%', lg: '50%' },
              mx: 'auto',
            }}
          >
            {/* Small device back button */}
            {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
              <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>}
            {/* Title */}
            <Box my={3} width={'100%'}>
              <Typography variant="h2" gutterBottom>
                Property rules
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
                Set expectations for your guests to ensure a smooth and respectful stay.
              </Typography>
            </Box>

            <RuleToggle name="eventsAllowed" control={control} label="Events allowed" />
            <Divider sx={{ my: 2 }} />

            <RuleToggle name="smokingAllowed" control={control} label="Smoking, vaping, e-cigarettes allowed" />
            <Divider sx={{ my: 2 }} />

            <RuleToggle name="quietHours" control={control} label="Quiet hours" />

            {quietHoursEnabled && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                <Controller
                  name="startQuietHoursTime"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="start-time-label">Start time</InputLabel>
                      <Select
                        size="small"
                        MenuProps={{
                          PaperProps: {
                            sx: { maxHeight: 400, zIndex: 1050 },
                          },
                        }}
                        labelId="start-time-label"
                        {...field}
                        label="Start time"
                      >
                        {timeOptions.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="endQuietHoursTime"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="end-time-label">End time</InputLabel>
                      <Select
                        size="small"
                        MenuProps={{
                          PaperProps: {
                            sx: { maxHeight: 400, zIndex: 1050 },
                          },
                        }}
                        labelId="end-time-label"
                        {...field}
                        label="End time"
                      >
                        {timeOptions.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <RuleToggle name="commercialAllowed" control={control} label="Commercial photography and filming allowed" />

            <Divider sx={{ my: 2 }} />

            {/* Guest Counter */}
            <Controller
              name="guest"
              control={control}
              rules={{ required: 'At least 1 guest required!', min: { value: 1, message: 'At least 1 guest required!' } }}
              render={({ field, fieldState }) => <CounterRow width={'100%'} fieldState={fieldState} {...field} label="Number of guests" min={0} />}
            />
            <Divider sx={{ my: 2 }} />
            {/* Check-in and Checkout Accordion */}
            <Accordion
              defaultExpanded={propertyData?.propertyRulesAndManual.startCheckInTime || propertyData?.propertyRulesAndManual.endCheckInTime || propertyData?.propertyRulesAndManual.checkOutTime}
              sx={[
                (theme) => ({
                  width: '100%',
                  bgcolor: theme.palette.common.white,
                  borderRadius: '4px',
                  color: theme.palette.common.black,
                  overflow: 'hidden',
                  px: 0,
                  '&::before': {
                    display: 'none',
                  },
                  boxShadow: 'none',
                }),
                (theme) =>
                  theme.applyStyles('dark', {
                    bgcolor: theme.palette.grey[900],
                    color: theme.palette.common.white,
                  }),
              ]}
              disableGutters
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
                sx={{
                  minHeight: 0,
                  padding: 0,
                  border: 0,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                  },
                }}
              >
                <Box>
                  <Typography variant="body1">Check-in and checkout times</Typography>
                  <Typography variant="body2">Arrive between 9:00PM - Flexible</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                  <Stack width={'100%'} gap={1}>
                    <Typography variant="body2" fontWeight={600} textAlign={'start'}>
                      Check-in Time
                    </Typography>
                    <Controller
                      name="startCheckInTime"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="start-time-label">Start time</InputLabel>
                          <Select
                            size="small"
                            MenuProps={{
                              PaperProps: {
                                sx: { maxHeight: 400, zIndex: 1050 },
                              },
                            }}
                            labelId="start-time-label"
                            {...field}
                            label="Start time"
                          >
                            {timeOptions.map((time) => (
                              <MenuItem key={time} value={time}>
                                {time}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="endCheckInTime"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="end-time-label">End time</InputLabel>
                          <Select
                            size="small"
                            MenuProps={{
                              PaperProps: {
                                sx: { maxHeight: 400, zIndex: 1050 },
                              },
                            }}
                            labelId="end-time-label"
                            {...field}
                            label="End time"
                          >
                            {timeOptions.map((time) => (
                              <MenuItem key={time} value={time}>
                                {time}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>
                  <Stack width={'100%'} gap={1}>
                    <Typography variant="body2" fontWeight={600} textAlign={'start'}>
                      Check-out Time
                    </Typography>
                    <Controller
                      name="checkOutTime"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="end-time-label">End time</InputLabel>
                          <Select
                            size="small"
                            MenuProps={{
                              PaperProps: {
                                sx: { maxHeight: 400, zIndex: 1050 },
                              },
                            }}
                            labelId="end-time-label"
                            {...field}
                            label="End time"
                          >
                            {timeOptions.map((time) => (
                              <MenuItem key={time} value={time}>
                                {time}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 2 }} />

            {/* Wifi Details */}
            <Box>
              <Box>
                <Typography variant="body1">Wifi details</Typography>
                <Typography variant="body2"> Share the network name and password so guests can easily connect.</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 2, my: 1 }}>
                <Controller
                  name="wifiName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      sx={[
                        (theme) => ({
                          '& .MuiFormHelperText-root': {
                            ml: 0,
                          },
                        }),
                        (theme) =>
                          theme.applyStyles('dark', {
                            '& .MuiInputLabel-root': {
                              color: theme.palette.grey[400],
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: theme.palette.common.white,
                            },
                          }),
                      ]}
                      label="Wifi name"
                      size="small"
                      variant="outlined"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: !!field.value } }}
                    />
                  )}
                />
                <Controller
                  name="wifiPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      sx={[
                        (theme) => ({
                          '& .MuiFormHelperText-root': {
                            ml: 0,
                          },
                        }),
                        (theme) =>
                          theme.applyStyles('dark', {
                            '& .MuiInputLabel-root': {
                              color: theme.palette.grey[400],
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: theme.palette.common.white,
                            },
                          }),
                      ]}
                      label="Wifi password"
                      size="small"
                      variant="outlined"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: !!field.value } }}
                    />
                  )}
                />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Additional Rules Accordion*/}
            <Accordion
              defaultExpanded={formData[`${selectedLang}`]?.additionalRules || formData[`${selectedLang}`]?.directions || formData[`${selectedLang}`]?.houseManual}
              sx={[
                (theme) => ({
                  width: '100%',
                  bgcolor: theme.palette.common.white,
                  borderRadius: '4px',
                  color: theme.palette.common.black,
                  overflow: 'hidden',
                  px: 0,
                  '&::before': {
                    display: 'none',
                  },
                  boxShadow: 'none',
                }),
                (theme) =>
                  theme.applyStyles('dark', {
                    bgcolor: theme.palette.grey[900],
                    color: theme.palette.common.white,
                  }),
              ]}
              disableGutters
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
                sx={{
                  minHeight: 0,
                  padding: 2,
                  border: 0,
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                  },
                }}
              >
                <Box>
                  <Typography variant="body1">Additional rules</Typography>
                  <Typography variant="body2">Share anything else you expect from guests.</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Languages Tab */}
                <Box sx={{ mb: 1 }}>
                  <Tabs
                    onChange={onLanguageTabChange}
                    sx={{
                      overflowX: 'auto',
                      '& .MuiTabs-indicator': {
                        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
                        transition: 'background-color 0.3s ease',
                      },
                    }}
                    value={selectedLang}
                    textColor="secondary"
                    indicatorColor="secondary"
                  >
                    {languagesData?.map((language, i) => (
                      <Tab
                        sx={{
                          fontSize: '14px',
                          color: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
                          '&.Mui-selected': {
                            color: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
                            fontWeight: 600,
                          },
                        }}
                        label={language?.name}
                        value={language?.code}
                      />
                    ))}
                  </Tabs>
                </Box>

                <Box>
                  <Controller
                    name={`${selectedLang}.additionalRules`}
                    control={control}
                    render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Additional rules (${selectedLang})`} min_height="100" key={selectedLang} />}
                  />
                </Box>
                <Box>
                  <Controller
                    name={`${selectedLang}.directions`}
                    control={control}
                    render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Directions (${selectedLang})`} min_height="100" key={selectedLang} />}
                  />
                </Box>
                <Box>
                  <Controller
                    name={`${selectedLang}.houseManual`}
                    control={control}
                    render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`House manual (${selectedLang})`} min_height="100" key={selectedLang} />}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
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
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default PropertyRules;

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
    console.error('Error fetching space types:', error);
    return {
      props: {
        languagesData: [],
        propertyData: [],
      },
    };
  }
}
