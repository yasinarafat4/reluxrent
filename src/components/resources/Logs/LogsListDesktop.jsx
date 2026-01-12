import { DataTable, DateField, FunctionField, ReferenceField, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';

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
    >
      <Column source="id" field={TextField} label="ID" />
      <Column label="User / Admin">
        <FunctionField
          label="User / Admin"
          render={(record) => {
            if (record.userId) {
              return (
                <ReferenceField source="userId" reference="users" link="show">
                  <TextField source="name" />
                </ReferenceField>
              );
            } else if (record.adminId) {
              return (
                <ReferenceField source="adminId" reference="stafs" link="show">
                  <TextField source="name" />
                </ReferenceField>
              );
            } else {
              return '—';
            }
          }}
        />
      </Column>

      <Column source="action" field={TextField} label="Action" />
      <Column source="ipAddress" field={TextField} label="IP" />
      <Column source="userAgent" field={TextField} label="User Agent" />

      <Column
        label="Details"
        render={(row) => {
          try {
            const meta = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta;
            return meta?.details || '-';
          } catch {
            return '-';
          }
        }}
      />
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
