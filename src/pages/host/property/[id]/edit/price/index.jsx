import HostingLayout from '@/components/layout/host/HostingLayout';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, IconButton, Paper, Popover, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { ChevronsLeft, ChevronsRight, Minus, Plus, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import Sidebar from '../../Sidebar';

const Price = ({ propertyData }) => {
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [openChooseCurrencyPopover, setOpenChooseCurrencyPopover] = useState(false);
  const [chooseCurrencyAnchorEl, setChooseCurrencyAnchorEl] = useState();

  const { activeCurrency, allCurrency, guestFee, hostFee } = useReluxRentAppContext();
  const [guestFeeTotal, setGuestFeeTotal] = useState(0);
  const [hostFeeTotal, setHostFeeTotal] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState(propertyData?.propertyPrice?.currency || activeCurrency);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currencyId: selectedCurrency?.id,
      price: propertyData?.propertyPrice?.price || 0,
      cleaningFee: propertyData?.propertyPrice?.cleaningFee || 0,
      guestAfter: propertyData?.propertyPrice?.guestAfter || propertyData?.accommodates,
      guestAfterFee: propertyData?.propertyPrice?.guestAfterFee || 0,
    },
  });

  const watchPrice = watch('price');
  const watchGuestAfter = watch('guestAfter');
  const watchCleaningFee = Number(watch('cleaningFee') || 0);
  const watchGuestAfterFee = Number(watch('guestAfterFee') || 0);

  const totalAdditionalCharges = (watchCleaningFee + watchGuestAfterFee).toFixed(2);

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px' } : {};

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/price`, formData);
      if (status == 201 && !propertyData.allStepsCompleted) {
        router.push(`/host/property/${id}/edit/discounts?tab=space`);
      }
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error creating property price', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateFees(watchPrice);
  }, [watchPrice]);

  const calculateFees = (price) => {
    const totalGuestFee = Number(((price / 100) * guestFee).toFixed(2));
    const totalHostFee = Number(((price / 100) * hostFee).toFixed(2));

    setGuestFeeTotal(totalGuestFee);
    setHostFeeTotal(totalHostFee);
  };

  const onChooseCurrencyAnchorEl = (e) => {
    setChooseCurrencyAnchorEl(e.currentTarget);
    setOpenChooseCurrencyPopover(true);
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
              width: { xs: '100%', sm: '70%', xl: '30%' },
              mx: 'auto',
            }}
          >
            {/* Small device back button */}
            {propertyData.allStepsCompleted && (
              <Box component={Link} href={`/host/property/${id}?tab=space`} color={'text.primary'} sx={{ p: 0, display: { md: 'none' } }}>
                <IconButton color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            )}
            {/* Title */}
            <Box my={3} width={'100%'}>
              <Typography variant="h2" gutterBottom>
                Now, set a base price
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
                Don't worry! You can update it anytime.
              </Typography>
            </Box>

            {/* Pricing Box */}
            <Box
              sx={[
                (theme) => ({
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }),
              ]}
            >
              <Box sx={{ width: '100%', mx: 'auto' }}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => {
                    const hasValue = field.value !== undefined && field.value !== null && field.value !== 0 && field.value !== '';
                    const currencySymbol = selectedCurrency?.symbol || '';

                    return (
                      <Box sx={{ position: 'relative', width: '100%' }}>
                        {/* Centered Symbol when Empty */}
                        {!hasValue && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '2rem',
                              fontWeight: 'bold',
                              color: 'text.primary',
                              pointerEvents: 'none',
                              zIndex: 1,
                              pr: 6,
                            }}
                          >
                            {currencySymbol}
                          </Box>
                        )}

                        {/* Input */}
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) => field.onChange(values.floatValue ?? '')}
                          customInput={TextField}
                          thousandSeparator
                          decimalScale={2}
                          variant="standard"
                          prefix={hasValue ? currencySymbol : ''}
                          sx={{
                            width: '100%',
                            '& .MuiInputBase-root': {
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'relative',
                              zIndex: 2,
                            },
                            '& .MuiInputBase-input': {
                              textAlign: 'center',
                              fontSize: '2rem',
                              fontWeight: 'bold',
                              color: 'text.primary',
                              padding: 0,
                            },
                            '& .MuiInputBase-root:before, & .MuiInputBase-root:after': {
                              borderBottom: 'none !important',
                            },
                          }}
                        />
                      </Box>
                    );
                  }}
                />
              </Box>

              {/* Base currency */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>
                  {trans('Base currency')}
                </Typography>

                <Typography onClick={(e) => !propertyData.allStepsCompleted && onChooseCurrencyAnchorEl(e)} variant="subtitle2" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                  {selectedCurrency?.code} - {selectedCurrency?.symbol}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                {/* Guest Accordion */}
                <Accordion
                  sx={[
                    (theme) => ({
                      width: '100%',
                      bgcolor: theme.palette.common.white,
                      borderRadius: 1,
                      color: theme.palette.common.black,
                      border: '1px solid',
                      borderColor: theme.palette.grey[300],
                      overflow: 'hidden',
                      px: 2.5,
                      py: 2,
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
                      '& .MuiAccordionSummary-content': {
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Guest price before taxes
                    </Typography>
                    <Typography fontWeight="bold">
                      {selectedCurrency?.symbol}
                      {(Number(watchPrice) + Number(guestFeeTotal)).toFixed(2)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 1 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography fontSize={14}>Base price</Typography>
                      <Typography fontWeight="bold">
                        {selectedCurrency?.symbol}
                        {watchPrice}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography fontSize={14}>Guest service fee</Typography>
                      <Typography fontWeight="bold">
                        {selectedCurrency?.symbol} {guestFeeTotal}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#555', my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography fontSize={14}>Total</Typography>
                      <Typography fontWeight="bold">
                        {selectedCurrency?.symbol}
                        {(Number(watchPrice) + Number(guestFeeTotal)).toFixed(2)}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                {/* Host Accordion */}
                <Accordion
                  sx={[
                    (theme) => ({
                      width: '100%',
                      bgcolor: theme.palette.common.white,
                      borderRadius: 1,
                      color: theme.palette.common.black,
                      border: '1px solid',
                      borderColor: theme.palette.grey[300],
                      overflow: 'hidden',
                      px: 2.5,
                      py: 2,
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
                      '& .MuiAccordionSummary-content': {
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      You earn
                    </Typography>
                    <Typography fontWeight="bold">
                      {selectedCurrency?.symbol}
                      {Number(watchPrice) - Number(hostFeeTotal)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 1 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography fontSize={14}>Base price</Typography>
                      <Typography fontWeight="bold">
                        {selectedCurrency?.symbol}
                        {watchPrice}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography fontSize={14}>Host service fee</Typography>
                      <Typography fontWeight="bold">
                        -{selectedCurrency?.symbol}
                        {hostFeeTotal}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#555', my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography fontSize={14}>Total</Typography>
                      <Typography fontWeight="bold">
                        {selectedCurrency?.symbol}
                        {Number(watchPrice) - Number(hostFeeTotal)}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                {/* Additional Charges Accordion */}
                <Accordion
                  sx={[
                    (theme) => ({
                      width: '100%',
                      bgcolor: theme.palette.common.white,
                      borderRadius: 1,
                      color: theme.palette.common.black,
                      border: '1px solid',
                      borderColor: theme.palette.grey[300],
                      overflow: 'hidden',
                      px: 2.5,
                      py: 2,
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
                      '& .MuiAccordionSummary-content': {
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Additional charges
                    </Typography>
                    <Typography fontWeight="bold">
                      {selectedCurrency?.symbol}
                      {totalAdditionalCharges}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 1 }}>
                    {/* Cleaning fee */}
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        Cleaning fee
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mb: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="body2" mb={0.5}>
                          Per stay
                        </Typography>
                        <Controller
                          name="cleaningFee"
                          control={control}
                          render={({ field }) => {
                            const hasValue = field.value !== undefined && field.value !== null && field.value !== 0 && field.value !== '';
                            const currencySymbol = selectedCurrency?.symbol || '';

                            return (
                              <Box sx={{ position: 'relative', width: '100%' }}>
                                {/* Centered Symbol when Empty */}
                                {!hasValue && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: '50%',
                                      top: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      fontSize: '2rem',
                                      fontWeight: 'bold',
                                      color: 'text.primary',
                                      pointerEvents: 'none',
                                      zIndex: 1,
                                      pr: 6,
                                    }}
                                  >
                                    {currencySymbol}
                                  </Box>
                                )}

                                {/* Input */}
                                <NumericFormat
                                  value={field.value}
                                  onValueChange={(values) => field.onChange(values.floatValue ?? '')}
                                  customInput={TextField}
                                  thousandSeparator
                                  decimalScale={2}
                                  variant="standard"
                                  prefix={hasValue ? currencySymbol : ''}
                                  sx={{
                                    width: '100%',
                                    '& .MuiInputBase-root': {
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      position: 'relative',
                                      zIndex: 2,
                                    },
                                    '& .MuiInputBase-input': {
                                      textAlign: 'center',
                                      fontSize: '2rem',
                                      fontWeight: 'bold',
                                      color: 'text.primary',
                                      padding: 0,
                                    },
                                    '& .MuiInputBase-root:before, & .MuiInputBase-root:after': {
                                      borderBottom: 'none !important',
                                    },
                                  }}
                                />
                              </Box>
                            );
                          }}
                        />
                      </Paper>
                    </Box>
                    {/* Extra guest fee */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        {trans('Extra guest fee')}
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack
                          sx={{
                            width: '100%',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Controller
                            name="guestAfter"
                            control={control}
                            render={({ field }) => (
                              <CounterRow
                                onChange={(e) => {
                                  field.onChange(e);
                                }}
                                label="For each guest after"
                                value={field.value}
                              />
                            )}
                          />{' '}
                          <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                            <Typography variant="body2" textAlign={'center'} mb={0.5}>
                              After {watchGuestAfter} guest, per night
                            </Typography>
                            <Controller
                              name="guestAfterFee"
                              control={control}
                              render={({ field }) => {
                                const hasValue = field.value !== undefined && field.value !== null && field.value !== 0 && field.value !== '';
                                const currencySymbol = selectedCurrency?.symbol || '';

                                return (
                                  <Box sx={{ position: 'relative', width: '100%' }}>
                                    {/* Centered Symbol when Empty */}
                                    {!hasValue && (
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          left: '50%',
                                          top: '50%',
                                          transform: 'translate(-50%, -50%)',
                                          fontSize: '2rem',
                                          fontWeight: 'bold',
                                          color: 'text.primary',
                                          pointerEvents: 'none',
                                          zIndex: 1,
                                          pr: 6,
                                        }}
                                      >
                                        {currencySymbol}
                                      </Box>
                                    )}

                                    {/* Input */}
                                    <NumericFormat
                                      value={field.value}
                                      onValueChange={(values) => field.onChange(values.floatValue ?? '')}
                                      customInput={TextField}
                                      thousandSeparator
                                      decimalScale={2}
                                      variant="standard"
                                      prefix={hasValue ? currencySymbol : ''}
                                      sx={{
                                        width: '100%',
                                        '& .MuiInputBase-root': {
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          position: 'relative',
                                          zIndex: 2,
                                        },
                                        '& .MuiInputBase-input': {
                                          textAlign: 'center',
                                          fontSize: '2rem',
                                          fontWeight: 'bold',
                                          color: 'text.primary',
                                          padding: 0,
                                        },
                                        '& .MuiInputBase-root:before, & .MuiInputBase-root:after': {
                                          borderBottom: 'none !important',
                                        },
                                      }}
                                    />
                                  </Box>
                                );
                              }}
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    </Box>
                  </AccordionDetails>
                </Accordion>
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
            {propertyData.allStepsCompleted ? (
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
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <Button
                  component={Link}
                  href={`/host/property/${id}/edit/booking-settings`}
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

        {/* Choose Currency Popover */}
        <Popover
          open={openChooseCurrencyPopover}
          anchorEl={chooseCurrencyAnchorEl}
          onClose={() => setOpenChooseCurrencyPopover(false)}
          sx={{ p: 2 }}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
        >
          <Box height={{ xs: '630px', xl: '700px' }}>
            <Typography variant="body1" textAlign={'center'} fontWeight={500} p={1}>
              Choose Currency
            </Typography>
            <Divider />
            <Stack gap={1} padding={2}>
              {allCurrency.map((option, i) => (
                <Stack
                  direction={'row'}
                  onClick={() => {
                    (setSelectedCurrency(option), setValue('currencyId', option.id));
                  }}
                  justifyContent={'space-between'}
                  gap={2}
                  padding={1}
                  border={'1px solid'}
                  borderColor={selectedCurrency.id == option.id ? 'primary.main' : 'divider'}
                  borderRadius={1}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  key={i}
                >
                  <Typography variant="body2" fontWeight={selectedCurrency.id == option.id ? 600 : 300}>
                    {option.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={selectedCurrency.id == option.id ? 600 : 300} color="text.secondary">
                    {option.code}-{option.symbol}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Popover>
      </Box>
    </HostingLayout>
  );
};

export default Price;

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

const CounterRow = ({ label, value, onChange, min = 0, max = Infinity }) => {
  const [inputValue, setInputValue] = useState(value || 0);

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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: { xs: 'center' },
        width: { xs: '100%', sm: '50%' },
      }}
    >
      <Typography variant="body2">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          <Minus size={23} />
        </IconButton>
        <Typography fontSize={{ xs: 32 }} fontWeight={700}>
          {inputValue}
        </Typography>
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
          onClick={onIncrement}
        >
          <Plus size={23} />
        </IconButton>
      </Box>
    </Box>
  );
};
