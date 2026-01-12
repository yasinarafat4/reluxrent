import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography } from '@mui/material';
import Slider from '@mui/material/Slider';
import { forwardRef, useEffect, useState } from 'react';

const MonthlyPriceSettings = forwardRef(({ currency, basePrice = 0, value, onChange }, ref) => {
  const { trans } = useTranslation();
  const { activeCurrency, guestFee, hostFee } = useReluxRentAppContext();
  const [monthlyDiscountedPrice, setMonthlyDiscountedPrice] = useState(Math.round(basePrice * 28).toFixed(2));

  const [sliderValue, setSliderValue] = useState(value ?? 0);

  useEffect(() => {
    // sync local slider with parent
    if (value !== undefined) {
      setSliderValue(value);
      const monthlyBasePrice = Math.round(basePrice * 28).toFixed(2);
      const percent = (monthlyBasePrice * value) / 100;
      setMonthlyDiscountedPrice(Math.round(monthlyBasePrice - percent).toFixed(2));
    }
  }, [value, basePrice]);

  const handleChange = (_, newValue) => {
    setSliderValue(newValue);
    onChange(newValue);
    const monthlyBasePrice = Math.round(basePrice * 28).toFixed(2);
    const percent = (monthlyBasePrice * newValue) / 100;
    setMonthlyDiscountedPrice(Math.round(monthlyBasePrice - percent).toFixed(2));
  };

  const calculateFees = (price) => {
    const totalGuestFee = Math.round((price / 100) * guestFee).toFixed(2);
    const totalHostFee = Math.round((price / 100) * hostFee).toFixed(2);
    return {
      totalGuestFee,
      totalHostFee,
      guestTotal: Math.round(Number(price) + Number(totalGuestFee)).toFixed(2),
      hostTotal: Math.round(Number(price) - Number(totalHostFee)).toFixed(2),
    };
  };

  const { totalGuestFee, totalHostFee, guestTotal, hostTotal } = calculateFees(monthlyDiscountedPrice);

  return (
    <Box>
      {/* Pricing Box */}
      <Box
        sx={[
          (theme) => ({
            bgcolor: theme.palette.common.white,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }),
          (theme) =>
            theme.applyStyles('dark', {
              bgcolor: theme.palette.grey[900],
              color: theme.palette.common.white,
            }),
        ]}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={(theme) => ({ fontSize: theme.typography.h3.fontSize, fontWeight: 'bold' })}>
            {currency?.symbol || activeCurrency?.symbol} {monthlyDiscountedPrice}
          </Typography>

          <Box width={'100%'} px={2}>
            <Slider step={1} min={0} max={99} value={sliderValue} valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}%`} onChange={handleChange} sx={{ p: 0 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontSize={14}>0%</Typography>
              <Typography fontSize={14}>99%</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, gap: 2, width: '100%' }}>
          {[
            {
              label: 'Guest price before taxes',
              total: guestTotal,
              fee: totalGuestFee,
              isGuest: true,
            },
            {
              label: 'You earn',
              total: hostTotal,
              fee: totalHostFee,
              isGuest: false,
            },
          ].map(({ label, total, fee, isGuest }) => (
            <Accordion
              key={label}
              sx={[
                (theme) => ({
                  bgcolor: theme.palette.common.white,
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: theme.palette.grey[300],
                  overflow: 'hidden',
                  p: 2,
                  '&::before': { display: 'none' },
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
                <Typography fontSize={14}>{label}</Typography>
                <Typography fontWeight="bold">
                  {currency?.symbol || activeCurrency?.symbol} {total}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography fontSize={14}>Base price</Typography>
                  <Typography fontWeight="bold">
                    {currency?.symbol || activeCurrency?.symbol} {monthlyDiscountedPrice}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography fontSize={14}>{isGuest ? 'Guest service fee' : 'Host service fee'}</Typography>
                  <Typography fontWeight="bold">{isGuest ? `${currency?.symbol || activeCurrency?.symbol}  ${fee}` : `-${currency?.symbol || activeCurrency?.symbol}  ${fee}`}</Typography>
                </Box>
                <Divider sx={{ borderColor: '#555', my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography fontSize={14}>Total</Typography>
                  <Typography fontWeight="bold">
                    {currency?.symbol || activeCurrency?.symbol} {total}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

export default MonthlyPriceSettings;
