/* eslint-disable react/jsx-key */
/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, useMediaQuery } from '@mui/material';
import { useCallback } from 'react';
import { ColumnsButton, CreateButton, ExportButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import UserCreate from './UserCreate';
import UserEdit from './UserEdit';
import UserListDesktop from './UserListDesktop';
import UserShow from './UserShow';

const UserListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);
const UserFilters = [
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

const UserTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const UserList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate('/users');
  }, [navigate]);

  const match = matchPath('/users/:id', location.pathname);

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt'],
    ignore: [],
    headers: {
      id: 'User Id',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      isVerified: 'Status',
      createdAt: 'Created At',
    },
    flatten: {
      isVerified: (value) => (value ? 'Verified' : 'Not-verified'),
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
        filters={UserFilters}
        actions={<UserListActions />}
        title={<UserTitle />}
        exporter={exporter}
      >
        <UserListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: UserList,
  create: UserCreate,
  edit: UserEdit,
  show: UserShow,
};
