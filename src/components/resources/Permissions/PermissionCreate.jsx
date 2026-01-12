import { Box, Grid, Typography } from '@mui/material';
import { BooleanInput, Create, CreateBase, required, SimpleForm, TextInput, useCreateContext, useDefaultTitle, useNotify, useRedirect } from 'react-admin';
import { useLocation } from 'react-router';
const CurrencyCreateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};
const CurrencyCreate = () => {
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
        <Create redirect="list" title={<CurrencyCreateTitle />}>
          <Typography
            variant="h6"
            sx={{
              flex: '1',
              p: 2,
            }}
          >
            Create Currency
          </Typography>
          <SimpleForm sx={{ pt: 0, pb: 0 }}>
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
                <TextInput source="code" fullWidth validate={[required()]} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextInput source="symbol" fullWidth />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextInput source="decimal_places" fullWidth />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextInput source="decimal_separator" fullWidth />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextInput source="thousand_separator" fullWidth />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextInput source="exchange_rate" fullWidth />
              </Grid>
            </Grid>
            <BooleanInput source="status" label="Status" />
          </SimpleForm>
        </Create>
      </Box>
    </CreateBase>
  );
};

export default CurrencyCreate;
