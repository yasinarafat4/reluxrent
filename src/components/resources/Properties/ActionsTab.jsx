import { useState } from 'react';
import { BooleanInput, SaveButton, SelectInput, SimpleForm, TopToolbar, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const ActionsTabToolbar = () => {
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
      await dataProvider.update('properties/actions', {
        id: record.id,
        data: {
          status: formValues.status,
          recommended: formValues.recommended,
          isApproved: formValues.isApproved,
        },
      });

      notify('Property updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating Property', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <TopToolbar>
      <SaveButton alwaysEnable type="button" label="Update" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};
const ActionsTab = () => {
  return (
    <SimpleForm toolbar={<ActionsTabToolbar />}>
      <SelectInput
        source="status"
        choices={[
          { id: 'Listed', name: 'Listed' },
          { id: 'Unlisted', name: 'Unlisted' },
        ]}
      />
      <BooleanInput source="recommended" />
      <BooleanInput source="isApproved" />
    </SimpleForm>
  );
};

export default ActionsTab;
