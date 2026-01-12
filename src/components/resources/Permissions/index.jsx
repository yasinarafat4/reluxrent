/* eslint-disable import/no-anonymous-default-export */
import { Stack } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { Create, Datagrid, Edit, EditButton, FunctionField, List, ListButton, SimpleForm, TextField, TextInput, TopToolbar } from 'react-admin';
import PermissionEditToolbar from './PermissionEditToolbar';

export const PermissionList = () => (
  <List>
    <Datagrid rowClick={false}>
      <TextField source="id" />
      <TextField source="resource" />
      <TextField source="action" />
      <FunctionField
        label="Edit"
        render={() => (
          <Stack direction="row" gap={1}>
            <EditButton />
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


export const PermissionEdit = () => (
  <Edit actions={<EditAndCreateAction />}>
    <SimpleForm toolbar={<PermissionEditToolbar />}>
      <TextInput source="resource" />
      <TextInput source="action" />
    </SimpleForm>
  </Edit>
);

export const PermissionCreate = () => (
  <Create redirect="list" actions={<EditAndCreateAction />}>
    <SimpleForm>
      <TextInput source="resource" />
      <TextInput source="action" />
    </SimpleForm>
  </Create>
);

export default {
  list: PermissionList,
  edit: PermissionEdit,
  create: PermissionCreate,
};
