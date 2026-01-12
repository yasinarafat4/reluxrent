import { Box, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { required, SaveButton, SelectInput, SimpleForm, TopToolbar, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const BookingTabToolbar = () => {
  const {
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
      await dataProvider.update('properties/booking', {
        id: record.id,
        data: {
          bookType: formValues.bookType,
          bookingType: formValues.bookingType,
        },
      });

      notify('Booking updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating booking', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <TopToolbar>
      <SaveButton alwaysEnable type="button" label="Update Booking" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};
const BookingTab = () => {
  return (
    <SimpleForm toolbar={<BookingTabToolbar />}>
      <Box className="w-full">
        <Divider component="div" role="presentation">
          <Typography variant="h6">Choose how your guests book</Typography>
        </Divider>
        <SelectInput
          source="bookType"
          choices={[
            { id: 'perday', name: 'Per day' },
            { id: 'perhour', name: 'Per Hour' },
          ]}
          validate={[required()]}
        />
        <SelectInput
          source="bookingType"
          choices={[
            { id: 'request', name: 'Review each request' },
            { id: 'instant', name: 'Guests book instantly' },
          ]}
          validate={[required()]}
        />
      </Box>
    </SimpleForm>
  );
};

export default BookingTab;
