import { useEffect, useState } from 'react';
import {
  ArrayInput,
  NumberInput,
  ReferenceInput,
  required,
  SaveButton,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TopToolbar,
  useDataProvider,
  useGetList,
  useNotify,
  useRecordContext,
  useRefresh,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';

const BedTypeSelectInput = (props) => {
  const { data, isLoading, error } = useGetList('bed-types');

  const choices =
    data?.map((d) => ({
      id: d.translations?.en?.name ?? d.id,
      name: d.translations?.en?.name ?? d.id,
    })) || [];

  return (
    <SelectInput
      {...props}
      choices={choices}
      isLoading={isLoading}
      // Optional: Handle fallback
      helperText={error ? 'Failed to load bed types' : props.helperText}
    />
  );
};

const BedsForEachBedroom = () => {
  const { setValue } = useFormContext();
  const bedrooms_data = useWatch({ name: 'bedrooms_data' });
  const bedrooms = useWatch({ name: 'bedrooms' });

  console.log('bedrooms_data', bedrooms_data);

  useEffect(() => {
    if (bedrooms !== undefined) {
      // If the `bedrooms_data` is `null` or `undefined`, initialize it
      if (!bedrooms_data || !Array.isArray(bedrooms_data)) {
        const newBedroomsData = Array.from({ length: bedrooms }, (_, index) => ({
          beds: [{ bed_type: '', quantity: 1 }],
        }));
        setValue('bedrooms_data', newBedroomsData);
      } else if (Array.isArray(bedrooms_data) && bedrooms_data.length !== bedrooms) {
        // If bedrooms data exists but length doesn't match `bedrooms`, update it
        const newBedroomsData = Array.from({ length: bedrooms }, (_, index) => ({
          beds: bedrooms_data[index]?.beds || [{ bed_type: '', quantity: 1 }],
        }));
        setValue('bedrooms_data', newBedroomsData);
      }
    }
  }, [bedrooms, bedrooms_data, setValue]);

  if (!bedrooms_data || !Array.isArray(bedrooms_data)) return null;

  return bedrooms_data.map((_, bedroomIndex) => (
    <div key={bedroomIndex} style={{ marginBottom: '2rem', width: '100%' }}>
      <h5>Bedroom {bedroomIndex + 1}</h5>
      <ArrayInput source={`bedrooms_data.${bedroomIndex}.beds`} label="Beds">
        <SimpleFormIterator inline defaultValue={{ bed_type: '', quantity: 1 }}>
          <BedTypeSelectInput source="bed_type" label="Bed Type" validate={required()} />
          <NumberInput source="quantity" label="Quantity" validate={required()} />
        </SimpleFormIterator>
      </ArrayInput>
    </div>
  ));
};

const BasicTabEditToolar = (props) => {
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
      await dataProvider.update(`properties`, {
        id: record.id,
        data: {
          bedrooms: formValues.bedrooms,
          bedrooms_data: formValues.bedrooms_data,
          bathrooms: formValues.bathrooms,
          propertyTypeId: formValues.propertyTypeId,
          spaceTypeId: formValues.spaceTypeId,
          accommodates: formValues.accommodates,
        },
      });

      notify('Basic info updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating Basic info', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;
  return (
    <TopToolbar>
      <SaveButton alwaysEnable type="button" label="Update Basic" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};

const BasicTab = () => {
  return (
    <SimpleForm toolbar={<BasicTabEditToolar />}>
      <NumberInput source="bedrooms" label="Bedrooms" validate={required()} />
      <BedsForEachBedroom />
      <NumberInput source="bathrooms" label="Bathrooms" validate={required()} />
      <ReferenceInput source="propertyTypeId" reference="property-types">
        <SelectInput optionText="translations.en.name" validate={[required()]} />
      </ReferenceInput>
      <ReferenceInput source="spaceTypeId" reference="space-types">
        <SelectInput optionText="translations.en.name" validate={[required()]} />
      </ReferenceInput>
      <NumberInput source="accommodates" label="Accommodates" />
    </SimpleForm>
  );
};

export default BasicTab;
