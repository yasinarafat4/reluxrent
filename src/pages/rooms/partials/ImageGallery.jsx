'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button } from '@mui/material';
import { Grip } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Video from 'yet-another-react-lightbox/plugins/video';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

const ImageGallery = ({ propertyImages }) => {
  const { trans } = useTranslation();
  const [index, setIndex] = useState(-1);

  if (!propertyImages || propertyImages.length === 0) return null;

  // Sort by serial ascending
  const sortedImages = [...propertyImages].sort((a, b) => a.serial - b.serial);

  // Take only first 5 images
  const limitedImages = sortedImages.slice(0, 5);

  // First image for large left side
  const firstImage = limitedImages[0];

  // Next 4 images for right grid
  const gridImages = limitedImages.slice(1);

  // Lightbox slides for all images
  const slides = propertyImages.map((img) => ({ src: img.image }));

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        height: { xs: 400, sm: 300, lg: 450 },
        width: '100%',
        gap: '4px',
      }}
    >
      {/* Left large image */}
      <div style={{ flex: '1 1 50%', position: 'relative', cursor: 'pointer' }} onClick={() => setIndex(0)}>
        <Image src={firstImage.image || '/images/placeholders/placeholder.jpg'} alt="Main" fill style={{ objectFit: 'cover', borderRadius: 12 }} />
      </div>

      {/* Right 2x2 grid */}
      <Box
        sx={{
          flex: '1 1 50%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '4px',
        }}
      >
        {gridImages.map((img, i) => (
          <Box
            key={img.id}
            onClick={() => setIndex(i + 1)}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Image src={img.image  || '/images/placeholders/placeholder.jpg'} alt={`Image ${i + 2}`} fill style={{ objectFit: 'cover' }} />
          </Box>
        ))}
      </Box>

      <Box sx={{ position: 'absolute', right: 4, bottom: 6 }}>
        <Button onClick={() => setIndex(0)} variant="contained" size="small" sx={{ textTransform: 'none', fontWeight: 600 }} startIcon={<Grip size={15} />}>
          {trans('Show all photos')}
        </Button>
      </Box>
      {/* Lightbox */}
      <Lightbox slides={slides} open={index >= 0} index={index} close={() => setIndex(-1)} plugins={[Fullscreen, Slideshow, Video, Zoom]} />
    </Box>
  );
};

export default ImageGallery;
