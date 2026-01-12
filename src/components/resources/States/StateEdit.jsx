import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { AutocompleteInput, BooleanInput, EditBase, ReferenceInput, required, SimpleForm, TextInput, useDefaultTitle, useEditContext, useTranslate } from 'react-admin';
import StateEditToolbar from './StateEditToolbar';

const StateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};
const StateEdit = ({ id, onCancel }) => {
  const translate = useTranslate();
  return (
    <EditBase id={id}>
      <StateTitle />
      <Box
        sx={{
          pt: 5,
          width: { xs: '100vW', sm: 400 },
          mt: { xs: 2, sm: 1 },
        }}
      >
        <Stack
          direction="row"
          sx={{
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flex: '1',
            }}
          >
            Edit State
          </Typography>
          <IconButton onClick={onCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <SimpleForm sx={{ pt: 0, pb: 0 }} toolbar={<StateEditToolbar />}>
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
      </Box>
    </EditBase>
  );
};

export default StateEdit;
