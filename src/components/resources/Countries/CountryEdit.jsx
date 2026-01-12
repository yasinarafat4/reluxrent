import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { BooleanInput, EditBase, required, SimpleForm, TextInput, useDefaultTitle, useEditContext, useTranslate } from 'react-admin';
import CountryEditToolbar from './CountryEditToolbar';

const CountryEditTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};
const CountryEdit = ({ id, onCancel }) => {
  const translate = useTranslate();
  return (
    <EditBase id={id}>
      <CountryEditTitle />
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
            Edit Country
          </Typography>
          <IconButton onClick={onCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <SimpleForm sx={{ pt: 0, pb: 0 }} toolbar={<CountryEditToolbar />}>
          <TextInput source="name" label="Name" fullWidth validate={[required()]} />
          <Grid
            container
            rowSpacing={0}
            columnSpacing={1}
            sx={{
              mb: 1,
            }}
          >
            <Grid size={{ xs: 6 }}>
              <TextInput source="iso3" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextInput source="iso2" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextInput source="phonecode" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextInput source="currency" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextInput source="currency_name" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextInput source="currency_symbol" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextInput source="latitude" fullWidth />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextInput source="longitude" fullWidth />
            </Grid>
          </Grid>
          <BooleanInput source="status" label="Status" />
        </SimpleForm>
      </Box>
    </EditBase>
  );
};

export default CountryEdit;
