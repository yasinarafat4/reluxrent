import { Grid } from '@mui/material';
import { useState } from 'react';
import { SimpleForm, TopToolbar, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const PhotosTabToolbar = () => {
  const {
    getValues,
    handleSubmit,
    formState: { isValid },
  } = useFormContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const record = useRecordContext();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!record) return;

    const formValues = getValues();
    setLoading(true);
    try {
      await dataProvider.update('properties/photos', {
        id: record.id,
        data: {},
      });

      notify('Photos updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating photos', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return <TopToolbar>{/* <SaveButton alwaysEnable type="button" label="Update Photos" onClick={handleSubmit(onSubmit)} disabled={loading} /> */}</TopToolbar>;
};

const ImageList = () => {
  const { watch } = useFormContext();
  const propertyImages = watch('propertyImages');
  console.log('propertyImages', propertyImages);

  return (
    <>
      <Grid container spacing={2}>
        {propertyImages.map((propertyImage, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <img
              src={propertyImage.image}
              alt={`Property ${i}`}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};
const PhotosTab = () => {
  return (
    <SimpleForm toolbar={<PhotosTabToolbar />}>
      <ImageList />
    </SimpleForm>
  );
};

export default PhotosTab;
