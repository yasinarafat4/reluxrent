import { BulkDeleteButton, DataTable, DateField, EditButton, TextField, useCreatePath } from 'react-admin';

export const AmenitiesTypeListDesktop = () => {
  // const navigate = useNavigate();
  const createPath = useCreatePath();

  const AmenitiesTypeBulkActionButtons = () => (
    <>
      <BulkDeleteButton />
    </>
  );

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      bulkActionButtons={<AmenitiesTypeBulkActionButtons />}
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
      <Column source="order" />
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
      <Column source="createdAt" field={DateField} />
      <Column label="Action">
        <EditButton />
      </Column>
    </Table>
  );
};

export default AmenitiesTypeListDesktop;
