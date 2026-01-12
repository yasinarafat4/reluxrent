import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Plus, Trash, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { mutate } from 'swr';
const MIN_WIDTH = 600;
const MIN_HEIGHT = 400;

const PhotoUploadPopup = ({ showModal, closeModal }) => {
  const { trans, lang } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const handleUploadImage = async () => {
    try {
      setLoading(true);
      const uploadUrl = `/api/host/property/${id}/upload/photos`;
      const swrKey = `/api/host/property/${id}?lang=${lang.code}`;

      const validImages = images.filter((img) => !img.error).map((img) => img.dataUrl);

      const { status, data: response } = await api.put(uploadUrl, { images: validImages });
      // 3️⃣ Update SWR cache with backend response
      if (status === 201 && Array.isArray(response)) {
        // optional revalidation to confirm with backend
        await mutate(swrKey);
        closeModal(true);
      } else {
        // fallback revalidation if backend doesn’t return as expected
        await mutate(swrKey);
        closeModal(true);
      }
    } catch (error) {
      console.error('Error uploading property photos', error);
    } finally {
      setLoading(false);
    }
  };

  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image(); // <-- use window.Image to avoid conflict with next/image
      img.onload = () => {
        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          resolve({
            valid: false,
            message: `Image too small (${img.width}x${img.height}). Minimum ${MIN_WIDTH}x${MIN_HEIGHT}`,
          });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => resolve({ valid: false, message: 'Failed to read image' });
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const newImages = await Promise.all(
      acceptedFiles.map(async (file) => {
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        const { valid, message } = await validateImageDimensions(file);
        return { file, dataUrl, error: valid ? null : message };
      }),
    );

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const onDropRejected = useCallback((fileRejections) => {
    const rejectedImages = fileRejections.map(({ file, errors }) => ({
      file,
      dataUrl: '',
      error: errors.map((e) => e.message).join(', '),
    }));
    setImages((prev) => [...prev, ...rejectedImages]);
  }, []);

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: true,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif'],
    },
  });

  return (
    <Dialog
      sx={{ zIndex: '99999', '& .MuiDialog-paper': { margin: { xs: '10px', md: 0 }, width: '100%' } }}
      disableScrollLock
      open={showModal}
      fullWidth
      maxWidth="sm"
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" p={1}>
        <Button size="small" onClick={closeModal}>
          <X />
        </Button>
        <DialogTitle sx={{ fontSize: { xs: '16px', md: '18px' } }}>{trans('Upload Photos')}</DialogTitle>
        <Button onClick={() => open()} size="small">
          <Plus />
        </Button>
      </Stack>

      <Divider />
      <DialogContent>
        {images.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mb: 2,
            }}
          >
            {images.map((img, index) => (
              <Box key={index} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                {img.dataUrl && <Image src={img.dataUrl} alt="" width={300} height={200} style={{ objectFit: 'cover', width: '100%', height: 200 }} />}

                <IconButton
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    zIndex: 2,
                  }}
                  size="small"
                >
                  <Trash color="red" size={18} />
                </IconButton>

                {img.error && (
                  <Typography color="error" variant="body2" sx={{ mt: 0.5, textAlign: 'center' }}>
                    {img.error}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* {images.length === 0 && ( */}
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            px: 4,
            py: 6,
            textAlign: 'center',
            cursor: 'pointer',
            display: images.length > 0 ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 400,
            mx: 'auto',
          }}
        >
          <input {...getInputProps()} />
          <UploadFileIcon sx={{ fontSize: 50, mb: 1, color: 'action.active' }} />
          <Typography variant="h6" fontWeight={500}>
            {isDragActive ? 'Drop the files here …' : 'Drag and drop'}
          </Typography>
          <Typography variant="body2" mb={2}>
            or browse for photos
          </Typography>
          <Button variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Browse
          </Button>
        </Box>
        {/* )} */}
      </DialogContent>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="flex-end">
          <Button
            onClick={handleUploadImage}
            variant="contained"
            disabled={images.length === 0 || images.some((img) => img.error)}
            loading={loading}
            loadingPosition="end"
            sx={{ textTransform: 'none' }}
          >
            {trans('Upload')}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default PhotoUploadPopup;
