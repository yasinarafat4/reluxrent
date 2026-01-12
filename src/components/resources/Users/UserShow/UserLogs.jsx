import { Paper, Typography } from '@mui/material';
import { ColumnsButton, DataTable, DateField, ExportButton, List, SearchInput, TextField, TopToolbar, useRecordContext } from 'react-admin';

const UserListingActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const UserLogHistory = () => {
  const record = useRecordContext();
  const meta = typeof record.meta === 'string' ? JSON.parse(record.meta) : record.meta;
  console.log('UserLogHistory', record);

  return (
    // <Box sx={{ p: 2}}>
    //   <Typography>Activety Logs</Typography>
    //   <Typography
    //     variant='body2'

    //   >{meta.details}

    //   </Typography>
    // </Box>
    <Paper
      // elevation={2}
      sx={{
        p: 2,
        mb: 2,
      }}
    >
      <Typography variant="body2">{meta?.details || 'No additional details available.'}</Typography>
    </Paper>
  );
};

const UserLogFilters = [<SearchInput source="q" alwaysOn />];

const UserLogs = () => {
  const record = useRecordContext();
  const userId = record?.id;

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <List resource="logs" filter={{ userId: userId }} filters={UserLogFilters} actions={<UserListingActions />}>
      <Table bulkActionButtons={false} rowClick={'expand'} expand={<UserLogHistory />} expandSingle>
        <Column source="id" field={TextField} label="ID" />
        <Column source="action" field={TextField} label="Action" />
        <Column source="ipAddress" field={TextField} label="IP" />
        <Column source="userAgent" field={TextField} label="User Agent" />
        <Column source="createdAt" label="Created At">
          <DateField
            source="createdAt"
            showTime
            options={{
              hourCycle: 'h12',
            }}
          />
        </Column>
      </Table>
    </List>
  );
};

export default UserLogs;
