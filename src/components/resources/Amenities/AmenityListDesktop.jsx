import { BulkDeleteButton, DataTable, DateField, EditButton, ImageField, ReferenceField, TextField, useCreatePath } from 'react-admin';

export const AmenityListDesktop = () => {
  // const navigate = useNavigate();
  const createPath = useCreatePath();

  const AmenityBulkActionButtons = () => (
    <>
      <BulkDeleteButton />
    </>
  );

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      bulkActionButtons={<AmenityBulkActionButtons />}
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
      <Column source="amenitiesTypeId">
        <ReferenceField source="amenitiesTypeId" reference="amenity-types">
          <TextField source="translations.en.name" />
        </ReferenceField>
      </Column>
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
      <Column source="createdAt" field={DateField} />
      <Column label="Action">
        <EditButton />
      </Column>
    </Table>
  );
};

export default AmenityListDesktop;
