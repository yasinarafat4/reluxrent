import AddressAutocomplete from '@/components/AddressAutocomplete';
import Layout from '@/components/layout/front/Layout';
import TinyMCEInputNormal from '@/components/TinyMCEInputNormal';
import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { CameraAlt } from '@mui/icons-material';
import { Avatar, Box, Button, Divider, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useSWR from 'swr';

const profileFields = [
  { name: 'myWork', label: 'My work' },
  { name: 'obsessedWith', label: "I'm obsessed with" },
  { name: 'dreamPlace', label: "Where I've always wanted to go" },
  { name: 'school', label: 'Where I went to school' },
  { name: 'funFact', label: 'My fun fact' },
];

const Profile = () => {
  const { trans } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      address: user?.address,
      about: user?.about,
      myWork: user?.myWork,
      obsessedWith: user?.obsessedWith,
      dreamPlace: user?.dreamPlace,
      school: user?.school,
      funFact: user?.funFact,
      languages: [],
    },
  });

  const { data: languageData = [] } = useSWR(`/api/front/languages`, fetcher);
  console.log('lang', languageData);

  const imageSrc = watch('image');
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setValue('image', user?.image);
    setValue('about', user?.about);
    setValue('address', user?.address);
    setValue('dreamPlace', user?.dreamPlace);
    setValue('funFact', user?.funFact);
    setValue('myWork', user?.myWork);
    setValue('obsessedWith', user?.obsessedWith);
    setValue('school', user?.school);
    setValue('languages', user?.languages || []);
  }, [user, setValue]);

  const handlePlaceSelect = (place) => {
    setValue('address', place.formattedAddress);
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/user/profile', formData);
      enqueueSnackbar(data.message, { variant: 'success' });
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ backgroundColor: 'background.default' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 4, sm: 10 },
              py: { xs: 4, sm: 5 },
              height: '100vh',
              boxSizing: 'border-box',
            }}
          >
            {/* Left Side - Avatar */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar
                alt="image"
                src={imageSrc}
                sx={{
                  width: 200,
                  height: 200,
                  objectFit: 'cover',
                  border: 1,
                  borderColor: '#A270FF',
                }}
              />
              <Button variant="outlined" type="button" size="small" component="label" startIcon={<CameraAlt />} sx={{ mt: 2 }}>
                {trans('Edit')}
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>
            </Box>

            {/* Right Side - Inputs */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
              }}
            >
              <Stack gap={1}>
                <Typography variant="h2">My profile</Typography>
                <Typography variant="body1">Hosts and guests can see your profile and it may appear across Reluxrent to help us build trust in our community. Learn more</Typography>
              </Stack>

              {/* Profile inputs */}
              <Box display={'grid'} gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                {profileFields.map((field) => (
                  <Controller
                    key={field.name}
                    name={field.name}
                    control={control}
                    render={({ field: controllerField }) => <TextField size="small" {...controllerField} fullWidth label={field.label} variant="outlined" />}
                  />
                ))}

                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>Languages I speak</InputLabel>
                  <Controller
                    name="languages"
                    control={control}
                    render={({ field }) => (
                      <Select size="small" multiple {...field} input={<OutlinedInput label="Languages I speak" />}>
                        {languageData.map((language) => (
                          <MenuItem key={language.id} value={language.name}>
                            {language.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Box position="relative">
                      <AddressAutocomplete {...field} label="Enter address" onPlaceSelect={handlePlaceSelect} />
                    </Box>
                  )}
                />
                {/* <Box position={'relative'}>
                  <AddressAutocomplete  onPlaceSelect={handlePlaceSelect} label={'Enter address'} />
                </Box> */}
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* About me */}
              <Stack gap={1}>
                <Typography variant="h3">{trans('About me')}</Typography>
                <Typography variant="body1">{trans('Tell us a little bit about yourself, so your future hosts or guests can get to know you.')}</Typography>
              </Stack>
              <Box>
                {/* <Controller
                  name="about"
                  control={control}
                  render={({ field }) => <TextField size="small" {...field} multiline rows={4} fullWidth label="Share a quirky detail about yourself!" variant="outlined" />}
                /> */}

                <Controller name={'about'} control={control} render={({ field, fieldState }) => <TinyMCEInputNormal {...field} {...fieldState} label={`About`} min_height="100" />} />
              </Box>
            </Box>
          </Box>
          {/* Sticky Bottom Save Button */}
          <Box
            sx={{
              position: 'sticky',
              bottom: { xs: 60, md: 0 },
              left: 0,
              width: '100%',
              bgcolor: 'background.default',
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              zIndex: 1000,
              gap: 2,
              py: 2,
            }}
          >
            <Button type="submit" variant="contained">
              {trans('Save')}
            </Button>
          </Box>
        </form>
      </Box>
    </Layout>
  );
};

export default Profile;
