import { FormControl, FormHelperText, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material';
import { getCookie } from 'cookies-next';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { Controller, useWatch } from 'react-hook-form';
import { defaultCountries, FlagImage, parseCountry, usePhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const phoneUtil = PhoneNumberUtil.getInstance();

const PhoneInputField = ({ control, name, label, disabled, helperText = '' }) => {
  const defaultCountry = getCookie('country') || 'bd';

  // Watch current value from react-hook-form
  const watchedValue = useWatch({ control, name });
  const safeValue = typeof watchedValue === 'string' ? watchedValue : '';

  // Use phone input hook with safe string value
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } = usePhoneInput({
    defaultCountry,
    value: safeValue,
    countries: defaultCountries,
  });

  // Phone validation function
  const validatePhone = (phone) => {
    try {
      console.log('p', phone);

      const number = phoneUtil.parse(phone, country.iso2.toUpperCase());
      return phoneUtil.isValidNumber(number) || 'Invalid phone number';
    } catch {
      return 'Invalid phone number';
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      rules={{ validate: validatePhone }}
      render={({ field, fieldState }) => (
        <FormControl fullWidth margin="normal">
          <TextField
            required={true}
            label={label}
            type="tel"
            variant="outlined"
            size="small"
            disabled={disabled}
            inputRef={inputRef}
            value={inputValue}
            sx={{
                  '& .MuiInputLabel-root': {
                    color: 'grey.400',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'common.white',
                  },
                }}
            onChange={(e) => {
              handlePhoneValueChange(e); // updates formatting
              field.onChange(e.target.value); // updates RHF
            }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginRight: '2px', marginLeft: '-8px' }}>
                    <Select
                      value={country.iso2}
                      onChange={(e) => setCountry(e.target.value)}
                      renderValue={(value) => <FlagImage iso2={value} style={{ display: 'flex' }} />}
                      sx={{
                        width: 'max-content',
                        fieldset: { display: 'none' },
                        '.MuiSelect-select': {
                          padding: '8px',
                          paddingRight: '24px !important',
                        },
                        svg: { right: 0 },
                      }}
                    >
                      {defaultCountries.map((c) => {
                        const parsed = parseCountry(c);
                        return (
                          <MenuItem key={parsed.iso2} value={parsed.iso2}>
                            <FlagImage iso2={parsed.iso2} style={{ marginRight: '8px' }} />
                            <Typography marginRight="8px">{parsed.name}</Typography>
                            <Typography color="gray">+{parsed.dialCode}</Typography>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </InputAdornment>
                ),
              },
              formHelperText: {
                sx: { ml: 0 },
              },
              inputLabel: {
                sx: {
                  fontSize: '0.9rem',
                },
              },
            }}
          />
          {helperText && <FormHelperText sx={{ color: 'text.secondary', ml: 0 }}>{helperText}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default PhoneInputField;
