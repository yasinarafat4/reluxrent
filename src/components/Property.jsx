import { useEffect, useRef, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import PropertyCard from './cards/PropertyCard';

const Property = ({ city }) => {
  const { lang, trans } = useTranslation();

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const [showNavButtons, setShowNavButtons] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(1);

  const { data: properties, isLoading } = useSWR(`/api/front/property-by-city?city=${city.id}&lang=${lang.code}`, fetcher);
  console.log('$properties', properties);

  // Determine number of visible slides based on screen width
  const getSlidesPerView = (width) => {
    if (width >= 1440) return 6; // Changed to match breakpoints
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    return 2;
  };

  // Handle window resize and initial setup
  useEffect(() => {
    const updateSlidesAndNav = () => {
      const newSlidesPerView = getSlidesPerView(window.innerWidth);
      setSlidesPerView(newSlidesPerView);

      if (properties?.length > newSlidesPerView) {
        setShowNavButtons(true);
      } else {
        setShowNavButtons(false);
      }

      // Update swiper if it exists
      if (swiperRef.current) {
        swiperRef.current.update();
      }
    };

    updateSlidesAndNav();
    window.addEventListener('resize', updateSlidesAndNav);
    return () => window.removeEventListener('resize', updateSlidesAndNav);
  }, [properties]);

  if (isLoading || !properties) return null;

  return (
    <Box width={'100%'} sx={{ bgcolor: 'background.default' }}>
      {/* Header */}
      <Box width={'100%'} display="flex" justifyContent="space-between" alignItems="center">
        <Link href={`/search/homes?lat=${city.latitude}&lng=${city.longitude}`} underline="none">
          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              fontSize: { xs: '1rem', md: '1.25rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              transition: 'transform 0.25s ease',
              '&:hover': { color: 'secondary.main' },
            }}
          >
            {`Popular homes in ${city.name}`}
            <ChevronRight size={20} />
          </Typography>
        </Link>

        {/* Custom nav buttons */}
        {showNavButtons && (
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }} gap={1}>
            <IconButton ref={prevRef} size="small">
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton ref={nextRef} size="small">
              <ChevronRight size={20} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Swiper */}
      {properties?.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={slidesPerView}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
            disabledClass: 'swiper-button-disabled',
          }}
          ref={swiperRef}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {properties?.map((property, i) => (
            <SwiperSlide key={i} style={{ height: 'auto' }}>
              <PropertyCard property={property} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Typography py={2} fontWeight={500} color="warning">
          {trans('No properties listed yet!')}
        </Typography>
      )}
    </Box>
  );
};

export default Property;
