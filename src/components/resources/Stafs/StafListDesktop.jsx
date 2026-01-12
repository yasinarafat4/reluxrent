import { BulkDeleteButton, DataTable, DateField, EmailField, ReferenceField, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';
import rowSx from './rowSx';

export const StafListDesktop = ({ selectedRow }) => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const StafsBulkActionButtons = () => (
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
      rowClick={(id, resource) => {
        // As we display the edit view in a drawer, we don't want the default rowClick behavior that will scroll to the top of the page
        // So we navigate manually without specifying the _scrollToTop state
        navigate(
          createPath({
            resource,
            id,
            type: 'edit',
          }),
        );
        // Disable the default rowClick behavior
        return false;
      }}
      rowSx={rowSx(selectedRow)}
      bulkActionButtons={<StafsBulkActionButtons />}
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
      <Column source="roleId">
        <ReferenceField source="roleId" reference="roles">
          <TextField source="name" />
        </ReferenceField>
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
      <Column source="createdAt" field={DateField} />
    </Table>
  );
};

export default StafListDesktop;
