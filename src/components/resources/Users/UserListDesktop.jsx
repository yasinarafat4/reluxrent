import { Stack } from '@mui/material';
import { DataTable, DateField, EditButton, EmailField, ShowButton, TextField } from 'react-admin';
import rowSx from './rowSx';

export const UserListDesktop = ({ selectedRow }) => {

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      bulkActionButtons={false}
      rowClick={false}
      rowSx={rowSx(selectedRow)}
      sx={{
        '& .RaDataTable-thead': {
          borderLeftColor: 'transparent',
          borderLeftWidth: 5,
          borderLeftStyle: 'solid',
        },
      }}
    >
      <Column source="id" field={TextField} />
      <Column source="name" field={TextField} />
      <Column source="email" field={EmailField} />
      <Column source="phone" field={TextField} />
      <Column
        source="status"
        render={(record) => (
          <span
            style={{
              color: record.isVerified ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {record.isVerified ? 'Verified' : 'Not-Verified'}
          </span>
        )}
        label="Status"
      />
      <Column source="createdAt" field={DateField} />
      <Column label="Actions">
        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <ShowButton />
          <EditButton />
        </Stack>
      </Column>
    </Table>
  );
};

export default UserListDesktop;
