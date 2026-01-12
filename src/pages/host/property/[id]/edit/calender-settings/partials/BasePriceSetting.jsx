import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { mutate } from 'swr';

const BasePriceSetting = ({ propertyData }) => {
  const { trans, lang } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const { activeCurrency, guestFee, hostFee } = useReluxRentAppContext();
  const [guestFeeTotal, setGuestFeeTotal] = useState(0);
  const [hostFeeTotal, setHostFeeTotal] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currencyId: propertyData?.propertyPrice?.currency?.id || activeCurrency?.id,
      price: propertyData?.propertyPrice?.price || 0,
      cleaningFee: propertyData?.propertyPrice?.cleaningFee || 0,
      guestAfter: propertyData?.propertyPrice?.guestAfter || propertyData?.accommodates,
      guestAfterFee: propertyData?.propertyPrice?.guestAfterFee || 0,
    },
  });

  const watchPrice = watch('price');

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data, status } = await api.put(`/api/host/property/${id}/update/price`, formData);
      mutate(`/api/host/property/${id}?lang=${lang}`)
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

  return (
    <Box>
      {/* Pricing Box */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={[
          (theme) => ({
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }),
        ]}
      >
        {/* Price Input */}
        <Box sx={{ width: '100%', mx: 'auto' }}>
          <Controller
            name="price"
            control={control}
            render={({ field }) => {
              const hasValue = field.value !== undefined && field.value !== null && field.value !== 0 && field.value !== '';
              const currencySymbol = propertyData?.propertyPrice?.currency?.symbol || '';

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
          {/* Guest Accordion */}
          <Accordion
            sx={[
              (theme) => ({
                width: '100%',
                bgcolor: theme.palette.common.white,
                borderRadius: '4px',
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
                {propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol}
                {(Number(watchPrice) + Number(guestFeeTotal)).toFixed(2)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 1 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontSize={14}>Base price</Typography>
                <Typography fontWeight="bold">
                  {propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol}
                  {watchPrice}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontSize={14}>Guest service fee</Typography>
                <Typography fontWeight="bold">
                  {propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol} {guestFeeTotal}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: '#555', my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography fontSize={14}>Total</Typography>
                <Typography fontWeight="bold">
                  {propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol}
                  {Number(watchPrice) + Number(guestFeeTotal)}
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
                borderRadius: '4px',
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
                {propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol}
                {Number(watchPrice) - Number(hostFeeTotal)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 1 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontSize={14}>Base price</Typography>
                <Typography fontWeight="bold">
                  {propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol}
                  {watchPrice}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontSize={14}>Host service fee</Typography>
                <Typography fontWeight="bold">
                  -{propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol}
                  {hostFeeTotal}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: '#555', my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography fontSize={14}>Total</Typography>
                <Typography fontWeight="bold">
                  {propertyData?.propertyPrice?.currency?.symbol || activeCurrency?.symbol}
                  {Number(watchPrice) - Number(hostFeeTotal)}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Button
          type="submit"
          sx={{
            width: '100%',
            textTransform: 'none',
          }}
          variant="contained"
          color="primary"
          size="small"
        >
          {trans('Save')}
        </Button>
      </Box>
    </Box>
  );
};

export default BasePriceSetting;
