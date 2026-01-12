/* eslint-disable import/no-anonymous-default-export */
import { Stack } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { Fragment } from 'react';
import { CheckboxGroupInput, Create, Datagrid, DeleteWithConfirmButton, Edit, EditButton, FunctionField, List, ListButton, SimpleForm, TextField, TextInput, TopToolbar, useGetList } from 'react-admin';

function groupByResource(permissions) {
  return permissions.reduce((acc, permission) => {
    const key = permission.resource;
    if (!acc[key]) acc[key] = [];
    acc[key].push(permission);
    return acc;
  }, {});
}
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const RoleList = () => (
  <List>
    <Datagrid  rowClick={false}>
      <TextField source="id" />
      <TextField source="name" />

      <FunctionField
        label="Actions"
        render={() => (
          <Stack direction="row" gap={1}>
            <EditButton />
            <DeleteWithConfirmButton />
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

export const RoleEdit = () => {
  const { data: permissions = [], isLoading } = useGetList('permissions', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' },
  });
  const grouped = groupByResource(permissions);
  return (
    <Edit actions={<EditAndCreateAction />}>
      <SimpleForm>
        <TextInput source="name" />
        {!isLoading &&
          Object.entries(grouped).map(([resource, perms]) => (
            <Fragment key={resource}>
              <h3 style={{ marginTop: '1em' }}>{capitalize(resource)}</h3>
              <CheckboxGroupInput
                source="permissions"
                choices={perms.map((p) => ({
                  id: p.id,
                  name: capitalize(p.action),
                }))}
                optionText="name"
                optionValue="id"
                parse={(value) => value?.map((id) => (typeof id === 'object' ? id.id : id))}
                format={(value) => value?.map((permission) => (typeof permission === 'object' ? permission.id : permission))}
              />
            </Fragment>
          ))}
      </SimpleForm>
    </Edit>
  );
};

export const RoleCreate = () => {
  const { data: permissions = [], isLoading } = useGetList('permissions', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'id', order: 'ASC' },
  });

  const grouped = groupByResource(permissions);
  return (
    <Create redirect="list" actions={<EditAndCreateAction />}>
      <SimpleForm>
        <TextInput source="name" />
        {!isLoading &&
          Object.entries(grouped).map(([resource, perms]) => (
            <Fragment key={resource}>
              <h3 style={{ marginTop: '1em' }}>{capitalize(resource)}</h3>
              <CheckboxGroupInput
                source="permissions"
                choices={perms.map((p) => ({
                  id: p.id,
                  name: capitalize(p.action),
                }))}
                optionText="name"
                optionValue="id"
                parse={(value) => value?.map((id) => (typeof id === 'object' ? id.id : id))}
                format={(value) => value?.map((permission) => (typeof permission === 'object' ? permission.id : permission))}
              />
            </Fragment>
          ))}
      </SimpleForm>
    </Create>
  );
};

export default {
  list: RoleList,
  edit: RoleEdit,
  create: RoleCreate,
};
