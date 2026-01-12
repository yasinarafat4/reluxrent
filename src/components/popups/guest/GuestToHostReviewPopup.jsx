import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Box, Button, DialogActions, DialogTitle, Divider, FormControl, FormHelperText, IconButton, Rating, Stack, TextField, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { mutate } from 'swr';

export default function GuestToHostReviewPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  console.log('GuestToHostReviewPopupData', popupData);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      senderId: popupData?.lastBooking?.guest?.id,
      receiverId: popupData?.lastBooking?.host?.id,
      bookingId: popupData?.lastBooking?.id,
      propertyId: popupData?.lastBooking?.property?.id,
      message: '',
      improveMessage: '',
      secretFeedback: '',
      accuracy: 0,
      accuracyMessage: '',
      amenities: 0,
      amenitiesMessage: '',
      checkin: 0,
      checkinMessage: '',
      cleanliness: 0,
      cleanlinessMessage: '',
      communication: 0,
      communicationMessage: '',
      location: 0,
      locationMessage: '',
      value: 0,
      valueMessage: '',
    },
  });

  const onSubmit = async (formData) => {
    console.log(' Data:', formData);
    try {
      const { data } = await api.post('/api/guest/add-review', formData);
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
          {trans(`Give reviews to`)} {popupData?.lastBooking?.host?.name}
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
          {/* Message */}
          <FormControl fullWidth size="small" margin="dense">
            <Stack mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {trans('Share Your Experience')}
              </Typography>
              <Typography variant="body2" fontSize={13}>
                {trans('Your review will be public on')} {popupData?.lastBooking?.host?.name}'s {trans('profile for future hosts to see')}.
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
            <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{trans("Make sure your review doesn't include personal information (last name, address, contact information, etc.).")}</FormHelperText>
          </FormControl>

          {/* Secret feedback */}
          <FormControl fullWidth size="small" margin="dense">
            <Stack mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {trans('Private Host Feedback')}
              </Typography>
              <Typography variant="body2" fontSize={13}>
                {trans("This feedback is just for the host. We won't make it public.")}
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

          {/* Improve Message */}
          <FormControl fullWidth size="small" margin="dense">
            <Stack mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {trans('How can your host improve?')}
              </Typography>
              <Typography variant="body2" fontSize={13}>
                {trans('Anything your host could do differently to make the next stay perfect?')}
              </Typography>
            </Stack>
            <Controller
              name="improveMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={trans('Improve message')}
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

          {/* Accuracy */}
          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              {trans('Accuracy')}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              {trans('How accurately did the photos & description represent the actual space?')}
            </Typography>
            <Controller
              name="accuracy"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  precision={0.5}
                />
              )}
            />
            <Typography variant="body2" fontSize={13}>
              {trans("Tell this host how they could make their listing page more accurate. We'll send them your suggestions.")}
            </Typography>
            <Controller
              name="accuracyMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label="Write something..."
                  slotProps={{
                    inputLabel: {
                      sx: { fontSize: '14px' },
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          {/* Cleanliness */}
          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              {trans('Cleanliness')}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              {trans('Was the space as clean as you expect a listing to be?')}
            </Typography>
            <Controller
              name="cleanliness"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  precision={0.5}
                />
              )}
            />
            <Typography variant="body2" fontSize={13}>
              {trans("Tell this host how they could improve their cleanliness. We'll send them your suggestions.")}
            </Typography>
            <Controller
              name="cleanlinessMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label="Write something..."
                  slotProps={{
                    inputLabel: {
                      sx: { fontSize: '14px' },
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          {/* Arrival */}
          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              {trans('Arrival')}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              {trans('Did the host do everything within their control to provide you with a smooth arrival process?')}
            </Typography>
            <Controller
              name="checkin"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  precision={0.5}
                />
              )}
            />
            <Typography variant="body2" fontSize={13}>
              {trans("Tell this host how they could make their guest's arrival better. We'll send them your suggestions.")}
            </Typography>
            <Controller
              name="checkinMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label="Write something..."
                  slotProps={{
                    inputLabel: {
                      sx: { fontSize: '14px' },
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          {/* Amenities */}
          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              {trans('Amenities')}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              {trans('Did your host provide everything they promised in their listing description?')}
            </Typography>
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  precision={0.5}
                />
              )}
            />
            <Typography variant="body2" fontSize={13}>
              {trans("Tell this host how they could improve their amenities. We'll send them your suggestions.")}
            </Typography>
            <Controller
              name="amenitiesMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label="Write something..."
                  slotProps={{
                    inputLabel: {
                      sx: { fontSize: '14px' },
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          {/* Communication */}
          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              {trans('Communication')}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              {trans('How responsive and accessible was the host before and during your stay?')}
            </Typography>
            <Controller
              name="communication"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  precision={0.5}
                />
              )}
            />
            <Typography variant="body2" fontSize={13}>
              {trans("Tell this host how they could improve their communication. We'll send them your suggestions.")}
            </Typography>
            <Controller
              name="communicationMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label="Write something..."
                  slotProps={{
                    inputLabel: {
                      sx: { fontSize: '14px' },
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          {/* Location */}
          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              {trans('Location')}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              {trans('How appealing is the neighborhood? Consider safety, convenience, and desirability.')}
            </Typography>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  precision={0.5}
                />
              )}
            />
            <Typography variant="body2" fontSize={13}>
              {trans("Tell this host how they could better describe their location. We'll send them your suggestions.")}
            </Typography>
            <Controller
              name="locationMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label="Write something..."
                  slotProps={{
                    inputLabel: {
                      sx: { fontSize: '14px' },
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          {/* Value */}
          <Box>
            <Typography variant="subtitle1" fontSize={14} fontWeight={600}>
              {trans('Value')}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              {trans('How would you rate the value of the listing?')}
            </Typography>
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={field.value ? Number(field.value) : 0} // ensure number
                  onChange={(_, newValue) => field.onChange(newValue)}
                  precision={0.5}
                />
              )}
            />
            <Typography variant="body2" fontSize={13}>
              {trans("Tell this host how they could improve the value they provide. We'll send them your suggestions.")}
            </Typography>
            <Controller
              name="valueMessage"
              control={control}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  multiline
                  rows={2}
                  fullWidth
                  label="Write something..."
                  slotProps={{
                    inputLabel: {
                      sx: { fontSize: '14px' },
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 2.5, py: 1.5 }}>
        <Button onClick={handleSubmit(onSubmit)} size="small" type="button" sx={{ textTransform: 'none' }} variant="contained">
          {trans('Submit review')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
