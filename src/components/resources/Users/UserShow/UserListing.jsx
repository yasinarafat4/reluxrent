import { Box } from '@mui/material';
import { green, red } from '@mui/material/colors';
import {
  BooleanField,
  ColumnsButton,
  DataTable,
  DateField,
  EditButton,
  FilterButton,
  List,
  ReferenceField,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
  useRecordContext
} from 'react-admin';

const rowSx = () => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Apply border styles based on the review status
  if (record.status === 'Listed' && record.isApproved) {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.status === 'Unlisted' || !record.isApproved) {
    return {
      ...style,
      borderLeftColor: red[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  return style;
};

const UserListingActions = () => (
  <TopToolbar>
    <FilterButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);

const UserListingFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    choices={[
      { id: true, name: 'Active' },
      { id: false, name: 'Inactive' },
    ]}
    optionText={(choice) => (
      <>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: 4,
            mr: 1,
            display: 'inline-block',
          }}
        />
        {choice.name}
      </>
    )}
  />,
];

const UserListing = () => {
  const record = useRecordContext();
  const userId = record?.id;

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <List resource="properties" filter={{ hostId: userId }} filters={UserListingFilters} actions={<UserListingActions />}>
      <Table border={0} bulkActionButtons={false} rowSx={rowSx()} rowClick={false}>
        <Column source="id" field={TextField} label="ID" />
        <Column source="translations.en.name" field={TextField} label="Name (EN)" disableSort={true} />

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

        <Column source="createdAt" label="Created At">
          <DateField
            source="createdAt"
            showTime
            options={{
              hourCycle: 'h12',
            }}
          />
        </Column>
        <Column sx={{ textAlign: 'center' }}>
          <EditButton resource="properties" />
        </Column>
      </Table>
    </List>
  );
};

export default UserListing;
