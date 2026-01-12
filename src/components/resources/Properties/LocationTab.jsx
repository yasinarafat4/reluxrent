import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AutocompleteInput, ReferenceInput, required, SaveButton, SimpleForm, TextInput, TopToolbar, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';
const MapWithAutocomplete = dynamic(() => import('@/components/MapWithAutocomplete'), { ssr: false });

const LocationTabToolar = () => {
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

  console.log('record', record);
  // const onSubmit = async (e) => {
  //   if (!record) return;
  //   const formValues = getValues();
  //   setLoading(true);
  //   try {
  //     await dataProvider.update('properties/location', {
  //       id: record.id,
  //       data: {
  //         addressLine1: formValues.addressLine1,
  //         country: formValues.country,
  //         state: formValues.state,
  //         city: formValues.city,
  //         postal_code: formValues.postal_code,
  //         latitude: formValues.latitude,
  //         longitude: formValues.longitude,
  //       },
  //     });

  //     notify('Location updated successfully', { type: 'success' });
  //     refresh();
  //   } catch (error) {
  //     console.error('Error:', error);
  //     notify('Error updating location', { type: 'error' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // ------

  const onSubmit = async () => {
    if (!record) return;

    const formValues = getValues();

    const addr = formValues.propertyAddress || {};

    setLoading(true);
    try {
      await dataProvider.update('properties/location', {
        id: record.id,
        data: {
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          postal_code: addr.postal_code,
          country: addr.countryId,
          state: addr.stateId,
          city: addr.cityId,
          latitude: formValues.latitude,
          longitude: formValues.longitude,
        },
      });

      notify('Location updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating location', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --------

  if (!record) return null;

  return (
    <TopToolbar>
      <SaveButton alwaysEnable type="button" label="Update Location" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};

const LocationTab = () => {
  return (
    <>
      <SimpleForm toolbar={<LocationTabToolar />}>
        <Box sx={{ width: '100%' }}>
          <MapWithAutocomplete />
        </Box>
        <TextInput source="propertyAddress.addressLine1" label="Address Line 1" validate={[required()]} />
        <TextInput source="propertyAddress.addressLine2" label="Address Line 2" />
        <ReferenceInput source="propertyAddress.countryId" reference="countries" label="Country">
          <AutocompleteInput label="Country" optionText={(choice) => (choice?.id ? `${choice.name}` : '')} sx={{ minWidth: 200 }} />
        </ReferenceInput>
        <ReferenceInput source="propertyAddress.stateId" reference="states" label="State">
          <AutocompleteInput label="State" optionText={(choice) => (choice?.id ? `${choice.name}` : '')} sx={{ minWidth: 200 }} />
        </ReferenceInput>
        <ReferenceInput source="propertyAddress.cityId" reference="cities" label="City">
          <AutocompleteInput label="City" optionText={(choice) => (choice?.id ? `${choice.name}` : '')} sx={{ minWidth: 200 }} />
        </ReferenceInput>
        <TextInput source="propertyAddress.postal_code" label="ZIP / Postal Code" validate={[required()]} />
      </SimpleForm>
    </>
  );
};

export default LocationTab;
