import { BulkDeleteButton, DataTable, DateField, ReferenceField, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';
import rowSx from './rowSx';

export const CityListDesktop = ({ selectedRow }) => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const CitiesBulkActionButtons = () => (
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
      bulkActionButtons={<CitiesBulkActionButtons />}
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
      <Column source="countryId" label="Country">
        <ReferenceField source="countryId" reference="countries">
          <TextField source="name" />
        </ReferenceField>
      </Column>
      <Column source="stateId" label="State">
        <ReferenceField source="stateId" reference="states">
          <TextField source="name" />
        </ReferenceField>
      </Column>
      <Column source="latitude" />
      <Column source="longitude" />
      <Column
        source="popularCity"
        render={(record) => (
          <span
            style={{
              color: record.popularCity ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {record.popularCity ? 'Yes' : 'No'}
          </span>
        )}
        label="Popular City"
      />
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

export default CityListDesktop;
