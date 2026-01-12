import HostingLayout from '@/components/layout/host/HostingLayout';
import TinyMCEInputNormal from '@/components/TinyMCEInputNormal';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, IconButton, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Sidebar from '../../Sidebar';

const Directions = ({ languagesData, propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { ...propertyData?.propertyRulesAndManual?.rulesAndManuals },
  });

  const formData = watch();

  useEffect(() => {
    setValue(`${selectedLang}.directions`, formData[`${selectedLang}`]?.directions || '');
  }, [selectedLang, setValue]);

  const onSubmit = async () => {
    const Translations = languagesData.reduce((acc, lang) => {
      const languageData = {};

      languageData.directions = formData[`${lang.code}`]?.directions || '';

      if (Object.keys(languageData).length > 0) {
        acc[lang.code] = languageData;
      }
      return acc;
    }, {});
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/property-rules`, { Translations });
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error updating house rules', error);
    } finally {
      setLoading(false);
    }
  };

  const onLanguageTabChange = (e, newValue) => {
    setSelectedLang(newValue);
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate py={2}>
          {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}

          <Box sx={{ ml: { md: '400px' } }}>
            <Box
              sx={{
                width: { xs: '100%', sm: '70%', lg: '50%' },
                mx: 'auto',
              }}
            >
              {/* Small device back button */}
              {propertyData.allStepsCompleted && <Box component={Link} href={`/host/property/${id}?tab=arrival`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
                <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>}
              {/* Title */}
              <Box my={3} width="100%">
                <Typography variant="h2" gutterBottom>
                  Directions
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
                  Share how guests can reach your place, including parking and public transit tips.
                </Typography>
              </Box>

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
                  name={`${selectedLang}.directions`}
                  control={control}
                  render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`Directions (${selectedLang})`} min_height="100" key={selectedLang} />}
                />
              </Box>
            </Box>
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

export default Directions;

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
