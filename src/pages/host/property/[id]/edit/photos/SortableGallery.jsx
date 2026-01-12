import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { mutate } from 'swr';
import Sortable from './Sortable';

export default function SortableGallery({ images, actions }) {
  const { trans, lang } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [activeImage, setActiveImage] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const ref = useRef(null);
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 10 } }));

  const handleDragStart = ({ active }) => {
    const photo = images.find((item) => item.id === active.id);
    const image = document.querySelector(`img[src="${photo?.image}"]`);
    const padding = image?.parentElement ? getComputedStyle(image.parentElement).padding : undefined;
    const { width, height } = image?.getBoundingClientRect() || {};

    if (photo && width && height) {
      setActiveImage({ photo, width, height, padding });
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over.id);

      const orderedImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        id: img.id,
        serial: index + 1,
      }));

      try {
        await api.put(`/api/host/property/${id}/photos/reorder`, { images: orderedImages, propertyId: id });
        mutate(`/api/host/property/${id}?lang=${lang.code}`); // refresh from server
      } catch (error) {
        console.error('Error updating image order:', error);
      }
    }
    setActiveImage(null);
  };

  const handleDeleteClick = (imgId) => {
    setSelectedImageId(imgId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/host/property/delete/image/${selectedImageId}`);
      setOpenDeleteDialog(false);
      mutate(`/api/host/property/${id}?lang=${lang.code}`); // refresh from server
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  return (
    <Box p={2}>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 2, textAlign: 'center' },
          },
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              backgroundColor: '#FFF4E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
          </Box>
        </Box>

        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.4rem', textAlign: 'center', p: 0 }}>Are you sure?</DialogTitle>

        <DialogContent sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
          <Typography>You won't be able to revert this!</Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleConfirmDelete} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Yes, delete it!
          </Button>
          <Button variant="contained" color="error" onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <Box
            ref={ref}
            sx={{
              display: 'grid',
              gap: { xs: 1, sm: 2 },
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
              },
            }}
          >
            {images.map((img, index) => (
              <Sortable key={img.id} id={img.id} src={img.image} alt={img.alt} isFirst={index === 0} handleDeleteClick={handleDeleteClick} />
            ))}

            {/* Add More Box */}
            <Paper
              onClick={() => actions.openPopup('photoUpload', {})}
              sx={{
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: { xs: 1, sm: 2 },
                height: { xs: 150, sm: 200, xl: 300 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              elevation={3}
            >
              <Stack justifyContent="center" alignItems="center">
                <AddIcon />
                <Typography variant="caption">Add more</Typography>
              </Stack>
            </Paper>
          </Box>
        </SortableContext>

        {/* Floating image overlay when dragging */}
        <DragOverlay>
          {activeImage && (
            <Paper
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                width: activeImage.width,
                height: activeImage.height,
                padding: activeImage.padding,
              }}
              elevation={6}
            >
              <img
                src={activeImage.photo.image}
                alt={activeImage.photo.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Paper>
          )}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}
