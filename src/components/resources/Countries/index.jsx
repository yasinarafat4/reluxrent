/* eslint-disable import/no-anonymous-default-export */
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useCallback } from 'react';
import { ColumnsButton, CreateButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import CountryCreate from './CountryCreate';
import CountryEdit from './CountryEdit';
import CountryListDesktop from './CountryListDesktop';

const CountryListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);
const CountryFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    alwaysOn
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

const CountriesTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const CountryList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/countries');
  }, [navigate]);

  const match = matchPath('/countries/:id', location.pathname);
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
        filters={CountryFilters}
        actions={<CountryListActions />}
        title={<CountriesTitle />}
      >
        <CountryListDesktop selectedRow={match ? parseInt(match.params.id, 10) : undefined} />
      </List>
      <Drawer variant="persistent" open={!!match} anchor="right" onClose={handleClose} sx={{ zIndex: 100 }}>
        {/* To avoid any errors if the route does not match, we don't render at all the component in this case */}
        {!!match && <CountryEdit id={match.params.id} onCancel={handleClose} />}
      </Drawer>
    </Box>
  );
};

export default {
  list: CountryList,
  create: CountryCreate,
};
