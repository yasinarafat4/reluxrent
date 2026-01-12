/* eslint-disable import/no-anonymous-default-export */
// admin/resources/languages.js
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { ArrowBigLeft } from 'lucide-react';
import { Create, Datagrid, Edit, EditButton, FunctionField, List, ListButton, SimpleForm, TextField, TextInput, TopToolbar } from 'react-admin';

export const LanguageList = () => {
  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'name', 'code', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Id',
      name: 'Name',
      code: 'Code',
      createdAt: 'Created At',
    },
    exportAll: true,
  });

  return (
    <List exporter={exporter}>
      <Datagrid rowClick={false}>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="code" />
        <TextField source="createdAt" />
        <TextField source="updatedAt" />
        <FunctionField label="Action" render={() => <EditButton />} />
      </Datagrid>
    </List>
  );
};

const EditAndCreateAction = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

export const LanguageEdit = () => (
  <Edit actions={<EditAndCreateAction />}>
    <SimpleForm>
      <TextInput source="name" fullWidth />
      <TextInput source="code" fullWidth />
    </SimpleForm>
  </Edit>
);

export const LanguageCreate = () => (
  <Create actions={<EditAndCreateAction />}>
    <SimpleForm>
      <TextInput source="name" fullWidth />
      <TextInput source="code" fullWidth />
    </SimpleForm>
  </Create>
);

export default {
  list: LanguageList,
  edit: LanguageEdit,
  create: LanguageCreate,
};
