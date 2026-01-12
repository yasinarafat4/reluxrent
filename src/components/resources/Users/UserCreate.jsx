import { Box, Grid, Typography } from '@mui/material';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { ArrowBigLeft } from 'lucide-react';
import {
  BooleanInput,
  Create,
  CreateBase,
  DateInput,
  ListButton,
  NumberInput,
  PasswordInput,
  required,
  SimpleForm,
  TextInput,
  TopToolbar,
  useCreateContext,
  useDefaultTitle,
  useNotify,
  useRedirect,
} from 'react-admin';
import { useLocation } from 'react-router';
import PhoneInputField from './PhoneInputField';
const phoneUtil = PhoneNumberUtil.getInstance();

const UserCreateTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useCreateContext();
  return (
    <>
      <title>{`${defaultTitle}-${appTitle}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const UserCreateActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

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

const validatePasswords = (values) => {
  const errors = {};

  // If password is filled in
  if (values.password) {
    // confirm_password required
    if (!values.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    }
    // must match
    else if (values.password !== values.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
  }

  return errors;
};

const UserCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const location = useLocation();

  return (
    <CreateBase>
      <Box>
        <Create redirect="list" title={<UserCreateTitle />} actions={<UserCreateActions />}>
          <Typography
            variant="h6"
            sx={{
              flex: '1',
              p: 2,
            }}
          >
            Create User
          </Typography>
          <SimpleForm sx={{ pt: 0, pb: 0 }} validate={validatePasswords}>
            <Grid
              container
              spacing={2}
              sx={{
                width: '100%',
              }}
            >
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <TextInput source="name" label="Name" fullWidth validate={[required()]} />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <TextInput source="preferredName" label="Preferred Name" fullWidth />
                  </Box>
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <TextInput source="email" fullWidth validate={[required()]} />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <PhoneInputField label="Phone" source="phone" fullWidth validate={phoneValidators} />
                  </Box>
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <DateInput source="dob" label="D.O.B" fullWidth />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}></Box>
                </Box>
                <Box sx={{ mt: '1em' }} />
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="about" />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="dreamPlace" />
                  </Box>
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="funFact" />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="myWork" />
                  </Box>
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="obsessedWith" />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="school" />
                  </Box>
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="address" />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <TextInput multiline source="languages" />
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <BooleanInput source="isHost" label="Host Status" />
                <BooleanInput source="isVerified" label="Verification Status" />
                <Box sx={{ mt: '1em' }} />
                <Typography variant="h6" gutterBottom>
                  Fees
                </Typography>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <NumberInput source="guestFee" label="Guest Fee %" />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <NumberInput source="hostFee" label="Host Fee %" />
                  </Box>
                </Box>
                <Box sx={{ mt: '1em' }} />
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                  <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                    <PasswordInput source="password" />
                  </Box>
                  <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                    <PasswordInput source="confirm_password" />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </SimpleForm>
        </Create>
      </Box>
    </CreateBase>
  );
};

export default UserCreate;
