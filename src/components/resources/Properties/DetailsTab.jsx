import TinyMCEInput from '@/components/TinyMCEInput';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { Error, Loading, SaveButton, SimpleForm, TopToolbar, useDataProvider, useGetList, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const TranslationTabs = ({ form, source }) => {
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
            <TinyMCEInput source={`${source}.${lang.code}.aboutPlace`} label={`About Place (${lang.name})`} min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.placeIsGreatFor`} label={`Place is great for (${lang.name})`} min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.guestCanAccess`} label={`Guest Access (${lang.name})`} min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.interactionGuests`} label={`Interaction with Guests (${lang.name})`} min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.other`} label={`Other Things to Note (${lang.name})`} min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.aboutNeighborhood`} label={`About Neighborhood (${lang.name})`} min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.getAround`} label={`Getting Around (${lang.name})`} min_height="200" />
          </Box>
        ) : null,
      )}
    </>
  );
};

const DetailsTabToolbar = () => {
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
      await dataProvider.update('properties/details', {
        id: record.id,
        data: {
          translations: formValues.translations,
        },
      });

      notify('Details updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating details', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <TopToolbar>
      <SaveButton alwaysEnable type="button" label="Update Details" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};
const DetailsTab = () => {
  return (
    <SimpleForm toolbar={<DetailsTabToolbar />}>
      <TranslationTabs form="edit" source="translations" />
    </SimpleForm>
  );
};

export default DetailsTab;
