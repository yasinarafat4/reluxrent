import { FormControl, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material'; // MUI components
import { InputHelperText, useInput } from 'react-admin'; // React Admin hook
import { defaultCountries, FlagImage, parseCountry, usePhoneInput } from 'react-international-phone'; // PhoneInput and utilities
import 'react-international-phone/style.css';

const PhoneInputField = (props) => {
  const { onChange, onBlur, label, helperText, ...rest } = props;

  const {
    field,
    fieldState: { invalid, error },
    isRequired,
  } = useInput({
    onChange,
    onBlur,
    ...rest,
  });

  // React-International-Phone hook to manage phone input and country selection
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } = usePhoneInput({
    defaultCountry: 'us', // Set the default country (this can be dynamic)
    value: field.value, // Bind the field value to react-admin's form state
    countries: defaultCountries, // List of countries available in the input
    onChange: (data) => field.onChange(data.phone), // Update the value in the form when phone number changes
  });
  const requiredLabel = label;
  return (
    <FormControl fullWidth margin="normal">
      <TextField
        {...field}
        required={isRequired}
        error={invalid}
        helperText={helperText !== false || invalid ? <InputHelperText error={error?.message} helperText={helperText} /> : ''}
        variant="outlined"
        label={requiredLabel}
        color="primary"
        value={inputValue}
        onChange={handlePhoneValueChange}
        type="tel"
        inputRef={inputRef}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" style={{ marginRight: '2px', marginLeft: '-8px' }}>
                <Select
                  MenuProps={{
                    style: {
                      height: '300px',
                      width: '360px',
                      top: '10px',
                      left: '-34px',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                  sx={{
                    width: 'max-content',
                    // Remove default outline (display only on focus)
                    fieldset: {
                      display: 'none',
                    },
                    '&.Mui-focused:has(div[aria-expanded="false"])': {
                      fieldset: {
                        display: 'block',
                      },
                    },
                    // Update default spacing
                    '.MuiSelect-select': {
                      padding: '8px',
                      paddingRight: '24px !important',
                    },
                    svg: {
                      right: 0,
                    },
                  }}
                  value={country.iso2}
                  onChange={(e) => setCountry(e.target.value)}
                  renderValue={(value) => <FlagImage iso2={value} style={{ display: 'flex' }} />}
                >
                  {defaultCountries.map((c) => {
                    const country = parseCountry(c);
                    return (
                      <MenuItem key={country.iso2} value={country.iso2}>
                        <FlagImage iso2={country.iso2} style={{ marginRight: '8px' }} />
                        <Typography marginRight="8px">{country.name}</Typography>
                        <Typography color="gray">+{country.dialCode}</Typography>
                      </MenuItem>
                    );
                  })}
                </Select>
              </InputAdornment>
            ),
          },
        }}
      />
    </FormControl>
  );
};

export default PhoneInputField;
