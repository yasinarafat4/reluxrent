import { Stack } from '@mui/material';
import { BulkDeleteButton, DataTable, DateField, DeleteButton, EditButton, ImageField, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';

export const PropertyTypeListDesktop = () => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const PropertyTypeBulkActionButtons = () => (
    <>
      {/* <BulkAcceptButton />
      <BulkRejectButton /> */}
      <BulkDeleteButton />
    </>
  );

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      bulkActionButtons={<PropertyTypeBulkActionButtons />}
      rowClick={false}
      sx={{
        '& .RaDataTable-thead': {
          borderLeftColor: 'transparent',
          borderLeftWidth: 5,
          borderLeftStyle: 'solid',
        },
      }}
    >
      <Column source="id" field={TextField} />
      <Column source="translations.en.name" field={TextField} label="Name (EN)" disableSort={true} />
      <Column
        source="translations.en.description"
        field={TextField}
        label="Description (EN)"
        disableSort={true}
        sx={{
          maxWidth: '18em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      />
      <Column source="icon.src" label="Icon">
        <ImageField
          sx={{
            width: 40,
            height: 40,
            objectFit: 'contain',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
          source="icon.src"
          label="Icon"
        />
      </Column>
      <Column
        source="status"
        render={(record) => (
          <span
            style={{
              color: record.status ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {record.status ? 'Active' : 'Inactive'}
          </span>
        )}
        label="Status"
      />
      <Column source="order" field={TextField} />
      <Column source="createdAt" field={DateField} />
      <Column label="Actions">
        <Stack direction={'row'} gap={1}>
          <EditButton />
          <DeleteButton mutationMode="pessimistic" />
        </Stack>
      </Column>
    </Table>
  );
};

export default PropertyTypeListDesktop;
