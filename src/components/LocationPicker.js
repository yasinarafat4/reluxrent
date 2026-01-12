'use client';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

const defaultLatLng = { lat: 23.8103, lng: 90.4125 };

const LocationPicker = () => {
  const mapRef = useRef(null);
  const { setValue } = useFormContext();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    const _map = new window.google.maps.Map(mapRef.current, {
      center: defaultLatLng,
      zoom: 17,
      mapId: '6e4bfef8b0e84e2a1c631c71',
      scrollwheel: true,
      gestureHandling: 'greedy',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(_map);

    // Create draggable marker manually
    let position = new window.google.maps.LatLng(defaultLatLng);
    let draggableMarker = new window.google.maps.marker.AdvancedMarkerElement({
      position,
      map: _map,
      title: 'Drag me',
      gmpDraggable: true,
    });

    draggableMarker.addListener('dragend', (event) => {
      const position = draggableMarker.position;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: draggableMarker.position }, (results, status) => {
        if (status === 'OK' && results[0]) {
          console.log('results', results[0]);

          setValue('addressLine1', results[0].formatted_address);
          setValue('country', getAddressComponent(results[0].address_components, ['country']));
          setValue('state', getAddressComponent(results[0].address_components, ['administrative_area_level_1']));
          setValue('city', getAddressComponent(results[0].address_components, ['locality', 'administrative_area_level_3']));
          setValue('postal_code', getAddressComponent(results[0].address_components, ['postal_code']));
        }
      });
      setMarker(position);
    });

    // Autocomplete
    // Create the input card and append to DOM
    const card = document.createElement('div');
    card.id = 'place-autocomplete-card';
    card.style.padding = '5px';
    card.style.background = '#fff';
    card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    card.style.borderRadius = '12px';
    card.style.margin = '10px';

    // Create and configure the autocomplete element
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
    placeAutocomplete.id = 'place-autocomplete-input';
    placeAutocomplete.placeholder = 'Search places';
    placeAutocomplete.style.width = '300px';

    // Append autocomplete to card, card to map
    card.appendChild(placeAutocomplete);
    _map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

    // Info window
    const infoWindow = new google.maps.InfoWindow();

    // Handle place selection
    placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
      const place = placePrediction.toPlace();

      if (place.viewport) {
        _map.fitBounds(place.viewport);
      } else {
        _map.setCenter(place.location);
        _map.setZoom(16);
      }
      draggableMarker.position = place.location;
      setMarker(place.location);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: draggableMarker.position }, (results, status) => {
        if (status === 'OK' && results[0]) {
          console.log('results', results[0]);

          setValue('addressLine1', results[0].formatted_address);
          setValue('country', getAddressComponent(results[0].address_components, ['country']));
          setValue('state', getAddressComponent(results[0].address_components, ['administrative_area_level_1']));
          setValue('city', getAddressComponent(results[0].address_components, ['locality', 'administrative_area_level_3']));
          setValue('postal_code', getAddressComponent(results[0].address_components, ['postal_code']));
        }
      });
    });
  }, [setValue]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '400px', marginTop: '1rem' }} />
    </div>
  );
};

function getAddressComponent(components, types) {
  for (let type of types) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.long_name;
  }
  return '';
}

export default LocationPicker;
