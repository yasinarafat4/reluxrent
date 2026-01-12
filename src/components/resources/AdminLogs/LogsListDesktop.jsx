import { Box, Paper, Stack, Typography } from '@mui/material';
import { DataTable, DateField, ReferenceField, TextField, useCreatePath, useRecordContext } from 'react-admin';
import { useNavigate } from 'react-router';

const StafLogHistory = () => {
  const record = useRecordContext();
  console.log('record', record);
  const changes = record.changes;
  return (
    <Box>
      <Paper sx={{ p: 2, overflow: 'auto', mb: 1.5 }}>
        <Stack direction={'row'} alignItems={'center'} gap={0.5}>
          <Typography variant="body2" fontWeight={600}>
            IP Address:
          </Typography>
          <Typography variant="body2">{record.meta.ip}</Typography>
        </Stack>
        <Stack direction={'row'} gap={2}>
          {/* Before JSON */}
          {changes.before && (
            <div style={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom color="error">
                Before
              </Typography>
              <pre
                style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  maxHeight: '400px',
                  fontSize: '13px',
                }}
              >
                {JSON.stringify(changes.before, null, 2)}
              </pre>
            </div>
          )}

          {/* After JSON */}
          {changes.after && (
            <div style={{ flex: 1 }}>
              {record.action != 'create' && (
                <Typography variant="h6" gutterBottom color="success.main">
                  After
                </Typography>
              )}
              <pre
                style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  maxHeight: '400px',
                  fontSize: '13px',
                }}
              >
                {JSON.stringify(changes.after, null, 2)}
              </pre>
            </div>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export const LogsListDesktop = () => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      bulkActionButtons={false}
      sx={{
        '& .RaDataTable-thead': {
          borderLeftColor: 'transparent',
          borderLeftWidth: 5,
          borderLeftStyle: 'solid',
        },
      }}
      rowClick={'expand'}
      expand={<StafLogHistory />}
      expandSingle
    >
      <Column source="id" field={TextField} label="ID" />

      <Column label="Staf Name">
        <ReferenceField source="adminId" reference="stafs">
          <TextField source="name" />
        </ReferenceField>
      </Column>
      <Column source="resource" field={TextField} label="Resource" />
      <Column source="resourceId" field={TextField} label="Resource ID" />
      <Column source="action" field={TextField} label="Action" />
      <Column source="message" field={TextField} label="Message" />
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
  );
};

export default LogsListDesktop;
