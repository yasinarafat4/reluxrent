/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useCallback } from 'react';
import { ColumnsButton, CreateButton, ExportButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import CurrencyCreate from './CurrencyCreate';
import CurrencyEdit from './CurrencyEdit';
import CurrencyListDesktop from './CurrencyListDesktop';

const CurrencyListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);
const CurrencyFilters = [
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

const CurrencyTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const CurrencyList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/currencies');
  }, [navigate]);

  const match = matchPath('/currencies/:id', location.pathname);

  //  "id": 1,
  //             "code": "USD",
  //             "name": "United States Dollar",
  //             "symbol": "$",
  //             "decimalPlaces": 2,
  //             "decimalSeparator": ".",
  //             "thousandSeparator": ",",
  //             "exchangeRate": "1",
  //             "status": true,
  //             "defaultCurrency": false,

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'code', 'name', 'symbol', 'decimalPlaces', 'thousandSeparator', 'exchangeRate', 'status', 'defaultCurrency', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Id',
      code: 'Code',
      name: 'Name',
      symbol: 'Symbol',
      decimalPlaces: 'DecimalPlaces',
      thousandSeparator: 'Thousand Separator',
      exchangeRate: 'Exchange Rate',
      status: 'Status',
      defaultCurrency: 'Is Default',
      createdAt: 'Created At',
    },
    exportAll: true,
    flatten: {
      status: (value) => (value ? 'Active' : 'Not-active'),
      defaultCurrency: (value) => (value ? 'Default' : 'Not-default'),
    },
  });

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
        filters={CurrencyFilters}
        actions={<CurrencyListActions />}
        title={<CurrencyTitle />}
        exporter={exporter}
      >
        <CurrencyListDesktop selectedRow={match ? parseInt(match.params.id, 10) : undefined} />
      </List>
      <Drawer variant="persistent" open={!!match} anchor="right" onClose={handleClose} sx={{ zIndex: 100 }}>
        {/* To avoid any errors if the route does not match, we don't render at all the component in this case */}
        {!!match && <CurrencyEdit id={match.params.id} onCancel={handleClose} />}
      </Drawer>
    </Box>
  );
};

export default {
  list: CurrencyList,
  create: CurrencyCreate,
};
