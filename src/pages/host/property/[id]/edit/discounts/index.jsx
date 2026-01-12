import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import MonthlyPriceSettings from '../../../partials/MonthlyPriceSettings';
import WeeklyPriceSettings from '../../../partials/WeeklyPriceSettings';
import Sidebar from '../../Sidebar';

const Discounts = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      weeklyDiscount: propertyData?.propertyPrice?.weeklyDiscount || 0,
      monthlyDiscount: propertyData?.propertyPrice?.monthlyDiscount || 0,
    },
  });

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/discounts`, formData);
      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/cancellation-policy?tab=space`);
      }
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating property discounts', error);
    } finally {
      setLoading(false);
    }
  };

  // const { totalGuestFee, totalHostFee, guestTotal, hostTotal } = calculateFees(dailyBasePrice);

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {/* Sidebar */}
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ml: conditionalMarginLeft }}>
          <Box
            sx={{
              width: { xs: '100%', sm: '70%', md: '50%', xl: '30%' },
              mx: 'auto',
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
                Set Discounts
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
                Set discounts for weekly, monthly to attract more bookings.
              </Typography>
            </Box>

            <Stack gap={2}>
              {/* Weekly Discount Accordion*/}
              <Accordion
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                  borderRadius: 1,
                  color: 'common.black',
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  '&::before': {
                    display: 'none',
                  },
                }}
                disableGutters
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
                  sx={{
                    minHeight: 0,
                    padding: 0,
                    '& .MuiAccordionSummary-content': {
                      margin: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                    },
                  }}
                >
                  <Box sx={{ p: 2, width: '100%' }}>
                    <Stack width="100%" direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                      <Typography variant="subtitle1">Weekly Discount</Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0}
                        border="1px solid"
                        borderColor="divider"
                        borderRadius={0.5}
                        pr={1}
                        py={0.5}
                        sx={{
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                        }}
                      >
                        <Controller
                          name="weeklyDiscount"
                          control={control}
                          render={({ field }) => (
                            <Box
                              component="input"
                              type="number"
                              {...field}
                              min={0}
                              max={100}
                              step={1}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              value={field.value ?? 0}
                              sx={{
                                textAlign: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 500,
                                width: '40px',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                  WebkitAppearance: 'none',
                                  margin: 0,
                                },
                              }}
                            />
                          )}
                        />
                        <Typography variant="h5" fontWeight={500}>
                          %
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body2">Average for a 7-nights stay</Typography>
                  </Box>
                </AccordionSummary>
                <Divider />
                <AccordionDetails sx={{ p: 1 }}>
                  <Controller
                    name="weeklyDiscount"
                    control={control}
                    render={({ field }) => <WeeklyPriceSettings currency={propertyData?.propertyPrice?.currency} basePrice={propertyData?.propertyPrice?.price} {...field} />}
                  />
                </AccordionDetails>
              </Accordion>
              {/* Monthly Discount Accordion */}
              <Accordion
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
                  borderRadius: 1,
                  color: 'common.black',
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  '&::before': {
                    display: 'none',
                  },
                }}
                disableGutters
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
                  sx={{
                    minHeight: 0,
                    padding: 0,
                    '& .MuiAccordionSummary-content': {
                      margin: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                    },
                  }}
                >
                  <Box sx={{ p: 1.5, width: '100%' }}>
                    <Stack width="100%" direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                      <Typography variant="subtitle1">{trans('Monthly Discount')}</Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0}
                        border="1px solid"
                        borderColor="divider"
                        borderRadius={0.5}
                        pr={1}
                        py={0.5}
                        sx={{
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                        }}
                      >
                        <Controller
                          name="monthlyDiscount"
                          control={control}
                          render={({ field }) => (
                            <Box
                              component="input"
                              type="number"
                              {...field}
                              min={0}
                              max={100}
                              step={1}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              value={field.value ?? 0}
                              sx={{
                                textAlign: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 500,
                                width: '40px',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                  WebkitAppearance: 'none',
                                  margin: 0,
                                },
                              }}
                            />
                          )}
                        />
                        <Typography variant="h5" fontWeight={500}>
                          %
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body2">{trans('Average for a 28-nights stay')}</Typography>
                  </Box>
                </AccordionSummary>
                <Divider />
                <AccordionDetails sx={{ p: 1 }}>
                  <Controller
                    name="monthlyDiscount"
                    control={control}
                    render={({ field }) => <MonthlyPriceSettings currency={propertyData?.propertyPrice?.currency} basePrice={propertyData?.propertyPrice?.price} {...field} />}
                  />
                </AccordionDetails>
              </Accordion>
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
                <Box>
                  <Button
                    type="submit"
                    size="small"
                    loading={loading}
                    loadingPosition="end"
                    startIcon={<SaveIcon size={17} />}
                    sx={{
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
                  href={`/host/property/${id}/edit/price`}
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

export default Discounts;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [propertyData] = await Promise.all([api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || [])]);

    return {
      props: {
        propertyData,
      },
    };
  } catch (error) {
    // Handle other errors (e.g., network, server errors)
    console.error('Error fetching space types:', error);
    return {
      props: {
        propertyData: [],
      },
    };
  }
}
