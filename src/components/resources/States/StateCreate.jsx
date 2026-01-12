import { Box, Typography } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
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
import { useLocation } from 'react-router-dom';
const StateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const StateCreateActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);
const StateCreate = () => {
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
        <Create redirect="list" title={<StateTitle />} actions={<StateCreateActions />}>
          <Typography
            variant="h6"
            sx={{
              flex: '1',
              p: 2,
            }}
          >
            Create State
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
            <TextInput source="latitude" fullWidth />
            <TextInput source="longitude" fullWidth />
            <BooleanInput source="status" label="Status" />
          </SimpleForm>
        </Create>
      </Box>
    </CreateBase>
  );
};

export default StateCreate;
