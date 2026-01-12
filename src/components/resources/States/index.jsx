/* eslint-disable react/jsx-key */
/* eslint-disable import/no-anonymous-default-export */
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useCallback } from 'react';
import { AutocompleteInput, ColumnsButton, CreateButton, FilterButton, List, ReferenceInput, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import StateCreate from './StateCreate';
import StateEdit from './StateEdit';
import StateListDesktop from './StateListDesktop';

const StatListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);
const StatFilters = [
  <SearchInput source="q" alwaysOn />,

  <ReferenceInput source="countryId" reference="countries" filter={{ getAll: true }} sort={{ field: 'name', order: 'ASC' }} alwaysOn>
    <AutocompleteInput
      optionText={(choice) =>
        choice?.id // the empty choice is { id: '' }
          ? `${choice.name}`
          : ''
      }
      sx={{ minWidth: 200 }}
    />
  </ReferenceInput>,

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

const StatsTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const StatList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/states');
  }, [navigate]);

  const match = matchPath('/states/:id', location.pathname);
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
          marginRight: match ? '400px' : 0,
        }}
        filters={StatFilters}
        actions={<StatListActions />}
        title={<StatsTitle />}
      >
        <StateListDesktop selectedRow={match ? parseInt(match.params.id, 10) : undefined} />
      </List>
      <Drawer variant="persistent" open={!!match} anchor="right" onClose={handleClose} sx={{ zIndex: 100 }}>
        {/* To avoid any errors if the route does not match, we don't render at all the component in this case */}
        {!!match && <StateEdit id={match.params.id} onCancel={handleClose} />}
      </Drawer>
    </Box>
  );
};

export default {
  list: StatList,
  create: StateCreate,
};
