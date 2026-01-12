'use client';
import { useAutocompleteSuggestions } from '@/hooks/use-autocomplete-suggestions';
import { useMediaQuery } from '@mui/material';
import { AdvancedMarker, APIProvider, ControlPosition, InfoWindow, Map, MapControl, useAdvancedMarkerRef, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function MapWithAutocomplete() {
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { getValues, setValue, trigger } = useFormContext();
  const [infowindowOpen, setInfowindowOpen] = useState(false);
  const [address, setAddress] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const formLatitude = parseFloat(getValues('latitude'));
  const formLongitude = parseFloat(getValues('longitude'));

  useEffect(() => {
    if (formLatitude && formLongitude) {
      setMarkerPosition({ lat: formLatitude, lng: formLongitude });
      setAddress(getValues('addressLine1'));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(location);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          alert('Unable to access your location. Please enter a location manually.');
        },
      );
    }
  }, [formLatitude, formLongitude]);

  const handleSelectPlace = (event) => {
    const { location } = event;
    const newPosition = { lat: location.lat(), lng: location.lng() };
    setMarkerPosition(newPosition);
    reverseGeocode(newPosition);
  };

  const handleMarkerDragEnd = (event) => {
    const { latLng } = event;
    const newPosition = { lat: latLng.lat(), lng: latLng.lng() };
    setMarkerPosition(newPosition);
    reverseGeocode(newPosition);
  };

  const MemoizedMarker = useMemo(
    () => <AdvancedMarker ref={markerRef} position={markerPosition} draggable onDragEnd={handleMarkerDragEnd} onClick={() => setInfowindowOpen(true)} />,
    [markerPosition],
  );

  const reverseGeocode = async (location) => {
    const geocoder = new google.maps.Geocoder();
    try {
      const { results } = await geocoder.geocode({ location, language: 'en' });

      if (results && results.length > 0) {
        const address = results.find((r) => r.types.includes('street_address')) || results[0];
        let formattedAddress = address?.formatted_address;

        setAddress(formattedAddress);
        setValue('addressLine1', formattedAddress, { shouldValidate: true });
        setValue('latitude', location.lat);
        setValue('longitude', location.lng);
        setInfowindowOpen(true);
      }
    } catch (error) {
      console.error('Error with reverse geocoding:', error);
      alert('Unable to retrieve address details.');
    }
  };

  return (
    <div className="mb-5">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={['places']}>
        {markerPosition && (
          <Map
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
            defaultZoom={16}
            defaultCenter={markerPosition || { lat: 23.8103, lng: 90.4125 }}
            gestureHandling="greedy"
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
            scrollwheel
            disableDefaultUI={false}
            language="en"
            style={{ width: '100%', height: isXs ? '300px' : '500px' }}
            onClick={async (event) => {
              const latLng = event.detail?.latLng || event.latLng; // support both cases
              if (!latLng) return;

              const clickedLocation = {
                lat: typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat,
                lng: typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng,
              };
              setMarkerPosition(clickedLocation);
              await reverseGeocode(clickedLocation);
            }}
          >
            <AutocompleteControl controlPosition={ControlPosition.TOP_LEFT} onPlaceSelect={handleSelectPlace} />

            {MemoizedMarker}

            {infowindowOpen && (
              <InfoWindow anchor={marker} maxWidth={250} onCloseClick={() => setInfowindowOpen(false)}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    color: '#333',
                    maxWidth: '250px',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '4px', color: '#007bff' }}>📍 Location</strong>
                  <span>{address}</span>
                </div>
              </InfoWindow>
            )}

            {markerPosition && <MapController location={markerPosition} />}

            <CurrentLocationControl
              controlPosition={ControlPosition.RIGHT_TOP}
              onLocate={async (location) => {
                setMarkerPosition(location);
                await reverseGeocode(location);
              }}
            />
          </Map>
        )}
      </APIProvider>
    </div>
  );
}

const AutocompleteControl = ({ controlPosition, onPlaceSelect }) => {
  const places = useMapsLibrary('places');
  const sessionTokenRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const { suggestions, isLoading, resetSession } = useAutocompleteSuggestions(query);

  useEffect(() => {
    // debounce and set query
    const handler = setTimeout(() => setQuery(inputValue), 700);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const handleInput = useCallback((event) => {
    setInputValue(event.target.value);
  }, []);

  const handleSuggestionClick = useCallback(
    async (suggestion) => {
      if (!places || !suggestion.placePrediction) return;

      if (!sessionTokenRef.current && places?.AutocompleteSessionToken) {
        sessionTokenRef.current = new places.AutocompleteSessionToken();
      }

      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
        fields: ['location'],
        sessionToken: sessionTokenRef.current,
      });

      setInputValue('');
      resetSession();
      sessionTokenRef.current = null;

      onPlaceSelect(place);
    },
    [places, onPlaceSelect, resetSession],
  );

  return (
    <MapControl position={controlPosition}>
      <div style={{ margin: '10px' }}>
        <input
          value={inputValue}
          onInput={handleInput}
          placeholder="Search for a place"
          style={{
            width: '250px',
            padding: '6px',
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            borderRadius: '12px',
          }}
        />
        {isLoading && <div style={{ background: '#fff', padding: '10px', borderBottom: '1px solid #ccc' }}>Loading...</div>}
        {suggestions.length > 0 && (
          <ul style={{ background: '#fff', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}>
                {suggestion.placePrediction?.text?.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </MapControl>
  );
};

const MapController = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !location) return;

    map.setCenter(location);
    map.setZoom(16);
  }, [map, location]);

  return null;
};

const CurrentLocationControl = ({ controlPosition, onLocate }) => {
  return (
    <MapControl position={controlPosition}>
      <button
        type="button"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                onLocate(location);
              },
              (error) => {
                console.error('Geolocation error:', error);
                alert('Failed to retrieve your current location.');
              },
            );
          } else {
            alert('Geolocation is not supported by your browser.');
          }
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          margin: '10px',
        }}
      >
        📍 Use My Location
      </button>
    </MapControl>
  );
};
