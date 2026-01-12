import { Box, Grid, Typography } from '@mui/material';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { ArrowBigLeft } from 'lucide-react';
import { useState } from 'react';
import { BooleanInput, DateInput, Edit, EditBase, ListButton, NumberInput, PasswordInput, required, ShowButton, SimpleForm, TextInput, TopToolbar, useDefaultTitle, useTranslate } from 'react-admin';
import PhoneInputField from './PhoneInputField';
import UserEditToolbar from './UserEditToolbar';
const phoneUtil = PhoneNumberUtil.getInstance();

const UserEditTitle = () => {
  const appTitle = useDefaultTitle();
  return (
    <>
      <title>{`User Edit-${appTitle}`}</title>
      <span>User Edit</span>
    </>
  );
};

const UserEditActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
    <ShowButton />
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

const UserEdit = ({ id }) => {
  const translate = useTranslate();
  const [changePassword, setChangePassword] = useState(false);
  return (
    <EditBase>
      <Box>
        <Edit title={<UserEditTitle />} actions={<UserEditActions />}>
          <Typography
            variant="h6"
            sx={{
              flex: '1',
              p: 2,
            }}
          >
            Edit User
          </Typography>
          <SimpleForm sx={{ pt: 0, pb: 0 }} validate={validatePasswords} toolbar={<UserEditToolbar />}>
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
                <div style={{ marginTop: '.5rem', marginBottom: '.5rem' }}>
                  <label>
                    <input type="checkbox" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)} /> Change Password
                  </label>
                </div>

                {changePassword && (
                  <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
                    <Box sx={{ flex: 1, mr: { xs: 0, sm: '0.5em' } }}>
                      <PasswordInput source="password" />
                    </Box>
                    <Box sx={{ flex: 1, ml: { xs: 0, sm: '0.5em' } }}>
                      <PasswordInput source="confirm_password" />
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </SimpleForm>
        </Edit>
      </Box>
    </EditBase>
  );
};

export default UserEdit;
