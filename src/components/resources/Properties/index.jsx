/* eslint-disable import/no-anonymous-default-export */
import { Box } from '@mui/material';
import { ColumnsButton, CreateButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import PropertyCreate from './PropertyCreate';
import PropertyEdit from './PropertyEdit';
import PropertyListDesktop from './PropertyListDesktop';

const PropertyListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);
const PropertyFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="status"
    choices={[
      { id: 'Listed', name: 'Listed' },
      { id: 'Unlisted', name: 'Unlisted' },
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

const PropertyTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const PropertyList = () => {
  // const exporter = useAdvancedXlsxExporter({
  //   sortBy: 'createdAt',
  //   order: ['id', 'host', 'name', 'propertyType', 'spaceType', 'accommodates', 'status', 'isApproved', 'price', 'cleaningFee', 'guestAfter', 'guestAfterFee', 'createdAt'],
  //   ignore: [],
  //   headers: {
  //     id: 'Property Id',
  //     name: 'Property Name',
  //     host: 'Host Name',
  //     propertyType: 'Property Type',
  //     spaceType: 'Space Type',
  //     accommodates: 'Accommodates',
  //     isApproved: 'Is Approved',
  //     status: 'Property Status',
  //     price: 'Property Price',
  //     cleaningFee: 'Cleaning Fee',
  //     guestAfter: 'Extra Guest After',
  //     guestAfterFee: 'Extra Guest Fee',
  //     status: 'Property Status',
  //   },
  //   format: { price: '৳#,##0.00', cleaningFee: '৳#,##0.00', guestAfterFee: '৳#,##0.00' },
  //   exportAll: true,
  //   flatten: {
  //     host: (value) => value?.name || '',
  //   },
  // });

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <List
        sx={{
          flexGrow: 1,
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
        filters={PropertyFilters}
        actions={<PropertyListActions />}
        title={<PropertyTitle />}
        // exporter={exporter}
      >
        <PropertyListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: PropertyList,
  create: PropertyCreate,
  edit: PropertyEdit,
};
