/* eslint-disable import/no-anonymous-default-export */
import TinyMCEInput from '@/components/TinyMCEInput';
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

const TranslationTabs = ({ source }) => {
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
            <TextInput source={`${source}.${lang.code}.title`} label={`Section Title (${lang.name})`} fullWidth validate={[required(), minLength(3)]} />
            <ImageInput source="image" label="Section Image" accept="image/*">
              <ImageField source="src" title="title" />
            </ImageInput>
            <TinyMCEInput source={`${source}.${lang.code}.content`} label={`Section Content (${lang.name})`} fullWidth />
            <NumberInput source="order" label="Order" />
            <BooleanInput source="status" label="Status" />
          </Box>
        ) : null,
      )}
    </>
  );
};

export const ServiceSectionList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="translations.en.title" label="Title (EN)" sortable={false} />
      <ReferenceField source="serviceId" reference="services">
        <TextField source="slug" />
      </ReferenceField>
      <ImageField source="image.src" label="Section Image" />
      <TextField source="order" />
      <BooleanField source="status" label="Status" />
      <EditButton />
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

export const ServiceSectionEdit = () => (
  <Edit>
    <SimpleForm>
      <TranslationTabs source="translations" />
    </SimpleForm>
  </Edit>
);

export const ServiceSectionCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TranslationTabs source="translations" />
    </SimpleForm>
  </Create>
);

export default {
  list: ServiceSectionList,
  edit: ServiceSectionEdit,
  create: ServiceSectionCreate,
};
