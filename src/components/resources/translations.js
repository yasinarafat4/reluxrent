/* eslint-disable import/no-anonymous-default-export */
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, IconButton, TextField as MuiTextField } from '@mui/material';
import { useState } from 'react';
import {
  Button,
  Datagrid,
  DateField,
  Error,
  Filter,
  List,
  Loading,
  SelectInput,
  TextField,
  TopToolbar,
  useGetList,
  useListContext,
  useNotify,
  useRecordContext,
  useRefresh,
  useUpdate,
} from 'react-admin';

const TranslationFilter = (props) => {
  const {
    data: languages,
    isLoading,
    error,
  } = useGetList('languages', {
    sort: { field: 'id', order: 'ASC' },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  // If no languages fetched, fallback to static choices
  const formattedLanguages = languages ? languages.map((lang) => ({ id: lang.code, name: lang.name })) : [];

  return (
    <Filter {...props}>
      <SelectInput source="locale" label="Language" choices={formattedLanguages} alwaysOn />
    </Filter>
  );
};

// Editable Value Field Component
const EditableValueField = () => {
  const record = useRecordContext();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(record?.value || '');
  const [update] = useUpdate();

  const handleSave = async () => {
    await update('translations', { id: record.id, data: { value } });
    setEditing(false);
  };

  if (!record) return null;

  return editing ? (
    <Box display="flex" gap={1}>
      <MuiTextField value={value} onChange={(e) => setValue(e.target.value)} size="small" />
      <IconButton onClick={handleSave} color="primary">
        <SaveIcon />
      </IconButton>
    </Box>
  ) : (
    <span onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
      {value || '[empty]'}
    </span>
  );
};

const SyncTranslationsButton = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { filterValues } = useListContext();
  const handleClick = async () => {
    try {
      const res = await fetch('/api/translations/sync-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale: filterValues.locale || 'en' }),
      });

      const data = await res.json();
      notify(data.message || 'Translations synced', { type: 'info' });
      refresh();
    } catch (err) {
      notify('Sync failed', { type: 'warning' });
    }
  };
  return (
    <Button label="Sync Translations" onClick={handleClick}>
      <SyncIcon />
    </Button>
  );
};

const ListActions = () => (
  <TopToolbar>
    <SyncTranslationsButton />
  </TopToolbar>
);

export const TranslationList = () => (
  <List filters={<TranslationFilter />} actions={<ListActions />} perPage={20}>
    <Datagrid rowClick={false}>
      <TextField source="id" />
      <TextField source="key" />
      <TextField source="locale" />
      <EditableValueField />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);

export default {
  list: TranslationList,
};
