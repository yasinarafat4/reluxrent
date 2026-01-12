/* eslint-disable import/no-anonymous-default-export */
import { Box } from '@mui/material';
import { ColumnsButton, CreateButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import AmenityCreate from './AmenityCreate';
import AmenityEdit from './AmenityEdit';
import AmenityListDesktop from './AmenityListDesktop';

const AmenityListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);
const AmenityFilters = [
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

const AmenityTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const AmenityList = () => {
  // const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  // const location = useLocation();
  // const navigate = useNavigate();

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
        filters={AmenityFilters}
        actions={<AmenityListActions />}
        title={<AmenityTitle />}
      >
        <AmenityListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: AmenityList,
  create: AmenityCreate,
  edit: AmenityEdit,
};
