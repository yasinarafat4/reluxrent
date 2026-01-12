import TinyMCEInput from '@/components/TinyMCEInput';
import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import {
  BooleanInput,
  Error,
  Loading,
  ReferenceInput,
  required,
  SaveButton,
  SelectInput,
  SimpleForm,
  TextInput,
  TopToolbar,
  useDataProvider,
  useGetList,
  useNotify,
  useRecordContext,
  useRefresh,
} from 'react-admin';
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
            <TinyMCEInput source={`${source}.${lang.code}.additionalRules`} label={`Additional Rules (${lang.name})`} fullWidth min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.directions`} label={`Directions (${lang.name})`} fullWidth min_height="200" />
            <TinyMCEInput source={`${source}.${lang.code}.houseManual`} label={`House Manual (${lang.name})`} fullWidth min_height="200" />
          </Box>
        ) : null,
      )}
    </>
  );
};

const TermsAndRulesTabToolbar = () => {
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
      await dataProvider.update('properties/rules', {
        id: record.id,
        data: {
          cancellationPolicyId: formValues.cancellationPolicyId,
          eventsAllowed: formValues.propertyRulesAndManual.eventsAllowed,
          smokingAllowed: formValues.propertyRulesAndManual.smokingAllowed,
          commercialAllowed: formValues.propertyRulesAndManual.commercialAllowed,
          quietHours: formValues.propertyRulesAndManual.quietHours,
          startQuietHoursTime: formValues.propertyRulesAndManual.startQuietHoursTime,
          endQuietHoursTime: formValues.propertyRulesAndManual.endQuietHoursTime,
          wifiName: formValues.propertyRulesAndManual.wifiName,
          wifiPassword: formValues.propertyRulesAndManual.wifiPassword,
          startCheckInTime: formValues.propertyRulesAndManual.startCheckInTime,
          endCheckInTime: formValues.propertyRulesAndManual.endCheckInTime,
          checkOutTime: formValues.propertyRulesAndManual.checkOutTime,
          rulesAndManualTranslations: formValues.rulesAndManualTranslations,
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
      <SaveButton alwaysEnable type="button" label="Update Terms & Rules" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const suffix = i < 12 ? 'AM' : 'PM';
  return `${hour}:00${suffix}`;
});
const TermsAndRulesTab = () => {
  return (
    <SimpleForm toolbar={<TermsAndRulesTabToolbar />}>
      <Box className="w-full">
        <Divider component="div" role="presentation">
          <Typography variant="h6">Cancellation Policy</Typography>
        </Divider>
        <ReferenceInput source="cancellationPolicyId" reference="cancellation-policy">
          <SelectInput optionText="translations.en.name" validate={[required()]} />
        </ReferenceInput>

        <Divider component="div" role="presentation">
          <Typography variant="h6">Property rules</Typography>
        </Divider>
        <BooleanInput source="propertyRulesAndManual.eventsAllowed" label="Events allowed" />
        <BooleanInput source="propertyRulesAndManual.smokingAllowed" label="Smoking, vaping, e-cigarettes allowed" />
        <BooleanInput source="propertyRulesAndManual.commercialAllowed" label="Commercial photography and filming allowed" />
        <BooleanInput source="propertyRulesAndManual.quietHours" label="Quiet Hours" />
        <Stack direction="row" gap={2}>
          <SelectInput source="propertyRulesAndManual.startQuietHoursTime" label="Quiet hours Start Time" choices={timeOptions} />
          <SelectInput source="propertyRulesAndManual.endQuietHoursTime" label="Quiet hours End Time" choices={timeOptions} />
        </Stack>
        <Divider component="div" role="presentation">
          <Typography variant="h6">Wi-fi Details</Typography>
        </Divider>
        <Stack direction="row" gap={2} marginTop={2}>
          <TextInput source="propertyRulesAndManual.wifiName" label="Wifi Name" />
          <TextInput source="propertyRulesAndManual.wifiPassword" label="Wifi Password" />
        </Stack>
        <Divider component="div" role="presentation">
          <Typography variant="h6">Check-in & Check-out Time</Typography>
        </Divider>
        <Stack direction="row" gap={2} marginTop={2}>
          <SelectInput source="propertyRulesAndManual.startCheckInTime" label="Check-in Start Time" choices={timeOptions} />
          <SelectInput source="propertyRulesAndManual.endCheckInTime" label="Check-in End Time" choices={timeOptions} />
          <SelectInput source="propertyRulesAndManual.checkOutTime" label="Check-out Time" choices={timeOptions} />
        </Stack>
        <Divider component="div" role="presentation">
          <Typography variant="h6">Additional rules</Typography>
        </Divider>
        <TranslationTabs form="edit" source="rulesAndManualTranslations" />
      </Box>
    </SimpleForm>
  );
};

export default TermsAndRulesTab;
