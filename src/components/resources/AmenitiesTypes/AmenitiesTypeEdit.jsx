import { Box, Tab, Tabs } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { useState } from 'react';
import { BooleanInput, CloneButton, Edit, ListButton, Loading, NumberInput, required, SimpleForm, TextInput, TopToolbar, useDefaultTitle, useEditContext, useGetList } from 'react-admin';
import AmenitiesTypeEditToolbar from './AmenitiesTypeEditToolbar';

const AmenitiesTypeEditTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};

const AmenitiesTypeEditActions = () => (
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
            <TextInput source={`${source}.${lang.code}.name`} label={`Name (${lang.name})`} fullWidth validate={[required()]} />
            <TextInput multiline minRows={3} source={`${source}.${lang.code}.description`} label={`Description (${lang.name})`} fullWidth />
            <NumberInput source="order" label="Order" />
            <BooleanInput source="status" label="Status" />
          </Box>
        ) : null,
      )}
    </>
  );
};

const AmenitiesTypeEdit = () => {
  return (
    <Edit title={<AmenitiesTypeEditTitle />} actions={<AmenitiesTypeEditActions />} mutationMode="pessimistic">
      <SimpleForm toolbar={<AmenitiesTypeEditToolbar />}>
        <TranslationTabs source="amenitiesTypeTranslation" />
      </SimpleForm>
    </Edit>
  );
};

export default AmenitiesTypeEdit;
