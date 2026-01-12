/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import MonacoInput from '@/components/MonacoInput';
import TinyMCEInput from '@/components/TinyMCEInput';
import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
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
  required,
  SimpleForm,
  TextField,
  TextInput,
  useGetList,
  useUnique,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import slugify from 'slugify';

const extractText = (html, numLines = 3) => {
  if (!html) return ''; // Handle missing or empty content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textContent = doc.body.textContent || doc.body.innerText || '';
  const lines = textContent.split('\n');
  return lines.slice(0, numLines).join('\n');
};

const AutoSlugField = ({ source = 'slug', fromLang = 'en' }) => {
  const uniqueSlug = useUnique();
  const { setValue } = useFormContext();

  const slugChanged = useRef(false);
  const titleChanged = useRef(false);
  const mounted = useRef(false);

  const translations = useWatch({ name: 'translations' });
  const title = translations?.[fromLang]?.title || '';

  const prevTitle = useRef(title);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prevTitle.current = title;
      return;
    }

    // Detect actual user change of title
    if (title && title !== prevTitle.current) {
      titleChanged.current = true;
      prevTitle.current = title;
    }

    // Generate slug only if user changed title AND slug was not manually modified
    if (titleChanged.current && !slugChanged.current && title) {
      const gen = slugify(title, { lower: true, strict: true });
      setValue(source, gen);
    }
  }, [title]);

  return <TextInput source={source} label="Slug" fullWidth onChange={() => (slugChanged.current = true)} validate={[required(), uniqueSlug()]} />;
};

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
            <TextInput source={`${source}.${lang.code}.title`} label={`Title (${lang.name})`} fullWidth validate={[required(), minLength(3)]} />
            <AutoSlugField source="slug" fromLang="en" fullWidth />
            <ImageInput source="beforeImage" label="Before Image" accept="image/*">
              <ImageField source="src" title="title" />
            </ImageInput>
            <ImageInput source="afterImage" label="After Image" accept="image/*">
              <ImageField source="src" title="title" />
            </ImageInput>
            <TinyMCEInput source={`${source}.${lang.code}.content`} label={`Content (${lang.name})`} fullWidth />
            <NumberInput source="order" label="Order" />
            <BooleanInput source="status" label="Status" />
            <TextInput source={`${source}.${lang.code}.canonical`} label={`Canonical (${lang.name})`} fullWidth />
            <TextInput source={`${source}.${lang.code}.seoTitle`} label={`Seo Title (${lang.name})`} fullWidth />
            <TextInput multiline source={`${source}.${lang.code}.seoDescription`} label={`Seo Description (${lang.name})`} fullWidth />
            <MonacoInput source={`${source}.${lang.code}.structuredData`} label={`Structured Data (${lang.name})`} />
            <ImageInput source={`${source}.${lang.code}.seoImage`} label="Seo Image" accept="image/*">
              <ImageField source="src" title="title" />
            </ImageInput>
          </Box>
        ) : null,
      )}
    </>
  );
};

export const ServiceList = ({ data }) => {
  console.log('data', data);
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="translations.en.title" label="Title (EN)" sortable={false} />
        <TextField source="slug" />
        <ImageField source="beforeImage.src" label="Before Image" />
        <ImageField source="afterImage.src" label="After Image" />
        <TextField source="order" />
        <BooleanField source="status" label="Status" />
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </Datagrid>
    </List>
  );
};

export const ServiceEdit = () => (
  <Edit>
    <SimpleForm>
      <TranslationTabs form="edit" source="translations" />
    </SimpleForm>
  </Edit>
);

export const ServiceCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TranslationTabs form="create" source="translations" />
    </SimpleForm>
  </Create>
);

export default {
  list: ServiceList,
  edit: ServiceEdit,
  create: ServiceCreate,
};
