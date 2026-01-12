import { Box, Divider, InputAdornment, Stack, Typography } from '@mui/material';
import { User } from 'lucide-react';
import { useState } from 'react';
import { AutocompleteInput, NumberInput, ReferenceInput, required, SaveButton, SimpleForm, TopToolbar, useDataProvider, useGetList, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const PricingTabToolbar = () => {
  const {
    watch,
    getValues,
    handleSubmit,
    formState: { isValid },
  } = useFormContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const record = useRecordContext();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!record) return;

    const formValues = getValues();
    setLoading(true);
    try {
      await dataProvider.update('properties/pricing', {
        id: record.id,
        data: {
          price: formValues.propertyPrice.price,
          currencyCode: formValues.propertyPrice.currencyCode,
          weeklyDiscount: formValues.propertyPrice.weeklyDiscount,
          monthlyDiscount: formValues.propertyPrice.monthlyDiscount,
          cleaningFee: formValues.propertyPrice.cleaningFee,
          guestAfter: formValues.propertyPrice.guestAfter,
          guestAfterFee: formValues.propertyPrice.guestAfterFee,
        },
      });

      notify('Pricing updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating pricing', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <TopToolbar>
      <SaveButton alwaysEnable type="button" label="Update Pricing" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};

const PricingFields = () => {
  const { watch } = useFormContext();
  const selectedCurrencyId = watch('propertyPrice.currencyId');

  const { data: currencies } = useGetList('currencies', { sort: { field: 'id', order: 'ASC' } });
  const selectedCurrency = currencies?.find((c) => c.id === selectedCurrencyId);
  const currencySymbol = selectedCurrency?.code || 'USD';

  return (
    <Box className="w-full">
      <Divider component="div" role="presentation">
        <Typography variant="h6">Base price</Typography>
      </Divider>
      <NumberInput
        source="propertyPrice.price"
        label="Daily/hourly Price"
        fullWidth
        validate={[required()]}
        helperText="Enter the base price for daily/hourly"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
          },
        }}
      />
      <ReferenceInput source="propertyPrice.currencyId" reference="currencies" perPage={1000}>
        <AutocompleteInput optionText="code" validate={[required()]} />
      </ReferenceInput>
      <Divider component="div" role="presentation">
        <Typography variant="h6">Long-term prices</Typography>
      </Divider>
      <NumberInput
        source="propertyPrice.weeklyDiscount"
        label="Weekly Discount Percent (%)"
        fullWidth
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          },
        }}
      />
      <NumberInput
        source="propertyPrice.monthlyDiscount"
        label="Monthly Discount Percent (%)"
        fullWidth
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          },
        }}
      />
      <Divider component="div" role="presentation">
        <Typography variant="h6">Additional Pricing Options</Typography>
      </Divider>
      <NumberInput
        source="propertyPrice.cleaningFee"
        label="Cleaning fee"
        fullWidth
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
          },
        }}
      />
      <Stack direction="row" spacing={2}>
        <NumberInput
          source="propertyPrice.guestAfterFee"
          label="Additional guests"
          fullWidth
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
            },
          }}
        />
        <NumberInput
          source="propertyPrice.guestAfter"
          label="For each guest after"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <User size={14} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>
    </Box>
  );
};
const PricingTab = () => {
  return (
    <SimpleForm toolbar={<PricingTabToolbar />}>
      <PricingFields />
    </SimpleForm>
  );
};

export default PricingTab;
