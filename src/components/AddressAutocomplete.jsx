import { useAutocompleteSuggestions } from '@/hooks/use-autocomplete-suggestions';
import { Box, MenuItem, Paper, TextField } from '@mui/material';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Bangladesh bounding box
const bangladeshBounds = {
  north: 26.6345,
  south: 20.7433,
  east: 92.6727,
  west: 88.0844,
};
export default function AddressAutocomplete({ value, onChange, onPlaceSelect, label, slotProps, placeholder }) {
  const places = useMapsLibrary('places');
  const sessionTokenRef = useRef(null);

  // -----
  const [localValue, setLocalValue] = useState('');
  const isControlled = value !== undefined && onChange !== undefined;

  const inputValue = isControlled ? value : localValue;
  const setInputValue = isControlled ? onChange : setLocalValue;
  // -----

  // const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // debounce input → query
  useEffect(() => {
    const handler = setTimeout(() => setQuery(inputValue), 700);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const { suggestions, resetSession } = useAutocompleteSuggestions(query, {
    locationRestriction: bangladeshBounds, // restrict to Bangladesh
  });

  // Handle input change
  const handleInput = useCallback((event) => {
    setInputValue(event.target.value);
    if (event.target.value.trim() !== '') {
      setShowSuggestions(true); // only enable if input is not empty
    }
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    async (suggestion) => {
      if (!places || !suggestion.placePrediction) return;

      if (!sessionTokenRef.current && places?.AutocompleteSessionToken) {
        sessionTokenRef.current = new places.AutocompleteSessionToken();
      }

      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
        fields: ['location', 'formattedAddress', 'displayName'],
        sessionToken: sessionTokenRef.current,
      });

      // ✅ Fill input with the chosen address
      setInputValue(place.formattedAddress || place.displayName || '');

      // ✅ Clear suggestions & hide dropdown
      setQuery('');
      resetSession();
      sessionTokenRef.current = null;
      setShowSuggestions(false);

      // ✅ Notify parent
      if (onPlaceSelect) onPlaceSelect(place);
    },
    [places, onPlaceSelect, resetSession],
  );

  return (
    <>
      {/* <input
        type="text"
        value={inputValue}
        onChange={handleInput}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0px',
          fontSize: '14px',
          border: 0,
          outline: 'none',
        }}
      /> */}

      <TextField value={inputValue || ''} onChange={handleInput} placeholder={placeholder} label={label} size="small" fullWidth sx={{ p: 0, fontSize: 14 }} variant="outlined" slotProps={slotProps} />

      {showSuggestions && suggestions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: { xs: '280px', md: '400px' },
            p: { xs: 1 },
            mt: 0.5,
            maxHeight: { xs: 250, md: 600 },
            overflow: 'hidden',
            zIndex: '99999',
          }}
        >
          {suggestions.map((s, idx) => (
            <MenuItem
              key={idx}
              onClick={() => handleSuggestionClick(s)}
              sx={{
                fontSize: { xs: 12, md: 14 },
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1 },
                bgcolor: 'grey.200',
                py: { xs: 0.5, sm: 1 },
                mb: 0.5,
                borderRadius: { xs: 1 },
                minHeight: { xs: 'unset !important', sm: 600 },
              }}
            >
              <MapPin size={15} />
              <Box
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  p: { xs: 0 },
                  flex: 1, // let text shrink if needed
                }}
              >
                {s.placePrediction.text.text}
              </Box>
            </MenuItem>
          ))}
        </Paper>
      )}
    </>
  );
}
