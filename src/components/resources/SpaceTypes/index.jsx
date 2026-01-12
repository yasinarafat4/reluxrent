/* eslint-disable import/no-anonymous-default-export */
import { Box, useMediaQuery } from '@mui/material';
import { ColumnsButton, CreateButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import SpaceTypeCreate from './SpaceTypeCreate';
import SpaceTypeEdit from './SpaceTypeEdit';
import SpaceTypeListDesktop from './SpaceTypeListDesktop';

const SpaceTypeListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);
const SpaceTypeFilters = [
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

const SpaceTypeTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const SpaceTypeList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

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
        filters={SpaceTypeFilters}
        actions={<SpaceTypeListActions />}
        title={<SpaceTypeTitle />}
      >
        <SpaceTypeListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: SpaceTypeList,
  create: SpaceTypeCreate,
  edit: SpaceTypeEdit,
};
