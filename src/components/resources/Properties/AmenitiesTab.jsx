import { capitalize } from '@mui/material';
import { Fragment, useState } from 'react';
import { CheckboxGroupInput, SaveButton, SimpleForm, TopToolbar, useDataProvider, useGetList, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';

function groupedAmenities(amenities) {
  return amenities.reduce((acc, amenity) => {
    const typeName = amenity.amenitiesType.translations.en.name;
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push({
      id: amenity.id,
      name: amenity.translations.en.name,
    });
    return acc;
  }, {});
}

const AmenitiesTabToolar = () => {
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
      await dataProvider.update('properties/amenity', {
        id: record.id,
        data: {
          amenities: formValues.amenities,
        },
      });

      notify('Amenity updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating Amenity', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <TopToolbar>
      <SaveButton alwaysEnable type="button" label="Update Description" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};
const AmenitiesTab = () => {
  const { data: amenities = [], isLoading } = useGetList('amenities', {
    pagination: { page: 1, perPage: 1000 }, // Adjust pagination as needed
    sort: { field: 'id', order: 'ASC' },
  });
  const grouped = groupedAmenities(amenities);

  return (
    <SimpleForm toolbar={<AmenitiesTabToolar />}>
      {!isLoading &&
        Object.entries(grouped).map(([resource, perms]) => (
          <Fragment key={resource}>
            <h5 style={{ marginTop: '1em' }}>{capitalize(resource)}</h5>
            <CheckboxGroupInput
              row={false}
              source="amenities"
              choices={perms.map((p) => ({
                id: p.id,
                name: capitalize(p.name),
              }))}
              optionText="name"
              optionValue="id"
              parse={(value) => value?.map((id) => (typeof id === 'object' ? id.id : id))}
              format={(value) => value?.map((amenity) => (typeof amenity === 'object' ? amenity.id : amenity))}
            />
          </Fragment>
        ))}
    </SimpleForm>
  );
};

export default AmenitiesTab;
