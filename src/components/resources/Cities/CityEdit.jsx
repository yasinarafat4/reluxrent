import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { AutocompleteInput, BooleanInput, EditBase, NumberInput, ReferenceInput, required, SimpleForm, TextInput, useDefaultTitle, useEditContext, useTranslate } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import CityEditToolbar from './CityEditToolbar';

const CityTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};

const CityEditFormFields = () => {
  const { setValue } = useFormContext();
  const countryId = useWatch({ name: 'countryId' });

  useEffect(() => {
    setValue('stateId', '');
  }, [countryId, setValue]);

  return (
    <>
      <TextInput source="name" label="Name" fullWidth validate={[required()]} />

      <ReferenceInput source="countryId" reference="countries" filter={{ getAll: true }} sort={{ field: 'name', order: 'ASC' }}>
        <AutocompleteInput optionText={(choice) => (choice?.id ? `${choice.name}` : '')} validate={[required()]} />
      </ReferenceInput>

      <ReferenceInput source="stateId" reference="states" sort={{ field: 'name', order: 'ASC' }} filter={{ countryId, getAll: true }} key={countryId}>
        <AutocompleteInput optionText={(choice) => (choice?.id ? `${choice.name}` : '')} disabled={!countryId} validate={[required()]} />
      </ReferenceInput>

      <TextInput source="latitude" fullWidth />
      <TextInput source="longitude" fullWidth />
      <BooleanInput source="popularCity" label="Popular City" />
      <NumberInput source="popularCitySort" label="Popular City Sort" />
      <BooleanInput source="status" label="Status" />
    </>
  );
};

const CityEdit = ({ id, onCancel }) => {
  const translate = useTranslate();
  return (
    <EditBase id={id}>
      <CityTitle />
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
            Edit City
          </Typography>
          <IconButton onClick={onCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <SimpleForm sx={{ pt: 0, pb: 0 }} toolbar={<CityEditToolbar />}>
          <CityEditFormFields />
        </SimpleForm>
      </Box>
    </EditBase>
  );
};

export default CityEdit;
