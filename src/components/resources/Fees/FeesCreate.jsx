import { InputAdornment } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { Create, ListButton, NumberInput, SimpleForm, TopToolbar, useCreateContext, useDefaultTitle } from 'react-admin';

const FeesCreateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const FeesCreateActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

const FeesCreate = () => {
  return (
    <Create redirect="list" title={<FeesCreateTitle />} actions={<FeesCreateActions />}>
      <SimpleForm>
        <NumberInput source="guestFee" label="Guest service charge (%)" slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
        <NumberInput source="hostFee" label="Host service charge (%)" slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
        <NumberInput source="moreThenSeven" label="Host Cancellation Fees More than 7 days before check-in" helperText="If host cancel booking more then 7 day before arrival this fee will apply." />
        <NumberInput source="lessThenSeven" label="Host Cancellation Fees Less than 7 days before check-in " helperText="If host cancel booking less then 7 day before arrival this fee will apply." />
        <NumberInput source="hostPenalty" label="Host Penalty" />
      </SimpleForm>
    </Create>
  );
};

export default FeesCreate;
