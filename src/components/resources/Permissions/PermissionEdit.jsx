import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { BooleanInput, EditBase, required, SimpleForm, TextInput, useDefaultTitle, useEditContext, useTranslate } from 'react-admin';
import PermissionEditToolbar from './PermissionEditToolbar';


const PermissionEditTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};
const PermissionEdit = ({ id, onCancel }) => {
  const translate = useTranslate();
  return (
    <EditBase id={id}>
      <PermissionEditTitle />
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
            Edit Currency
          </Typography>
          <IconButton onClick={onCancel} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <SimpleForm sx={{ pt: 0, pb: 0 }} toolbar={<PermissionEditToolbar />}>
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
      </Box>
    </EditBase>
  );
};

export default PermissionEdit;
