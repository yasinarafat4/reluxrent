/* eslint-disable react/jsx-key */
/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useCallback } from 'react';
import { ColumnsButton, CreateButton, ExportButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import StafCreate from './StafCreate';
import StafEdit from './StafEdit';
import StafListDesktop from './StafListDesktop';

const StafListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);
const StafFilters = [
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

const StafTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const StafList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/stafs');
  }, [navigate]);

  const match = matchPath('/stafs/:id', location.pathname);

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'name', 'email', 'phone', 'status', 'role', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Staff Id',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
      role: 'Role',
      createdAt: 'Created At',
    },
    flatten: {
      role: (value) => value?.name || '',
      status: (value) => (value ? 'Active' : 'Inactive'),
    },
    exportAll: true,
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
        filters={StafFilters}
        actions={<StafListActions />}
        title={<StafTitle />}
        exporter={exporter}
      >
        <StafListDesktop selectedRow={match ? parseInt(match.params.id, 10) : undefined} />
      </List>
      <Drawer variant="persistent" open={!!match} anchor="right" onClose={handleClose} sx={{ zIndex: 100 }}>
        {/* To avoid any errors if the route does not match, we don't render at all the component in this case */}
        {!!match && <StafEdit id={match.params.id} onCancel={handleClose} />}
      </Drawer>
    </Box>
  );
};

export default {
  list: StafList,
  create: StafCreate,
};
