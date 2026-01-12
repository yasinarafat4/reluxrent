import GooglePlacesInput from '@/components/GoogleAutoCompleteInput';
import { Box, Tab, Tabs } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { useState } from 'react';
import {
  BooleanInput,
  Create,
  Error,
  ImageField,
  ImageInput,
  ListButton,
  Loading,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  TopToolbar,
  useCreateContext,
  useDefaultTitle,
  useGetList,
} from 'react-admin';

const PropertyCreateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const PropertyCreateActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

const TranslationTabs = ({ source }) => {
  const [currentLocale, setCurrentLocale] = useState('en');
  const {
    data: languages,
    isLoading,
    error,
  } = useGetList('languages', {
    sort: { field: 'id', order: 'ASC' },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <>
      <Tabs value={currentLocale} onChange={(e, newValue) => setCurrentLocale(newValue)} sx={{ mb: 2 }}>
        {languages.map((lang) => (
          <Tab key={lang.code} label={lang.name} value={lang.code} />
        ))}
      </Tabs>

      {languages.map((lang) =>
        currentLocale === lang.code ? (
          <Box key={lang.code} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            <ReferenceInput source="amenitiesTypeId" reference="amenity-types">
              <SelectInput optionText="translations.en.name" validate={[required()]} />
            </ReferenceInput>
            <TextInput source={`${source}.${lang.code}.name`} label={`Name (${lang.name})`} fullWidth validate={[required()]} />
            <TextInput multiline minRows={3} source={`${source}.${lang.code}.description`} label={`Description (${lang.name})`} fullWidth />
            <ImageInput source="icon" label="Icon" accept="image/*" helperText="Image Size Shuldbe 50x50">
              <ImageField source="src" title="Icon" />
            </ImageInput>
            <NumberInput source="order" label="Order" />
            <BooleanInput source="status" label="Status" />
          </Box>
        ) : null,
      )}
    </>
  );
};

const PropertyCreate = () => {
  return (
    <Create redirect="list" title={<PropertyCreateTitle />} actions={<PropertyCreateActions />}>
      <SimpleForm>
        <ReferenceInput source="userId" reference="users">
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="propertyTypeId" reference="property-types">
          <SelectInput optionText="translations.en.name" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="spaceTypeId" reference="space-types">
          <SelectInput optionText="translations.en.name" validate={[required()]} />
        </ReferenceInput>
        <NumberInput source="accommodates" label="Accommodates" />
        <GooglePlacesInput label="City" source="city" country="bd" />
      </SimpleForm>
    </Create>
  );
};

export default PropertyCreate;
