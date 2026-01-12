import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chip, Grid, IconButton, Paper } from '@mui/material';
import { Trash2 } from 'lucide-react';

export default function Sortable({ id, src, alt, isFirst, handleDeleteClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <Grid size={{ xs: 6 }} ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <Paper
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: 1, sm: 2 },
          height: { xs: 150, sm: 200, xl: 300 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        elevation={3}
      >
        {isFirst && (
          <Chip
            label="Cover Photo"
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1000,
            }}
          />
        )}
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        <IconButton
          onClick={() => handleDeleteClick(id)}
          sx={{
            position: 'absolute',
            top: 8,
            p: 1,
            right: 8,
            zIndex: 1000,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
            },
            boxShadow: 1,
          }}
          size="small"
        >
          <Trash2 color="red" size={18} />
        </IconButton>
      </Paper>
    </Grid>
  );
}
