import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Button, DialogActions, DialogTitle, Divider, FormControl, FormHelperText, IconButton, Rating, Stack, TextField, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { mutate } from 'swr';

export default function HostToGuestReviewPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      senderId: popupData?.lastBooking?.host?.id,
      receiverId: popupData?.lastBooking?.guest?.id,
      bookingId: popupData?.lastBooking?.id,
      propertyId: popupData?.lastBooking?.property?.id,
      message: '',
      secretFeedback: '',
      houseRules: 0,
      cleanliness: 0,
      communication: 0,
    },
  });

  const onSubmit = async (formData) => {
    console.log(' Data:', formData);
    try {
      const { data } = await api.post('/api/host/add-review', formData);
      console.log(data);
      mutate(`/api/messages/${popupData?.conversationId}`);
      mutate(`/api/conversations`);
      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '15px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'md'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} pr={1}>
        <DialogTitle sx={{ fontSize: { xs: '14px', md: '17px', fontWeight: 600 } }}>
          {trans(`Give reviews to`)} {popupData?.lastBooking?.guest?.name}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={(theme) => ({
            color: theme.palette.text.primary,
          })}
        >
          <X />
        </IconButton>
      </Stack>
      <Divider />
      <DialogContent sx={{ pt: 0 }}>
        <Stack gap={1}>
          <FormControl fullWidth size="small" margin="dense">
            <Stack mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                Share Your Experience
              </Typography>
              <Typography variant="body2" fontSize={13}>
                Your review will be public on {popupData?.lastBooking?.guest?.name} profile.
              </Typography>
            </Stack>
            <Controller
              name="message"
              control={control}
              rules={{ required: trans('Message is required!') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required={true}
                  label={trans('Message')}
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.message}
                  helperText={errors.message?.message}
                  slotProps={{
                    formHelperText: {
                      sx: { ml: 0 },
                    },
                    inputLabel: {
                      sx: {
                        fontSize: '0.9rem',
                      },
                    },
                  }}
                />
              )}
            />
            <FormHelperText sx={{ mt: 0.5, mx: 0 }}>Make sure your review doesn't include personal information (last name, address, contact information, etc.)</FormHelperText>
          </FormControl>

          <FormControl fullWidth size="small" margin="dense">
            <Stack mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                Private Guest Feedback
              </Typography>
              <Typography variant="body2" fontSize={13}>
                This feedback is just for your guest. We won't make it public.
              </Typography>
            </Stack>
            <Controller
              name="secretFeedback"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={trans('Private feedback')}
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  size="small"
                  slotProps={{
                    inputLabel: {
                      sx: {
                        fontSize: '0.9rem',
                      },
                    },
                  }}
                />
              )}
            />
          </FormControl>

          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              Did the guest leave your space clean?
            </Typography>
            <Controller
              name="cleanliness"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: 'common.black' }} />}
                  precision={0.5}
                />
              )}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              How clearly did the guest communicate their plans, questions, and concerns?
            </Typography>
            <Controller
              name="communication"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: 'common.black' }} />}
                  precision={0.5}
                />
              )}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              Did the guest observe the house rules you provided?
            </Typography>
            <Controller
              name="houseRules"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: 'common.black' }} />}
                  precision={0.5}
                />
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 2.5, py: 1.5 }}>
        <Button sx={{ textTransform: 'none' }} variant="contained" onClick={handleSubmit(onSubmit)} type="button">
          Submit review
        </Button>
      </DialogActions>
    </Dialog>
  );
}
