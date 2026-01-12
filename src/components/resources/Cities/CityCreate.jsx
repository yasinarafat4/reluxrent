import { Box, Typography } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { useEffect } from 'react';
import {
  AutocompleteInput,
  BooleanInput,
  Create,
  CreateBase,
  ListButton,
  ReferenceInput,
  required,
  SimpleForm,
  TextInput,
  TopToolbar,
  useCreateContext,
  useDefaultTitle,
  useNotify,
  useRedirect,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
const CityTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const CityCreateActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

const CountryStateFilter = () => {
  const countryId = useWatch({ name: 'countryId' });

  const { setValue } = useFormContext();

  // Reset stateId if country changes
  useEffect(() => {
    setValue('stateId', '');
  }, [countryId, setValue]);

  return (
    <ReferenceInput source="stateId" reference="states" sort={{ field: 'name', order: 'ASC' }} filter={{ countryId, getAll: true }} key={countryId}>
      <AutocompleteInput optionText={(choice) => (choice?.id ? `${choice.name}` : '')} disabled={!countryId} />
    </ReferenceInput>
  );
};

const CityCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const location = useLocation();

  return (
    <CreateBase>
      <Box
        sx={{
          width: { xs: '100vW', sm: '40vW' },
        }}
      >
        <Create redirect="list" title={<CityTitle />} actions={<CityCreateActions />}>
          <Typography
            variant="h6"
            sx={{
              flex: '1',
              p: 2,
            }}
          >
            Create City
          </Typography>
          <SimpleForm>
            <TextInput source="name" label="Name" fullWidth validate={[required()]} />
            <ReferenceInput source="countryId" reference="countries" filter={{ getAll: true }} sort={{ field: 'name', order: 'ASC' }}>
              <AutocompleteInput
                optionText={(choice) =>
                  choice?.id // the empty choice is { id: '' }
                    ? `${choice.name}`
                    : ''
                }
                validate={[required()]}
              />
            </ReferenceInput>
            <CountryStateFilter />
            <TextInput source="latitude" fullWidth />
            <TextInput source="longitude" fullWidth />
            <BooleanInput source="status" label="Status" />
          </SimpleForm>
        </Create>
      </Box>
    </CreateBase>
  );
};

export default CityCreate;
