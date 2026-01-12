import { Box, Grid, Typography } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { BooleanInput, Create, CreateBase, ListButton, required, SimpleForm, TextInput, TopToolbar, useCreateContext, useDefaultTitle } from 'react-admin';
const CountryCreateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const CountryCreateActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

const CountryCreate = () => {
  return (
    <CreateBase>
      <Box
        sx={{
          width: { xs: '100vW', sm: '40vW' },
        }}
      >
        <Create redirect="list" title={<CountryCreateTitle />} actions={<CountryCreateActions />}>
          <Typography
            variant="h6"
            sx={{
              flex: '1',
              p: 2,
            }}
          >
            Create Country
          </Typography>
          <SimpleForm>
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
        </Create>
      </Box>
    </CreateBase>
  );
};

export default CountryCreate;
