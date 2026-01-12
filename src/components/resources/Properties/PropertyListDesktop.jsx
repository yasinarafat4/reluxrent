import { BooleanField, BulkDeleteButton, DataTable, DateField, EditButton, ReferenceField, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';

export const PropertyListDesktop = () => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const PropertyBulkActionButtons = () => (
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
      bulkActionButtons={<PropertyBulkActionButtons />}
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
      <Column source="hostId" label="Host Name">
        <ReferenceField source="hostId" reference="users">
          <TextField source="name" />
        </ReferenceField>
      </Column>
      <Column source="propertyTypeId" label="Property Type">
        <ReferenceField source="propertyTypeId" reference="property-types">
          <TextField source="translations.en.name" />
        </ReferenceField>
      </Column>
      <Column source="spaceTypeId" label="Space Type">
        <ReferenceField source="spaceTypeId" reference="space-types">
          <TextField source="translations.en.name" />
        </ReferenceField>
      </Column>
      <Column
        source="status"
        render={(record) => (
          <span
            style={{
              color: record.status == 'Listed' ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {record.status}
          </span>
        )}
        label="Status"
      />
      <Column source="isApproved" field={BooleanField} />
      <Column source="createdAt" field={DateField} />
      <Column label="Action">
        <EditButton />
      </Column>
    </Table>
  );
};

export default PropertyListDesktop;
