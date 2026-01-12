import { Box, Tab, Tabs } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { useState } from 'react';
import {
  BooleanInput,
  CloneButton,
  Edit,
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
  useDefaultTitle,
  useEditContext,
  useGetList,
} from 'react-admin';
import AmenityEditToolbar from './AmenityEditToolbar';

const AmenityEditTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};

const AmenityEditActions = () => (
  <TopToolbar>
    <CloneButton />
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
            <ImageInput source="icon" label="Icon" accept="image/*" helperText="Image Size Should be 50x50">
              <ImageField
                sx={{
                  width: 90,
                  height: 90,
                  objectFit: 'contain',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start', // align to start
                }}
                source="src"
                title="Icon"
              />
            </ImageInput>
            <NumberInput source="order" label="Order" />
            <BooleanInput source="status" label="Status" />
          </Box>
        ) : null,
      )}
    </>
  );
};

const AmenityEdit = () => {
  return (
    <Edit title={<AmenityEditTitle />} actions={<AmenityEditActions />} mutationMode="pessimistic">
      <SimpleForm toolbar={<AmenityEditToolbar />}>
        <TranslationTabs source="amenitiesTranslation" />
      </SimpleForm>
    </Edit>
  );
};

export default AmenityEdit;
