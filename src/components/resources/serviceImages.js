/* eslint-disable import/no-anonymous-default-export */
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  Error,
  ImageField,
  ImageInput,
  List,
  Loading,
  minLength,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  useGetList,
} from 'react-admin';

const TranslationTabs = ({ form, source }) => {
  const [currentLocale, setCurrentLocale] = useState('en');
  const {
    data: languages,
    isLoading,
    error,
  } = useGetList('languages', {
    sort: { field: 'id', order: 'ASC' },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <>
      <Tabs value={currentLocale} onChange={(e, newValue) => setCurrentLocale(newValue)} sx={{ mb: 2 }}>
        {languages.map((lang) => (
          <Tab key={lang.code} label={lang.name} value={lang.code} />
        ))}
      </Tabs>

      {languages.map((lang) =>
        currentLocale === lang.code ? (
          <Box key={lang.code} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            <ReferenceInput source="serviceId" reference="services">
              <SelectInput optionText="slug" validate={[required()]} />
            </ReferenceInput>
            <TextInput source={`${source}.${lang.code}.title`} label={`Title (${lang.name})`} fullWidth validate={[required(), minLength(3)]} />
            <ImageInput source="beforeImage" label="Before Image" accept="image/*">
              <ImageField source="src" title="title" />
            </ImageInput>
            <ImageInput source="afterImage" label="After Image" accept="image/*">
              <ImageField source="src" title="title" />
            </ImageInput>
            <NumberInput source="order" label="Order" />
            <BooleanInput source="status" label="Status" />
          </Box>
        ) : null,
      )}
    </>
  );
};

export const ServiceImageList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <ReferenceField source="serviceId" reference="services">
        <TextField source="slug" />
      </ReferenceField>
      <TextField source="translations.en.title" label="Title (EN)" sortable={false} />
      <ImageField source="beforeImage.src" label="Before Image" />
      <ImageField source="afterImage.src" label="After Image" />
      <TextField source="order" />
      <BooleanField source="status" label="Status" />
      <EditButton />
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

export const ServiceImageEdit = () => (
  <Edit>
    <SimpleForm>
      <TranslationTabs form="edit" source="translations" />
    </SimpleForm>
  </Edit>
);

export const ServiceImageCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TranslationTabs form="create" source="translations" />
    </SimpleForm>
  </Create>
);

export default {
  list: ServiceImageList,
  edit: ServiceImageEdit,
  create: ServiceImageCreate,
};
