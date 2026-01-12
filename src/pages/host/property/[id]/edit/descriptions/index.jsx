import HostingLayout from '@/components/layout/host/HostingLayout';
import TinyMCEInputNormal from '@/components/TinyMCEInputNormal';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import sanitizeData from '@/utils/sanitizeData';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Stack, Tab, Tabs, TextField, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const Description = ({ languagesData, propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  console.log('@selectedLang@', selectedLang);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm({ defaultValues: propertyData.propertyDescription });

  const formData = watch();

  useEffect(() => {
    setValue(`${selectedLang}.name`, formData[`${selectedLang}`]?.name || '');
    setValue(`${selectedLang}.description`, formData[`${selectedLang}`]?.description || '');
    setValue(`${selectedLang}.aboutPlace`, formData[`${selectedLang}`]?.aboutPlace || '');
    setValue(`${selectedLang}.placeIsGreatFor`, formData[`${selectedLang}`]?.placeIsGreatFor || '');
    setValue(`${selectedLang}.guestCanAccess`, formData[`${selectedLang}`]?.guestCanAccess || '');
    setValue(`${selectedLang}.interactionGuests`, formData[`${selectedLang}`]?.interactionGuests || '');
    setValue(`${selectedLang}.aboutNeighborhood`, formData[`${selectedLang}`]?.aboutNeighborhood || '');
    setValue(`${selectedLang}.getAround`, formData[`${selectedLang}`]?.getAround || '');
  }, [selectedLang, setValue]);

  const onSubmit = async () => {
    // Group the form data by language (e.g., en, bn)
    const groupedData = languagesData.reduce((acc, lang) => {
      const languageData = {};

      // Only add the field if it has data
      languageData.name = formData[`${lang.code}`]?.name;
      languageData.description = sanitizeData(formData[`${lang.code}`]?.description) || null;
      languageData.aboutPlace = sanitizeData(formData[`${lang.code}`]?.aboutPlace) || null;
      languageData.placeIsGreatFor = sanitizeData(formData[`${lang.code}`]?.placeIsGreatFor) || null;
      languageData.guestCanAccess = sanitizeData(formData[`${lang.code}`]?.guestCanAccess) || null;
      languageData.interactionGuests = sanitizeData(formData[`${lang.code}`]?.interactionGuests) || null;
      languageData.aboutNeighborhood = sanitizeData(formData[`${lang.code}`]?.aboutNeighborhood) || null;
      languageData.getAround = sanitizeData(formData[`${lang.code}`]?.getAround) || null;

      // If languageData has any data, add it to the grouped data
      if (Object.keys(languageData).length > 0) {
        acc[lang.code] = languageData;
      }
      return acc;
    }, {});

    console.log('Form Data Grouped by Language:', groupedData);
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/descriptions`, { groupedData });
      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/booking-settings?tab=space`);
      }
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating property description', error);
    } finally {
      setLoading(false);
    }
  };

  const onLanguageTabChange = (e, newValue) => {
    setSelectedLang(newValue);
  };

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};
  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {/* Sidebar */}
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ml: conditionalMarginLeft }}>
          <Box
            sx={{
              width: { xs: '100%', sm: '70%', lg: '50%' },
              mx: 'auto',
              pb: 10,
            }}
          >
            {/* Small device back button */}
            {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=space`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
              <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>}

            {/* Title */}
            <Box my={3} width={'100%'}>
              <Typography variant="h2" gutterBottom>
                Describe your place
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
                Tell guests what makes your property unique and welcoming.
              </Typography>
            </Box>

            {/* Languages Tab */}
            <Box sx={{ mb: 3 }}>
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

            <Stack gap={2} sx={{ width: '100%' }}>
              {/* Name */}
              <Box>
                <TextField
                  sx={[
                    (theme) => ({
                      width: '100%',
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
                  label={`Name (${selectedLang})`}
                  variant="outlined"
                  size="small"
                  {...register(`${selectedLang}.name`, { required: 'Name is required!' })}
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Box>

              {/* Description */}
              <Box>
                <Controller
                  name={`${selectedLang}.description`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Description (${selectedLang})`} min_height="100" key={selectedLang} />}
                />
              </Box>

              {/* About Place */}
              <Box>
                <Controller
                  name={`${selectedLang}.aboutPlace`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`About place (${selectedLang})`} min_height="100" />}
                />
              </Box>

              {/* Place is great for */}
              <Box>
                <Controller
                  name={`${selectedLang}.placeIsGreatFor`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Place is great for (${selectedLang})`} min_height="100" />}
                />
              </Box>

              {/* Guest Access */}
              <Box>
                <Controller
                  name={`${selectedLang}.guestCanAccess`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Guest Access (${selectedLang})`} min_height="100" />}
                />
              </Box>

              {/* Interaction with Guests */}
              <Box>
                <Controller
                  name={`${selectedLang}.interactionGuests`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Interaction with Guests (${selectedLang})`} min_height="100" />}
                />
              </Box>

              {/* About Neighborhood */}
              <Box>
                <Controller
                  name={`${selectedLang}.aboutNeighborhood`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`About Neighborhood (${selectedLang})`} min_height="100" />}
                />
              </Box>

              {/* Getting Around */}
              <Box>
                <Controller
                  name={`${selectedLang}.getAround`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Getting Around (${selectedLang})`} min_height="100" />}
                />
              </Box>
            </Stack>
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
            {propertyData.allStepsCompleted ? (
              <Box>
                <Button
                  type="submit"
                  size="small"
                  loading={loading}
                  loadingPosition="end"
                  startIcon={<SaveIcon size={17} />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'white' : 'black'),
                    color: (theme) => (theme.palette.mode === 'dark' ? 'black' : 'white'),
                    px: 2,
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                      bgcolor: 'divider',
                      color: 'common.white',
                    },
                  }}
                >
                  {trans('Save')}
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Button
                  component={Link}
                  href={`/host/property/${id}/edit/photos?tab=space`}
                  size="small"
                  startIcon={<ChevronsLeft />}
                  variant="outlined"
                  sx={[
                    (theme) => ({
                      textTransform: 'none',
                      px: 2,
                    }),
                    (theme) => theme.applyStyles('dark', {}),
                  ]}
                >
                  {trans('Back')}
                </Button>
                <Button
                  type="submit"
                  size="small"
                  loading={loading}
                  loadingPosition="end"
                  endIcon={<ChevronsRight />}
                  variant="contained"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    px: 2,
                    '&.Mui-disabled': {
                      pointerEvents: 'auto',
                      cursor: 'not-allowed',
                      bgcolor: 'divider',
                    },
                  }}
                >
                  {trans('Next')}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default Description;

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
    console.error('Error fetching property Data:', error);
    return {
      props: {
        languagesData: [],
        propertyData: [],
      },
    };
  }
}
