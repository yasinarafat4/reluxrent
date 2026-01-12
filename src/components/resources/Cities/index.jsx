/* eslint-disable react/jsx-key */
/* eslint-disable import/no-anonymous-default-export */
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { AutocompleteInput, ColumnsButton, CreateButton, FilterButton, List, ReferenceInput, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import CityCreate from './CityCreate';
import CityEdit from './CityEdit';
import CityListDesktop from './CityListDesktop';

const CityListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);

const CountryStateFilter = () => {
  const countryId = useWatch({ name: 'countryId' });
  console.log('countryId', countryId);

  const { setValue } = useFormContext();

  // Reset stateId if country changes
  useEffect(() => {
    setValue('stateId', '');
  }, [countryId, setValue]);

  return (
    <ReferenceInput source="stateId" reference="states" sort={{ field: 'name', order: 'ASC' }} filter={{ countryId, getAll: true }} key={countryId}>
      <AutocompleteInput optionText={(choice) => (choice?.id ? `${choice.name}` : '')} sx={{ minWidth: 200 }} disabled={!countryId} />
    </ReferenceInput>
  );
};
const CityFilters = [
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
  <CountryStateFilter alwaysOn />,
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

const CitiesTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const CityList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/cities');
  }, [navigate]);

  const match = matchPath('/cities/:id', location.pathname);
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
        filters={CityFilters}
        actions={<CityListActions />}
        title={<CitiesTitle />}
      >
        <CityListDesktop selectedRow={match ? parseInt(match.params.id, 10) : undefined} />
      </List>
      <Drawer variant="persistent" open={!!match} anchor="right" onClose={handleClose} sx={{ zIndex: 100 }}>
        {/* To avoid any errors if the route does not match, we don't render at all the component in this case */}
        {!!match && <CityEdit id={match.params.id} onCancel={handleClose} />}
      </Drawer>
    </Box>
  );
};

export default {
  list: CityList,
  create: CityCreate,
};
