import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, IconButton, InputAdornment, InputBase, Paper, Stack, Typography } from '@mui/material';
import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { mutate } from 'swr';
import MonthlyPriceSettings from '../../../../partials/MonthlyPriceSettings';
import WeeklyPriceSettings from '../../../../partials/WeeklyPriceSettings';
import BasePriceSetting from './BasePriceSetting';

const PriceSettings = ({ propertyDataState }) => {
  const { trans, lang } = useTranslation();
  const { activeCurrency } = useReluxRentAppContext();
  const [cleaningFee, setCleaningFee] = useState(propertyDataState?.propertyPrice?.cleaningFee || 0);
  const [guestAfterFee, setGuestAfterFee] = useState(propertyDataState?.propertyPrice?.guestAfterFee || 0);
  const [guestCount, setGuestCount] = useState(propertyDataState?.propertyPrice?.guestAfter || propertyDataState?.accommodates);
  const [weeklyDiscountValue, setWeeklyDiscountValue] = useState(propertyDataState?.propertyPrice?.weeklyDiscount || 0);
  const [monthlyDiscountValue, setMonthlyDiscountValue] = useState(propertyDataState?.propertyPrice?.monthlyDiscount || 0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  async function onUpdateWeeklyAndMonthlyDiscount() {
    try {
      setLoading(true);

      const payload = {
        weeklyDiscount: weeklyDiscountValue,
        monthlyDiscount: monthlyDiscountValue,
      };

      const { data, status } = await api.put(`/api/host/property/${id}/update/discounts`, payload);
      mutate(`/api/host/property/${id}?lang=${lang}`);
      enqueueSnackbar(data.message, {
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating property discounts', error);
      enqueueSnackbar('Failed to update weekly discount', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function onUpdateAdditionalCharges() {
    try {
      setLoading(true);

      const payload = {
        cleaningFee: cleaningFee,
        guestAfter: guestCount,
        guestAfterFee: guestAfterFee,
      };

      const { data, status } = await api.put(`/api/host/property/${id}/update/price`, payload);

      enqueueSnackbar(data.message, {
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating property discounts', error);
      enqueueSnackbar('Failed to update weekly discount', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        width: { xs: '100%' },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        fontFamily: 'sans-serif',
        bgcolor: 'background.primary',
      }}
    >
      <Box sx={{ maxWidth: 400, mx: 'auto', p: 2, fontFamily: 'Roboto, sans-serif' }}>
        {/* Title */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {trans('Price settings')}
        </Typography>

        {/* Subtitle */}
        <Typography variant="body2" color="text.secondary" mb={3}>
          These apply to all nights, unless you customize them by date.
        </Typography>

        {/* Base currency */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {trans('Base currency')}
          </Typography>

          <Typography variant="subtitle2" sx={{ cursor: 'pointer' }}>
            {propertyDataState?.propertyPrice?.currency?.code} - ({propertyDataState?.propertyPrice?.currency?.symbol})
          </Typography>
        </Box>

        {/* Base Price Section */}
        <BasePriceSetting propertyData={propertyDataState} />

        <Divider sx={{ my: 2 }} />
        {/* Discounts Section */}
        <Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {trans('Discounts')}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {trans('Adjust your pricing to attract more guests.')}
            </Typography>
          </Box>

          <Stack gap={2}>
            {/* Weekly Discount Accordion*/}
            <Accordion
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '12px',
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
                    <Typography variant="subtitle1">{trans('Weekly Discount')}</Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '10px',
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      {weeklyDiscountValue}%
                    </Typography>
                  </Stack>
                  <Typography variant="body2">{trans('Average for a 7-nights stay')}</Typography>
                </Box>
              </AccordionSummary>
              <Divider />
              <AccordionDetails sx={{ p: 2 }}>
                <WeeklyPriceSettings
                  currency={propertyDataState?.propertyPrice?.currency}
                  basePrice={propertyDataState?.propertyPrice?.price}
                  value={weeklyDiscountValue}
                  onChange={(e) => setWeeklyDiscountValue(e)}
                />
                <Button
                  sx={{
                    width: '100%',
                    textTransform: 'none',
                    mt: 1.5,
                  }}
                  onClick={() => onUpdateWeeklyAndMonthlyDiscount()}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {trans('Save')}
                </Button>
              </AccordionDetails>
            </Accordion>
            {/* Monthly Discount Accordion */}
            <Accordion
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '12px',
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
                    <Typography
                      variant="h5"
                      sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '10px',
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      {monthlyDiscountValue}%
                    </Typography>
                  </Stack>
                  <Typography variant="body2">{trans('Average for a 28-nights stay')}</Typography>
                </Box>
              </AccordionSummary>
              <Divider />
              <AccordionDetails sx={{ p: 2 }}>
                <MonthlyPriceSettings
                  currency={propertyDataState?.propertyPrice?.currency}
                  basePrice={propertyDataState?.propertyPrice?.price}
                  value={monthlyDiscountValue}
                  onChange={(e) => setMonthlyDiscountValue(e)}
                />
                <Button
                  onClick={() => onUpdateWeeklyAndMonthlyDiscount()}
                  sx={{
                    width: '100%',
                    textTransform: 'none',
                    mt: 1.5,
                  }}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {trans('Save')}
                </Button>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Additional charges Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {trans('Additional charges')}
          </Typography>

          <Box>
            {/* Cleaning fee */}
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {trans('Cleaning fee')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 1 }}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  {trans('Per stay')}
                </Typography>
                <Box>
                  <InputBase
                    type="number"
                    value={cleaningFee}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setCleaningFee(''); // keep it empty
                      } else {
                        setCleaningFee(Number(value));
                      }
                    }}
                    startAdornment={
                      <InputAdornment position="start"
                        sx={[
                          (theme) => ({
                            '& .MuiTypography-root': {
                              fontSize: theme.typography.h3.fontSize,
                              color: theme.palette.common.black,
                              fontWeight: 'bold',
                            },
                          }),
                          (theme) =>
                            theme.applyStyles('dark', {
                              '& .MuiTypography-root': {
                                color: theme.palette.common.white,
                              },
                            }),
                        ]}
                      >
                        {propertyDataState?.propertyPrice?.currency?.symbol}
                      </InputAdornment>
                    }
                    sx={[
                      (theme) => ({
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: 'bold',
                        width: '120px',
                        '& input': {
                          textAlign: 'start',
                          padding: '0',
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                        '& input[type=number]::-webkit-outer-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]::-webkit-inner-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      }),
                      (theme) => theme.applyStyles('dark', {}),
                    ]}
                    inputProps={{ min: 0 }}
                  />
                </Box>
                <Button
                  onClick={() => onUpdateAdditionalCharges()}
                  sx={{
                    width: '100%',
                    textTransform: 'none',
                    mt: 1.5,
                  }}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {trans('Save')}
                </Button>
              </Paper>
            </Box>

            {/* Extra guest fee */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {trans('Extra guest fee')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  {trans('After 1 guest, per night')}
                </Typography>
                <Box>
                  <InputBase
                    type="number"
                    value={guestAfterFee}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setGuestAfterFee('');
                      } else {
                        setGuestAfterFee(Number(value));
                      }
                    }}
                    startAdornment={
                      <InputAdornment position="start"
                        sx={[
                          (theme) => ({
                            '& .MuiTypography-root': {
                              fontSize: theme.typography.h3.fontSize,
                              color: theme.palette.common.black,
                              fontWeight: 'bold',
                            },
                          }),
                          (theme) =>
                            theme.applyStyles('dark', {
                              '& .MuiTypography-root': {
                                color: theme.palette.common.white,
                              },
                            }),
                        ]}
                      >
                        {propertyDataState?.propertyPrice?.currency?.symbol}
                      </InputAdornment>
                    }
                    sx={[
                      (theme) => ({
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: 'bold',
                        width: '120px',
                        '& input': {
                          textAlign: 'start',
                          padding: '0',
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                        '& input[type=number]::-webkit-outer-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]::-webkit-inner-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      }),
                      (theme) => theme.applyStyles('dark', {}),
                    ]}
                    inputProps={{ min: 0 }}
                  />
                </Box>
                <CounterRow
                  value={guestCount}
                  onChange={(e) => {
                    setGuestCount(e);
                  }}
                  label="For each guest after"
                />
                <Button
                  onClick={() => onUpdateAdditionalCharges()}
                  sx={{
                    width: '100%',
                    textTransform: 'none',
                    mt: 1.5,
                  }}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {trans('Save')}
                </Button>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CounterRow = ({ label, value, onChange, min, max }) => {
  const [inputValue, setInputValue] = useState(value || 0);

  const onIncrement = () => {
    setInputValue(inputValue + 1);
    onChange(inputValue + 1);
  };
  const onDecrement = () => {
    setInputValue(inputValue - 1);
    onChange(inputValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: { xs: '100%' },
        py: 2,
      }}
    >
      <Typography variant="subtitle1">{label}</Typography>
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
          disabled={inputValue <= 0}
        >
          <Minus size={16} />
        </IconButton>
        <Typography>{inputValue}</Typography>
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
          <Plus size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PriceSettings;
