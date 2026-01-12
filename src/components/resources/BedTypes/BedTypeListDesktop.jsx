import { BulkDeleteButton, DataTable, DateField, DeleteButton, TextField, useCreatePath } from 'react-admin';

export const BedTypeListDesktop = () => {
  // const navigate = useNavigate();
  const createPath = useCreatePath();

  const BedTypeBulkActionButtons = () => (
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
      bulkActionButtons={<BedTypeBulkActionButtons />}
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
      <Column>
        <DeleteButton mutationMode="pessimistic" />
      </Column>
    </Table>
  );
};

export default BedTypeListDesktop;
