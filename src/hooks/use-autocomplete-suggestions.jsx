import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';

let debounceTimer;

export function useAutocompleteSuggestions(inputString, requestOptions = {}) {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastRequestedInput = useRef(''); // Track the last requested input to avoid duplicate fetches

  useEffect(() => {
    if (!placesLib) return;

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    // Always normalize input to a string
    const safeInput = inputString ?? '';

    // If input is empty, clear suggestions
    if (safeInput.trim() === '') {
      clearTimeout(debounceTimer);
      if (suggestions.length > 0) setSuggestions([]);
      return;
    }

    // Debounce fetch logic
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      const request = {
        ...requestOptions,
        input: safeInput,
        sessionToken: sessionTokenRef.current,
      };

      // Avoid duplicate fetches for the same input
      if (lastRequestedInput.current === safeInput) return;
      lastRequestedInput.current = safeInput;

      setIsLoading(true);

      AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
        .then((res) => {
          setSuggestions(res.suggestions || []);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching autocomplete suggestions:', error);
          setIsLoading(false);
        });
    }, 300); // ⏱️ Debounce delay (300ms)

    return () => clearTimeout(debounceTimer);
  }, [placesLib, inputString, requestOptions]);

  const resetSession = () => {
    sessionTokenRef.current = null;
    setSuggestions([]);
    lastRequestedInput.current = '';
  };

  return { suggestions, isLoading, resetSession };
}
