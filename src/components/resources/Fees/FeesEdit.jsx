import { InputAdornment } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { Edit, ListButton, NumberInput, SimpleForm, TopToolbar, useDefaultTitle, useEditContext } from 'react-admin';
import FeesEditToolbar from './FeesEditToolbar';

const FeesEditTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};

const FeesEditActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

const FeesEdit = () => {
  return (
    <Edit title={<FeesEditTitle />} actions={<FeesEditActions />} mutationMode="pessimistic">
      <SimpleForm toolbar={<FeesEditToolbar />}>
        <NumberInput source="guestFee" label="Guest service charge (%)" slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
        <NumberInput source="hostFee" label="Host service charge (%)" slotProps={{ input: { endAdornment: <InputAdornment position="end">%</InputAdornment> } }} />
        <NumberInput source="moreThenSeven" label="Host Cancellation Fees More than 7 days before check-in" helperText="If host cancel booking more then 7 day before arrival this fee will apply." />
        <NumberInput source="lessThenSeven" label="Host Cancellation Fees Less than 7 days before check-in " helperText="If host cancel booking less then 7 day before arrival this fee will apply." />
        <NumberInput source="hostPenalty" label="Host Penalty" />
      </SimpleForm>
    </Edit>
  );
};

export default FeesEdit;
