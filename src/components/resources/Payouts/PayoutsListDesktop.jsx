import { Paper, Stack, TableCell, TableFooter, TableRow, Typography } from '@mui/material';
import { green, orange } from '@mui/material/colors';
import { DataTable, DateField, NumberField, ReferenceField, TextField, useCreatePath, useDataTableDataContext } from 'react-admin';
import { useNavigate } from 'react-router';

const rowSx = () => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Apply border styles based on the review status
  if (record.payoutStatus === 'SENT') {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.payoutStatus === 'PENDING') {
    return {
      ...style,
      borderLeftColor: orange[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  return style;
};

const UserPayoutTableFoot = () => {
  const data = useDataTableDataContext();
  console.log('Foot data', data);

  const totalPaid = data.reduce((sum, r) => sum + (r.payoutStatus === 'SENT' ? r.payoutAmount || 0 : 0), 0);
  const totalDue = data.reduce((sum, r) => sum + (r.payoutStatus === 'PENDING' ? r.payoutAmount || 0 : 0), 0);
  return (
    <TableFooter
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TableRow>
        <TableCell
          variant="footer"
          sx={{
            px: 3,
          }}
        >
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" fontSize={13}>
              <strong>Total Paid:</strong>৳ {totalPaid}
            </Typography>
            <Typography variant="body2" fontSize={13}>
              <strong>Total Due:</strong> ৳ {totalDue}
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

export const PayoutsListDesktop = ({ setPayoutId, setIsDrawerOpen }) => {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Paper elevation={3}>
      <Table
        bulkActionButtons={false}
        foot={UserPayoutTableFoot}
        rowSx={rowSx()}
        rowClick={(id) => {
          setPayoutId(id);
          setIsDrawerOpen(true);
          // Disable the default rowClick
          return false;
        }}
        sx={{
          '& .RaDataTable-thead': {
            borderLeftColor: 'transparent',
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
          },
          width: '100%',
        }}
      >
        {/* ID */}
        <Column source="id" field={TextField} label="ID" />

        {/* User */}
        <Column source="userId" label="User">
          <ReferenceField source="userId" reference="users">
            <TextField source="name" />
          </ReferenceField>
        </Column>

        {/* Booking ID */}
        <Column source="bookingId" label="Booking ID">
          <ReferenceField source="bookingId" reference="bookings">
            <TextField source="id" />
          </ReferenceField>
        </Column>

        {/* Currency */}
        <Column source="currencyId" label="Currency">
          <ReferenceField source="currencyId" reference="currencies">
            <TextField source="name" />
          </ReferenceField>
        </Column>

        {/* Payout Amount */}
        <Column source="payoutAmount">
          <NumberField source="payoutAmount" label="Payout Amount" options={{ style: 'currency', currency: 'BDT' }} />
        </Column>

        {/* Payout Status */}
        <Column
          source="payoutStatus"
          render={(record) => (
            <span
              style={{
                color: record.payoutStatus == 'SENT' ? 'green' : 'orange',
                fontWeight: 'bold',
              }}
            >
              {record.payoutStatus}
            </span>
          )}
          label="Payout Status"
        />

        {/* Payout Date */}
        <Column source="payoutDate" label="Payout Date">
          <DateField source="payoutDate" />
        </Column>

        {/* Created At */}
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
    </Paper>
  );
};

export default PayoutsListDesktop;
