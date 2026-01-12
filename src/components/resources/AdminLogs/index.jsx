/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, useMediaQuery } from '@mui/material';
import { AutocompleteInput, ColumnsButton, ExportButton, List, ReferenceInput, SearchInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import LogsListDesktop from './LogsListDesktop';

const LogsListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const LogsTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

const ActivityLogFilter = [
  <SearchInput source="q" alwaysOn />,
  // <ReferenceInput source="userId" reference="users" filter={{ getAll: true }} sort={{ field: 'name', order: 'ASC' }} alwaysOn>
  //   <AutocompleteInput
  //     optionText={(choice) =>
  //       choice?.id // the empty choice is { id: '' }
  //         ? `${choice.name}`
  //         : ''
  //     }
  //     sx={{ minWidth: 200 }}
  //   />
  // </ReferenceInput>,
  <ReferenceInput source="adminId" reference="stafs" filter={{ getAll: true }} sort={{ field: 'name', order: 'ASC' }} alwaysOn>
    <AutocompleteInput
      optionText={(choice) =>
        choice?.id // the empty choice is { id: '' }
          ? `${choice.name}`
          : ''
      }
      sx={{ minWidth: 200 }}
    />
  </ReferenceInput>,
];

export const LogsList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'admin', 'resource', 'resourceId', 'action', 'message', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Log Id',
      admin: 'Staf Name',
      resource: 'Resource',
      resourceId: 'Resource Id',
      action: 'Action',
      message: 'Message',
      createdAt: 'Created At',
    },
    flatten: {
      admin: (value) => value?.name || '',
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
        }}
        actions={<LogsListActions />}
        title={<LogsTitle />}
        filters={ActivityLogFilter}
        exporter={exporter}
      >
        <LogsListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: LogsList,
};
