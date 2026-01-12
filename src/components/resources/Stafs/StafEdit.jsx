import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useState } from 'react';
import { BooleanInput, EditBase, PasswordInput, ReferenceInput, required, SelectInput, SimpleForm, TextInput, useDefaultTitle, useEditContext } from 'react-admin';
import PhoneInputField from '../PhoneInputField';
import StafEditToolbar from './StafEditToolbar';
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

const StafEditTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};
const StafEdit = ({ id, onCancel }) => {
  const [changePassword, setChangePassword] = useState(false);
  return (
    <EditBase id={id} mutationMode="pessimistic">
      <StafEditTitle />
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
        <SimpleForm sx={{ pt: 0, pb: 0 }} toolbar={<StafEditToolbar />}>
          <TextInput source="name" label="Name" fullWidth validate={[required()]} />
          <TextInput source="email" fullWidth validate={[required()]} />
          <div style={{ marginTop: '.5rem', marginBottom: '.5rem' }}>
            <label>
              <input type="checkbox" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)} /> Change Password
            </label>
          </div>

          {changePassword && (
            <>
              <PasswordInput source="newPassword" label="New Password" isRequired validate={(value) => (value?.length < 6 ? 'Password must be at least 6 characters' : undefined)} />
              <PasswordInput
                source="confirmPassword"
                label="Confirm New Password"
                isRequired
                validate={(value, allValues) => (value !== allValues?.newPassword ? 'Passwords do not match' : undefined)}
              />
            </>
          )}
          <PhoneInputField label="Phone" source="phone" fullWidth validate={phoneValidators} />
          <ReferenceInput source="roleId" reference="roles">
            <SelectInput optionText="name" />
          </ReferenceInput>

          <BooleanInput source="status" label="Status" />
        </SimpleForm>
      </Box>
    </EditBase>
  );
};

export default StafEdit;
