/* eslint-disable import/no-anonymous-default-export */
import { Create, Datagrid, DateField, DeleteButton, Edit, List, Show, ShowButton, SimpleForm, SimpleShowLayout, TextField, UrlField } from 'react-admin';

const extractText = (html, numLines = 3) => {
  if (!html) return ''; // Handle missing or empty content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textContent = doc.body.textContent || doc.body.innerText || '';
  const lines = textContent.split('\n');
  return lines.slice(0, numLines).join('\n');
};

export const FreeTrialList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="service" />
      <TextField source="fileType" />
      <DateField source="createdAt" />
      <ShowButton />
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

export const FreeTrialShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="service" />
      <TextField source="fileType" />
      <TextField source="message" />
      <UrlField source="imageLink" label="Image Link" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </SimpleShowLayout>
  </Show>
);

export const FreeTrialEdit = () => (
  <Edit>
    <SimpleForm></SimpleForm>
  </Edit>
);

export const FreeTrialCreate = () => (
  <Create redirect="list">
    <SimpleForm></SimpleForm>
  </Create>
);

export default {
  list: FreeTrialList,
  show: FreeTrialShow,
};
