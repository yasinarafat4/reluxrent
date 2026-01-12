import { Box, Typography } from '@mui/material';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { BooleanInput, Create, CreateBase, PasswordInput, ReferenceInput, required, SelectInput, SimpleForm, TextInput, useCreateContext, useDefaultTitle, useNotify, useRedirect } from 'react-admin';
import { useLocation } from 'react-router';
import PhoneInputField from '../PhoneInputField';
const phoneUtil = PhoneNumberUtil.getInstance();
// Function to validate phone numbers
const isPhoneValid = (phone) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

const phoneValidation = (value) => {
  if (!value) {
    return 'Phone number is required';
  }

  if (!isPhoneValid(value)) {
    return 'Please enter a valid phone number';
  }

  return undefined;
};

const phoneValidators = [required(), phoneValidation];

const StafCreateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const StafCreate = () => {
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
        <Create redirect="list" title={<StafCreateTitle />}>
          <Typography
            variant="h6"
            sx={{
              flex: '1',
              p: 2,
            }}
          >
            Create User
          </Typography>
          <SimpleForm sx={{ pt: 0, pb: 0 }}>
            <TextInput source="name" label="Name" fullWidth validate={[required()]} />
            <TextInput source="email" fullWidth validate={[required()]} />
            <PasswordInput source="password" fullWidth validate={[required()]} />
            <PhoneInputField label="Phone" source="phone" fullWidth validate={phoneValidators} />
            <ReferenceInput source="roleId" reference="roles">
              <SelectInput optionText="name" />
            </ReferenceInput>
            <BooleanInput source="status" label="Status" />
          </SimpleForm>
        </Create>
      </Box>
    </CreateBase>
  );
};

export default StafCreate;
