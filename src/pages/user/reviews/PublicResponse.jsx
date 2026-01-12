import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { Box, Button, Stack, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';

const PublicResponse = ({ reviewAbout, setOpenId, mutate }) => {
  const { trans } = useTranslation();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: reviewAbout.id,
      publicResponse: '',
    },
  });

  const onSubmit = async (formData) => {
    try {
      const { data } = await api.post('/api/host/add-public-response', formData);
      enqueueSnackbar(data.message, { variant: 'success' });
      setOpenId(null);
      mutate();
    } catch (error) {
      console.log('Error', err);
    }
    console.log(formData);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} mt={2} maxWidth={600}>
          <Controller
            name="publicResponse"
            control={control}
            rules={{ required: trans("You can't send empty respons!") }}
            render={({ field }) => (
              <TextField
                size="small"
                {...field}
                multiline
                rows={3}
                fullWidth
                placeholder={trans('Write your response...')}
                error={!!errors.publicResponse}
                helperText={errors.publicResponse?.message}
                slotProps={{
                  formHelperText: {
                    sx: {
                      ml: 0,
                    },
                  },
                }}
              />
            )}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              onClick={() => {
                reset();
                setOpenId(null);
              }}
              sx={{
                textTransform: 'none',
                textDecoration: 'underline',
                bgcolor: 'transparent',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {trans('Close')}
            </Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
              {trans('Send')}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default PublicResponse;
