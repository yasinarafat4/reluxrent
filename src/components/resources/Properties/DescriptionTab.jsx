import TinyMCEInput from '@/components/TinyMCEInput';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { Error, Loading, required, SaveButton, SimpleForm, TextInput, TopToolbar, useDataProvider, useGetList, useNotify, useRecordContext, useRefresh } from 'react-admin';
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
            <TextInput source={`${source}.${lang.code}.name`} label={`Title (${lang.name})`} fullWidth validate={[required()]} />
            <TinyMCEInput source={`${source}.${lang.code}.description`} label={`Description (${lang.name})`} fullWidth />
          </Box>
        ) : null,
      )}
    </>
  );
};
const DescriptionTabToolbar = () => {
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
      await dataProvider.update('properties/description', {
        id: record.id,
        data: {
          translations: formValues.translations,
        },
      });

      notify('Description updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating description', { type: 'error' });
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
const DescriptionTab = () => {
  return (
    <SimpleForm toolbar={<DescriptionTabToolbar />}>
      <TranslationTabs form="edit" source="translations" />
    </SimpleForm>
  );
};

export default DescriptionTab;
