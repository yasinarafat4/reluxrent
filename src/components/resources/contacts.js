/* eslint-disable import/no-anonymous-default-export */
import { Create, Datagrid, DateField, DeleteButton, Edit, List, Show, ShowButton, SimpleForm, SimpleShowLayout, TextField } from 'react-admin';

const extractText = (html, numLines = 3) => {
  if (!html) return ''; // Handle missing or empty content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const textContent = doc.body.textContent || doc.body.innerText || '';
  const lines = textContent.split('\n');
  return lines.slice(0, numLines).join('\n');
};

export const ContactList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="subject" />
      <TextField source="message" />
      <DateField source="createdAt" />
      <ShowButton />
      <DeleteButton mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

export const ContactShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="subject" />
      <TextField source="message" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </SimpleShowLayout>
  </Show>
);

export const ContactEdit = () => (
  <Edit>
    <SimpleForm></SimpleForm>
  </Edit>
);

export const ContactCreate = () => (
  <Create redirect="list">
    <SimpleForm></SimpleForm>
  </Create>
);

export default {
  list: ContactList,
  show: ContactShow,
};
