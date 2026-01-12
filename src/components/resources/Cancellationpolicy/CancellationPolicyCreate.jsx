import { Box, InputAdornment, Tab, Tabs } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { useState } from 'react';
import { Create, Error, ListButton, Loading, NumberInput, required, SimpleForm, TextInput, TopToolbar, useCreateContext, useDefaultTitle, useGetList } from 'react-admin';

const CancellationPolicyCreateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const CancellationPolicyCreateActions = () => (
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
            <TextInput source={`${source}.${lang.code}.name`} label={`Name (${lang.name})`} fullWidth validate={[required()]} />
            <TextInput source={`${source}.${lang.code}.description`} label={`Description (${lang.name})`} fullWidth multiline minRows={3} />
            <NumberInput
              source="beforeDays"
              label="Before days"
              helperText="Refund before days prior to arrival except service fees"
              validate={[required()]}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">Day</InputAdornment> } }}
            />
            <NumberInput
              source="beforeDayPriorRefund"
              label="Before the day Prior to arrival check-in(%)"
              helperText="Refund Percentage"
              validate={[required()]}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
            />
            <NumberInput
              source="afterDayPriorRefund"
              label="After the day Prior to arrival check-in(%)"
              helperText="Refund Percentage"
              validate={[required()]}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }}
            />
          </Box>
        ) : null,
      )}
    </>
  );
};

const CancellationPolicyCreate = () => {
  return (
    <Create redirect="list" title={<CancellationPolicyCreateTitle />} actions={<CancellationPolicyCreateActions />}>
      <SimpleForm>
        <TranslationTabs source="translations" />
      </SimpleForm>
    </Create>
  );
};

export default CancellationPolicyCreate;
