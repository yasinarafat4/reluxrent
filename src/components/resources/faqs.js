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
  FunctionField,
  List,
  Loading,
  minLength,
  NumberInput,
  required,
  SimpleForm,
  TextField,
  TextInput,
  useGetList,
} from 'react-admin';

const extractText = (html, numLines = 3) => {
  if (!html) return ''; // Handle missing or empty content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textContent = doc.body.textContent || doc.body.innerText || '';
  const lines = textContent.split('\n');
  return lines.slice(0, numLines).join('\n');
};

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
            <TextInput source={`${source}.${lang.code}.question`} label={`Question (${lang.name})`} fullWidth validate={[required(), minLength(3)]} />
            <TinyMCEInput source={`${source}.${lang.code}.answer`} label={`Answer (${lang.name})`} fullWidth />
            <NumberInput source="order" label="Order" />
            <BooleanInput source="status" label="Status" />
          </Box>
        ) : null,
      )}
    </>
  );
};

export const FaqList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="translations.en.question" label="Question (EN)" sortable={false} />
      <FunctionField
        label="Answer (EN)"
        render={(record) => extractText(record?.translations?.en?.answer || '', 3)} // Extract and truncate
      />
      <TextField source="order" />
      <BooleanField source="status" label="Status" />
      <EditButton />
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

export const FaqEdit = () => (
  <Edit>
    <SimpleForm>
      <TranslationTabs source="translations" />
    </SimpleForm>
  </Edit>
);

export const FaqCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TranslationTabs source="translations" />
    </SimpleForm>
  </Create>
);

export default {
  list: FaqList,
  edit: FaqEdit,
  create: FaqCreate,
};
