// GooglePlacesInput.js
import { FormControl, TextField } from '@mui/material';
import { useEffect, useRef } from 'react';
import { InputHelperText, useInput } from 'react-admin';
import { usePlacesWidget } from 'react-google-autocomplete';
import { useFormContext } from 'react-hook-form';

const GooglePlacesInput = ({ label, source, helperText, country = 'bd', ...props }) => {
  const {
    field,
    fieldState: { invalid, error },
    isRequired,
  } = useInput({ source });

  const { setValue } = useFormContext();
  const inputRef = useRef();

  const getComponent = (components, types) => {
    for (let type of types) {
      const match = components.find((c) => c.types.includes(type));
      if (match) return match.long_name;
    }
    return '';
  };

  const { ref: materialRef } = usePlacesWidget({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    onPlaceSelected: (place) => {
      console.log('place', place);
      const components = place.address_components || [];
      const formattedAddress = place.formatted_address || '';

      const lat = place.geometry?.location?.lat?.();
      const lng = place.geometry?.location?.lng?.();

      const city = getComponent(components, ['locality', 'administrative_area_level_3']);
      const state = getComponent(components, ['administrative_area_level_1']);
      const country = getComponent(components, ['country']);
      const postalCode = getComponent(components, ['postal_code']);

      // Update main field
      field.onChange(formattedAddress);

      // Update other fields in the form
      setValue('city', city);
      setValue('state', state);
      setValue('country', country);
      setValue('latitude', lat);
      setValue('longitude', lng);
      setValue('postal_code', postalCode);
    },
    options: {
      types: ['(cities)'],
    },
  });

  // Sync value into input manually
  useEffect(() => {
    if (inputRef.current && field.value !== inputRef.current.value) {
      inputRef.current.value = field.value || '';
    }
  }, [field.value]);

  return (
    <FormControl fullWidth margin="normal">
      <TextField
        {...props}
        label={label}
        fullWidth
        variant="outlined"
        required={isRequired}
        error={invalid}
        inputRef={(el) => {
          inputRef.current = el;
          materialRef.current = el;
        }}
        helperText={helperText !== false || invalid ? <InputHelperText error={error?.message} helperText={helperText} /> : ''}
      />
    </FormControl>
  );
};

export default GooglePlacesInput;
