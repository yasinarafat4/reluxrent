/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import MonacoInput from '@/components/MonacoInput';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Create,
  Datagrid,
  DateField,
  DeleteButton,
  Edit,
  EditButton,
  Error,
  FunctionField,
  ImageField,
  ImageInput,
  List,
  ListButton,
  Loading,
  minLength,
  required,
  SimpleForm,
  TextField,
  TextInput,
  TopToolbar,
  useGetList,
  useUnique,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import slugify from 'slugify';

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

export const BlogCategoryList = () => (
  <List exporter={false}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="translations.en.title" label="Title (EN)" sortable={false} />
      <TextField source="slug" />
      <DateField source="createdAt" />
      <FunctionField
        label="Actions"
        render={() => (
          <Stack direction="row" gap={1}>
            <EditButton />
            <DeleteButton mutationMode="pessimistic" />
          </Stack>
        )}
      />
    </Datagrid>
  </List>
);

const EditAndCreateAction = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

export const BlogCategoryEdit = () => {
  return (
    <Edit actions={<EditAndCreateAction />}>
      <SimpleForm>
        <TranslationTabs source="translations" />
      </SimpleForm>
    </Edit>
  );
};

export const BlogCategoryCreate = () => (
  <Create redirect="list" actions={<EditAndCreateAction />}>
    <SimpleForm>
      <TranslationTabs source="translations" />
    </SimpleForm>
  </Create>
);

export default {
  list: BlogCategoryList,
  edit: BlogCategoryEdit,
  create: BlogCategoryCreate,
};
