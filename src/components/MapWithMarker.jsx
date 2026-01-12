'use client';
import HorizontalPropertyCard from '@/components/cards/HorizontalPropertyCard';
import { Box } from '@mui/material';
import { AdvancedMarker, InfoWindow, Map } from '@vis.gl/react-google-maps';
import { X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function MapWithMarker({ propertiesData }) {
  const router = useRouter();
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mapRef = useRef(null);

  const center = useMemo(() => {
    if (!router.isReady) return null;
    const { lat, lng } = router.query;
    if (!lat || !lng) return null;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;

    return { lat: latNum, lng: lngNum };
  }, [router.isReady, router.query.lat, router.query.lng]);

  // 2) If no lat/lng in URL, try geolocation once (no hardcoded fallback)
  useEffect(() => {
    if (!router.isReady) return;
    const { lat, lng } = router.query;

    if ((!lat || !lng) && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latStr = pos.coords.latitude.toFixed(6);
          const lngStr = pos.coords.longitude.toFixed(6);
          router.replace({ pathname: router.pathname, query: { ...router.query, lat: latStr, lng: lngStr } }, undefined, { shallow: true });
        },
        () => {
          // Geolocation denied/unavailable: leave map unrendered (no fallback center)
        },
      );
    }
  }, [router.isReady]);

  function handleCameraChange(e) {
    console.log('handleCameraChange', e.map.center);

    const next = e.map.center;
    const latStr = Number(next.lat).toFixed(6);
    const lngStr = Number(next.lng).toFixed(6);

    // Only write if actually changed to prevent loops/jitter
    if (router.query.lat !== latStr || router.query.lng !== lngStr) {
      router.replace({ pathname: router.pathname, query: { ...router.query, lat: latStr, lng: lngStr } }, undefined, { shallow: true });
    }
  }

  let dragTimeout;
  const handleDragEnd = (e) => {
    clearTimeout(dragTimeout);

    dragTimeout = setTimeout(() => {
      const map = e.map;
      const center = map.getCenter();
      const lat = center.lat();
      const lng = center.lng();

      if (Number(router.query.lat) !== lat || Number(router.query.lng) !== lng) {
        router.push({ pathname: router.pathname, query: { ...router.query, lat, lng } }, undefined, { shallow: true });
      }
    }, 200); // 200ms delay
  };

  if (!propertiesData || !center) return null;

  return (
    <Box sx={{ width: '100%', height: '100%', borderRadius: 1.5, overflow: 'hidden' }}>
      <Map
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        defaultZoom={12}
        defaultCenter={center}
        gestureHandling="greedy"
        fullscreenControl={false}
        streetViewControl={false}
        mapTypeControl={false}
        scrollwheel
        disableDefaultUI={false}
        // onCameraChanged={handleCameraChange}
        onDragend={handleDragEnd}
      >
        {propertiesData?.map((property) => {
          const lat = Number(property.propertyAddress?.latitude);
          const lng = Number(property.propertyAddress?.longitude);

          if (!lat || !lng) return null;

          return (
            <AdvancedMarker
              key={property.id}
              position={{ lat, lng }}
              onClick={(e) =>
                setSelectedMarker({
                  property,
                  anchor: e.latLng,
                })
              }
            >
              {/* Custom marker with MUI Box */}
              <Box
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  px: 2,
                  py: 0.7,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                }}
              >
                $20.23
              </Box>
            </AdvancedMarker>
          );
        })}

        {selectedMarker && (
          // <div className="gm-style-iw">
          //   <div className="gm-style-iw-d">

          <InfoWindow
            style={{ padding: '0 !important', margin: '0 !important' }}
            minWidth={300}
            pixelOffset={[0, -30]}
            headerDisabled={true}
            position={selectedMarker.anchor}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <Box position={'relative'}>
              <Box
                onClick={() => setSelectedMarker(null)}
                borderRadius={'50%'}
                p={0.5}
                bgcolor={(theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200')}
                sx={{ cursor: 'pointer' }}
                position={'absolute'}
                zIndex={'1'}
                top={8}
                left={8}
              >
                <X size={18} />
              </Box>
              <HorizontalPropertyCard property={selectedMarker?.property} />
            </Box>
          </InfoWindow>
        )}
      </Map>
    </Box>
  );
}
